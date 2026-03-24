import isRegexSafe from "safe-regex2";

export const ESCAPE_REGEXP = /[.*+?^${}()|[\]\\]/g;
export const REMOVE_DUPLICATE_SLASHES_REGEXP = /\/\/+/g;

if (!isRegexSafe(ESCAPE_REGEXP)) {
  throw new Error("the ESCAPE_REGEXP is not safe, update this module");
}

if (!isRegexSafe(REMOVE_DUPLICATE_SLASHES_REGEXP)) {
  throw new Error(
    "the REMOVE_DUPLICATE_SLASHES_REGEXP is not safe, update this module",
  );
}

export function escapeRegExp(str: string) {
  return str.replace(ESCAPE_REGEXP, "\\$&");
}

export function removeDuplicateSlashes(path: string) {
  return path.indexOf("//") !== -1
    ? path.replace(REMOVE_DUPLICATE_SLASHES_REGEXP, "/")
    : path;
}

export function trimLastSlash(path: string) {
  if (path.length > 1 && path.charCodeAt(path.length - 1) === 47) {
    return path.slice(0, -1);
  }
  return path;
}

export function trimRegExpStartAndEnd(regexString: string) {
  // removes chars that marks start "^" and end "$" of regexp
  if (regexString.charCodeAt(1) === 94) {
    regexString = regexString.slice(0, 1) + regexString.slice(2);
  }

  if (regexString.charCodeAt(regexString.length - 2) === 36) {
    regexString = regexString.slice(0, regexString.length - 2) +
      regexString.slice(regexString.length - 1);
  }

  return regexString;
}

export function getClosingParenthensePosition(path: string, idx: number) {
  // `path.indexOf()` will always return the first position of the closing parenthese,
  // but it's inefficient for grouped or wrong regexp expressions.
  // see issues #62 and #63 for more info

  let parentheses = 1;

  while (idx < path.length) {
    idx++;

    // ignore skipped chars "\"
    if (path.charCodeAt(idx) === 92) {
      idx++;
      continue;
    }

    if (path.charCodeAt(idx) === 41) {
      parentheses--;
    } else if (path.charCodeAt(idx) === 40) {
      parentheses++;
    }

    if (!parentheses) return idx;
  }

  throw new TypeError('Invalid regexp expression in "' + path + '"');
}
