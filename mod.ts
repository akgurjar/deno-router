/*
  Char codes:
    '!': 33 - !
    '#': 35 - %23
    '$': 36 - %24
    '%': 37 - %25
    '&': 38 - %26
    ''': 39 - '
    '(': 40 - (
    ')': 41 - )
    '*': 42 - *
    '+': 43 - %2B
    ',': 44 - %2C
    '-': 45 - -
    '.': 46 - .
    '/': 47 - %2F
    ':': 58 - %3A
    ';': 59 - %3B
    '=': 61 - %3D
    '?': 63 - %3F
    '@': 64 - %40
    '_': 95 - _
    '~': 126 - ~
*/

import { assert } from "@std/assert";
import isRegexSafe from "safe-regex2";
import deepEqual from "fast-deep-equal";
import { METHOD, type Method } from "@std/http/unstable-method";
// import { prettyPrintTree } from "./lib/pretty-print.ts";
import {
  type Handler,
  type Node,
  NODE_TYPES,
  type ParametricNode,
  type ParentNode,
  type Route,
  StaticNode,
  type WildcardNode,
} from "./lib/node.ts";
import Constrainer from "./lib/constrainer.ts";
// import httpMethodStrategy from "./lib/strategies/http-method.ts";
import { safeDecodeURI, safeDecodeURIComponent } from "./lib/url-sanitizer.ts";
import type * as Router from "./types.d.ts";
import { Context } from "./lib/context.ts";
import { Config } from "./lib/config.ts";
import {
  escapeRegExp,
  getClosingParenthensePosition,
  removeDuplicateSlashes,
  trimLastSlash,
  trimRegExpStartAndEnd,
} from "./lib/utils.ts";

export interface FindResult<T = unknown> {
  handler: Handler;
  store: unknown;
  params: Record<string, T>;
  searchParams?: unknown;
}

const FULL_PATH_REGEXP = /^https?:\/\/.*?\//;
const OPTIONAL_PARAM_REGEXP = /(\/:[^/()]*?)\?(\/?)/;

if (!isRegexSafe(FULL_PATH_REGEXP)) {
  throw new Error("the FULL_PATH_REGEXP is not safe, update this module");
}

if (!isRegexSafe(OPTIONAL_PARAM_REGEXP)) {
  throw new Error("the OPTIONAL_PARAM_REGEXP is not safe, update this module");
}

const HTTP_METHODS = Object.values(METHOD);

export default class MyRouter {
  readonly #config: Config;
  readonly #routes: Route[] = [];
  #trees: Record<string, StaticNode> = {};
  readonly #constrainer: Constrainer;
  constructor(config?: Partial<Config>) {
    this.#config = new Config(config);
    this.#constrainer = new Constrainer(this.#config.constraints);
  }
  on(...args: Router.OnArgs) {
    let [method, path, arg1, arg2, arg3] = args;
    let opts: Router.RouteOptions = {};
    let handler: Handler;
    let store: unknown;
    if (typeof arg1 === "function") {
      if (arg2 !== undefined) {
        store = arg2;
      }
      handler = arg1;
    } else {
      opts = arg1;
      handler = arg2 as Handler;
      if (arg3 !== undefined) {
        store = arg3;
      }
    }
    // path validation
    assert(typeof path === "string", "Path should be a string");
    assert(path.length > 0, "The path could not be empty");
    assert(
      path[0] === "/" || path[0] === "*",
      "The first character of a path should be `/` or `*`",
    );
    // handler validation
    assert(typeof handler === "function", "Handler should be a function");

    // path ends with optional parameter
    const optionalParamMatch = path.match(OPTIONAL_PARAM_REGEXP);
    if (optionalParamMatch) {
      assert(
        path.length ===
          optionalParamMatch.index! + optionalParamMatch[0].length,
        "Optional Parameter needs to be the last parameter of the path",
      );

      const pathFull = path.replace(OPTIONAL_PARAM_REGEXP, "$1$2");
      const pathOptional = path.replace(OPTIONAL_PARAM_REGEXP, "$2") || "/";

      this.on(method, pathFull, opts, handler, store);
      this.on(method, pathOptional, opts, handler, store);
      return;
    }

    const route = path;

    if (this.#config.ignoreDuplicateSlashes) {
      path = removeDuplicateSlashes(path);
    }

    if (this.#config.ignoreTrailingSlash) {
      path = trimLastSlash(path);
    }

    const methods = Array.isArray(method) ? method : [method];
    for (const method of methods) {
      assert(typeof method === "string", "Method should be a string");
      assert(
        HTTP_METHODS.includes(method),
        `Method '${method}' is not an http method.`,
      );
      this.#on(method, path, opts, handler, store, route);
    }
  }
  #on(
    method: Method,
    path: string,
    opts: Router.RouteOptions,
    handler: Handler,
    store: unknown,
    _route?: string,
  ) {
    let constraints = {};
    if (opts.constraints !== undefined) {
      assert(
        typeof opts.constraints === "object" && opts.constraints !== null,
        "Constraints should be an object",
      );
      if (Object.keys(opts.constraints).length !== 0) {
        constraints = opts.constraints;
      }
    }

    this.#constrainer.validateConstraints(constraints);
    // Let the constrainer know if any constraints are being used now
    this.#constrainer.noteUsage(constraints);

    // Boot the tree for this method if it doesn't exist yet
    if (this.#trees[method] === undefined) {
      this.#trees[method] = new StaticNode("/");
    }

    let pattern = path;
    if (pattern === "*" && this.#trees[method].prefix.length !== 0) {
      const currentRoot = this.#trees[method];
      this.#trees[method] = new StaticNode("");
      this.#trees[method].staticChildren["/"] = currentRoot;
    }

    let currentNode: Node = this.#trees[method];
    let parentNodePathIndex = (currentNode as StaticNode).prefix.length;

    const params = [];
    for (let i = 0; i <= pattern.length; i++) {
      if (pattern.charCodeAt(i) === 58 && pattern.charCodeAt(i + 1) === 58) {
        // It's a double colon
        i++;
        continue;
      }

      const isParametricNode = pattern.charCodeAt(i) === 58 &&
        pattern.charCodeAt(i + 1) !== 58;
      const isWildcardNode = pattern.charCodeAt(i) === 42;

      if (
        isParametricNode || isWildcardNode ||
        (i === pattern.length && i !== parentNodePathIndex)
      ) {
        let staticNodePath = pattern.slice(parentNodePathIndex, i);
        if (!this.#config.caseSensitive) {
          staticNodePath = staticNodePath.toLowerCase();
        }
        staticNodePath = staticNodePath.replaceAll("::", ":");
        staticNodePath = staticNodePath.replaceAll("%", "%25");
        // add the static part of the route to the tree
        currentNode = (currentNode as ParentNode).createStaticChild(
          staticNodePath,
        ) as StaticNode;
      }

      if (isParametricNode) {
        let isRegexNode = false;
        let isParamSafe = true;
        let backtrack = "";
        const regexps = [];

        let lastParamStartIndex = i + 1;
        for (let j = lastParamStartIndex;; j++) {
          const charCode = pattern.charCodeAt(j);

          const isRegexParam = charCode === 40;
          const isStaticPart = charCode === 45 || charCode === 46;
          const isEndOfNode = charCode === 47 || j === pattern.length;

          if (isRegexParam || isStaticPart || isEndOfNode) {
            const paramName = pattern.slice(lastParamStartIndex, j);
            params.push(paramName);

            isRegexNode = isRegexNode || isRegexParam || isStaticPart;

            if (isRegexParam) {
              const endOfRegexIndex = getClosingParenthensePosition(pattern, j);
              const regexString = pattern.slice(j, endOfRegexIndex + 1);

              if (!this.#config.allowUnsafeRegex) {
                assert(
                  isRegexSafe(new RegExp(regexString)),
                  `The regex '${regexString}' is not safe!`,
                );
              }

              regexps.push(trimRegExpStartAndEnd(regexString));

              j = endOfRegexIndex + 1;
              isParamSafe = true;
            } else {
              regexps.push(
                isParamSafe ? "(.*?)" : `(${backtrack}|(?:(?!${backtrack}).)*)`,
              );
              isParamSafe = false;
            }

            const staticPartStartIndex = j;
            for (; j < pattern.length; j++) {
              const charCode = pattern.charCodeAt(j);
              if (charCode === 47) break;
              if (charCode === 58) {
                const nextCharCode = pattern.charCodeAt(j + 1);
                if (nextCharCode === 58) j++;
                else break;
              }
            }

            let staticPart = pattern.slice(staticPartStartIndex, j);
            if (staticPart) {
              staticPart = staticPart.replaceAll("::", ":");
              staticPart = staticPart.replaceAll("%", "%25");
              regexps.push(backtrack = escapeRegExp(staticPart));
            }

            lastParamStartIndex = j + 1;

            if (
              isEndOfNode || pattern.charCodeAt(j) === 47 ||
              j === pattern.length
            ) {
              const nodePattern = isRegexNode ? "()" + staticPart : staticPart;
              const nodePath = pattern.slice(i, j);

              pattern = pattern.slice(0, i + 1) + nodePattern +
                pattern.slice(j);
              i += nodePattern.length;

              const regex = isRegexNode
                ? new RegExp("^" + regexps.join("") + "$")
                : null;
              currentNode = (currentNode as StaticNode).createParametricChild(
                regex,
                staticPart || null,
                nodePath,
              );
              parentNodePathIndex = i + 1;
              break;
            }
          }
        }
      } else if (isWildcardNode) {
        // add the wildcard parameter
        params.push("*");
        currentNode = (currentNode as StaticNode).createWildcardChild();
        parentNodePathIndex = i + 1;

        if (i !== pattern.length - 1) {
          throw new Error("Wildcard must be the last character in the route");
        }
      }
    }

    if (!this.#config.caseSensitive) {
      pattern = pattern.toLowerCase();
    }

    if (pattern === "*") {
      pattern = "/*";
    }

    for (const existRoute of this.#routes) {
      const routeConstraints = existRoute.opts.constraints || {};
      if (
        existRoute.method === method &&
        existRoute.pattern === pattern &&
        deepEqual(routeConstraints, constraints)
      ) {
        throw new Error(
          `Method '${method}' already declared for route '${pattern}' with constraints '${
            JSON.stringify(constraints)
          }'`,
        );
      }
    }

    const route: Route = {
      method,
      path,
      pattern,
      params,
      opts,
      handler,
      store,
    };
    this.#routes.push(route);
    currentNode.addRoute(route, this.#constrainer);
  }
  hasRoute(method: Method, path: string, constraints: Router.Constraints) {
    const route = this.findNode(method, path, constraints);
    return route !== null;
  }
  findNode(method: Method, path: string, constraints: Router.Constraints = {}) {
    if (this.#trees[method] === undefined) {
      return null;
    }

    let pattern = path;

    let currentNode: Node | null = this.#trees[method];
    let parentNodePathIndex = (currentNode as StaticNode).prefix.length;

    const params = [];
    for (let i = 0; i <= pattern.length; i++) {
      if (pattern.charCodeAt(i) === 58 && pattern.charCodeAt(i + 1) === 58) {
        // It's a double colon
        i++;
        continue;
      }

      const isParametricNode = pattern.charCodeAt(i) === 58 &&
        pattern.charCodeAt(i + 1) !== 58;
      const isWildcardNode = pattern.charCodeAt(i) === 42;

      if (
        isParametricNode || isWildcardNode ||
        (i === pattern.length && i !== parentNodePathIndex)
      ) {
        let staticNodePath = pattern.slice(parentNodePathIndex, i);
        if (!this.#config.caseSensitive) {
          staticNodePath = staticNodePath.toLowerCase();
        }
        staticNodePath = staticNodePath.replaceAll("::", ":");
        staticNodePath = staticNodePath.replaceAll("%", "%25");
        // add the static part of the route to the tree
        currentNode = (currentNode as ParentNode).getStaticChild(
          staticNodePath,
        );
        if (currentNode === null) {
          return null;
        }
      }

      if (isParametricNode) {
        let isRegexNode = false;
        let isParamSafe = true;
        let backtrack = "";
        const regexps = [];

        let lastParamStartIndex = i + 1;
        for (let j = lastParamStartIndex;; j++) {
          const charCode = pattern.charCodeAt(j);

          const isRegexParam = charCode === 40;
          const isStaticPart = charCode === 45 || charCode === 46;
          const isEndOfNode = charCode === 47 || j === pattern.length;

          if (isRegexParam || isStaticPart || isEndOfNode) {
            const paramName = pattern.slice(lastParamStartIndex, j);
            params.push(paramName);

            isRegexNode = isRegexNode || isRegexParam || isStaticPart;

            if (isRegexParam) {
              const endOfRegexIndex = getClosingParenthensePosition(pattern, j);
              const regexString = pattern.slice(j, endOfRegexIndex + 1);

              if (!this.#config.allowUnsafeRegex) {
                assert(
                  isRegexSafe(new RegExp(regexString)),
                  `The regex '${regexString}' is not safe!`,
                );
              }

              regexps.push(trimRegExpStartAndEnd(regexString));

              j = endOfRegexIndex + 1;
              isParamSafe = false;
            } else {
              regexps.push(
                isParamSafe ? "(.*?)" : `(${backtrack}|(?:(?!${backtrack}).)*)`,
              );
              isParamSafe = false;
            }

            const staticPartStartIndex = j;
            for (; j < pattern.length; j++) {
              const charCode = pattern.charCodeAt(j);
              if (charCode === 47) break;
              if (charCode === 58) {
                const nextCharCode = pattern.charCodeAt(j + 1);
                if (nextCharCode === 58) j++;
                else break;
              }
            }

            let staticPart = pattern.slice(staticPartStartIndex, j);
            if (staticPart) {
              staticPart = staticPart.replaceAll("::", ":");
              staticPart = staticPart.replaceAll("%", "%25");
              regexps.push(backtrack = escapeRegExp(staticPart));
            }

            lastParamStartIndex = j + 1;

            if (
              isEndOfNode || pattern.charCodeAt(j) === 47 ||
              j === pattern.length
            ) {
              const nodePattern = isRegexNode ? "()" + staticPart : staticPart;
              const nodePath = pattern.slice(i, j);

              pattern = pattern.slice(0, i + 1) + nodePattern +
                pattern.slice(j);
              i += nodePattern.length;

              const regex = isRegexNode
                ? new RegExp("^" + regexps.join("") + "$")
                : null;
              currentNode = (currentNode as StaticNode).getParametricChild(
                regex,
                staticPart || null,
                nodePath,
              );
              if (currentNode === null) {
                return null;
              }
              parentNodePathIndex = i + 1;
              break;
            }
          }
        }
      } else if (isWildcardNode) {
        // add the wildcard parameter
        params.push("*");
        currentNode = (currentNode as StaticNode).getWildcardChild();

        parentNodePathIndex = i + 1;

        if (i !== pattern.length - 1) {
          throw new Error("Wildcard must be the last character in the route");
        }
      }
    }

    if (!this.#config.caseSensitive) {
      pattern = pattern.toLowerCase();
    }

    for (const existRoute of this.#routes) {
      const routeConstraints = existRoute.opts.constraints || {};
      if (
        existRoute.method === method &&
        existRoute.pattern === pattern &&
        deepEqual(routeConstraints, constraints)
      ) {
        return {
          handler: existRoute.handler,
          store: existRoute.store,
          params: existRoute.params,
        };
      }
    }

    return null;
  }
  hasConstraintStrategy(strategyName: string) {
    return this.#constrainer.hasConstraintStrategy(strategyName);
  }
  addConstraintStrategy(strategy: Router.ConstraintStrategy) {
    this.#constrainer.addConstraintStrategy(strategy);
    this.#rebuild(this.#routes);
  }
  reset() {
    this.#trees = {};
    this.#routes.length = 0;
  }
  off(method: Method, path: string, constraints: Router.Constraints) {
    // path validation
    assert(typeof path === "string", "Path should be a string");
    assert(path.length > 0, "The path could not be empty");
    assert(
      path[0] === "/" || path[0] === "*",
      "The first character of a path should be `/` or `*`",
    );
    // options validation
    assert(
      typeof constraints === "undefined" ||
        (typeof constraints === "object" && !Array.isArray(constraints) &&
          constraints !== null),
      "Constraints should be an object or undefined.",
    );

    // path ends with optional parameter
    const optionalParamMatch = path.match(OPTIONAL_PARAM_REGEXP);
    if (optionalParamMatch) {
      assert(
        path.length ===
          optionalParamMatch.index! + optionalParamMatch[0].length,
        "Optional Parameter needs to be the last parameter of the path",
      );

      const pathFull = path.replace(OPTIONAL_PARAM_REGEXP, "$1$2");
      const pathOptional = path.replace(OPTIONAL_PARAM_REGEXP, "$2");

      this.off(method, pathFull, constraints);
      this.off(method, pathOptional, constraints);
      return;
    }

    if (this.#config.ignoreDuplicateSlashes) {
      path = removeDuplicateSlashes(path);
    }

    if (this.#config.ignoreTrailingSlash) {
      path = trimLastSlash(path);
    }

    const methods = Array.isArray(method) ? method : [method];
    for (const method of methods) {
      this.#off(method, path, constraints);
    }
  }

  #off(method: Method, path: string, constraints: Router.Constraints) {
    // method validation
    assert(typeof method === "string", "Method should be a string");
    assert(
      HTTP_METHODS.includes(method),
      `Method '${method}' is not an http method.`,
    );

    function matcherWithoutConstraints(route: Route) {
      return method !== route.method || path !== route.path;
    }

    function matcherWithConstraints(route: Route) {
      return matcherWithoutConstraints(route) ||
        !deepEqual(constraints, route.opts.constraints || {});
    }

    const predicate = constraints
      ? matcherWithConstraints
      : matcherWithoutConstraints;

    // Rebuild tree without the specific route
    const newRoutes = this.#routes.filter(predicate);
    this.#rebuild(newRoutes);
  }

  async lookup(req: Request) {
    const constraints = await this.#constrainer.deriveConstraints(req);
    const handle = this.find(
      req.method as Method,
      req.url,
      constraints,
    );
    const ctx = new Context(req, handle?.params ?? Object.create(null));
    return await this.callHandler(handle, ctx);
  }

  async callHandler(
    handle: FindResult<string> | null,
    ctx: Context,
  ) {
    if (!handle) {
      return await this.#defaultRoute(ctx);
    }
    return await handle.handler(ctx);
  }

  find(
    method: Method,
    path: string,
    derivedConstraints: Record<string, unknown>,
  ) {
    let currentNode: StaticNode | ParametricNode | WildcardNode =
      this.#trees[method];
    if (currentNode === undefined) return null;

    if (path.charCodeAt(0) !== 47) { // 47 is '/'
      path = path.replace(FULL_PATH_REGEXP, "/");
    }

    // This must be run before sanitizeUrl as the resulting function
    // .sliceParameter must be constructed with same URL string used
    // throughout the rest of this function.
    if (this.#config.ignoreDuplicateSlashes) {
      path = removeDuplicateSlashes(path);
    }

    let sanitizedUrl;
    let querystring;
    let shouldDecodeParam;

    try {
      sanitizedUrl = safeDecodeURI(path, this.#config.useSemicolonDelimiter);
      path = sanitizedUrl.path;
      querystring = sanitizedUrl.querystring;
      shouldDecodeParam = sanitizedUrl.shouldDecodeParam;
    } catch (err) {
      console.error(err);
      return this.#onBadUrl(path);
    }

    if (this.#config.ignoreTrailingSlash) {
      path = trimLastSlash(path);
    }

    const originPath = path;

    if (this.#config.caseSensitive === false) {
      path = path.toLowerCase();
    }

    const maxParamLength = this.#config.maxParamLength;

    let pathIndex = currentNode.prefix.length;
    const params = [];
    const pathLen = path.length;

    const brothersNodesStack: {
      paramsCount: number;
      brotherPathIndex: number;
      brotherNode: Node;
    }[] = [];

    while (true) {
      if (pathIndex === pathLen && currentNode.isLeafNode) {
        const handle = currentNode.handlerStorage?.getMatchingHandler(
          derivedConstraints,
        );
        if (handle) {
          return {
            handler: handle.handler,
            store: handle.store,
            params: handle._createParamsObject(params),
            searchParams: this.#config.querystringParser(querystring),
          } as unknown as FindResult<string>;
        }
      }

      let node = currentNode.getNextNode(
        path,
        pathIndex,
        brothersNodesStack,
        params.length,
      );

      if (node === null) {
        if (brothersNodesStack.length === 0) {
          return null;
        }

        const brotherNodeState = brothersNodesStack.pop();
        pathIndex = brotherNodeState!.brotherPathIndex;
        params.splice(brotherNodeState!.paramsCount);
        node = brotherNodeState!.brotherNode as ParentNode;
      }

      currentNode = node as StaticNode | ParametricNode | WildcardNode;

      // static route
      if (currentNode.kind === NODE_TYPES.STATIC) {
        pathIndex += (currentNode as StaticNode).prefix.length;
        continue;
      }

      if (currentNode.kind === NODE_TYPES.WILDCARD) {
        let param = originPath.slice(pathIndex);
        if (shouldDecodeParam) {
          param = safeDecodeURIComponent(param);
        }

        params.push(param);
        pathIndex = pathLen;
        continue;
      }

      // parametric node
      let paramEndIndex = originPath.indexOf("/", pathIndex);
      if (paramEndIndex === -1) {
        paramEndIndex = pathLen;
      }

      let param = originPath.slice(pathIndex, paramEndIndex);
      if (shouldDecodeParam) {
        param = safeDecodeURIComponent(param);
      }

      if ((currentNode as ParametricNode).isRegex) {
        const matchedParameters = (currentNode as ParametricNode).regex?.exec(
          param,
        );
        if (!matchedParameters) continue;

        for (let i = 1; i < matchedParameters.length; i++) {
          const matchedParam = matchedParameters[i];
          if (matchedParam.length > maxParamLength) {
            return null;
          }
          params.push(matchedParam);
        }
      } else {
        if (param.length > maxParamLength) {
          return null;
        }
        params.push(param);
      }

      pathIndex = paramEndIndex;
    }
  }

  #rebuild(routes: Route[]) {
    this.reset();

    for (const route of routes) {
      const { method, path, opts, handler, store } = route;
      this.#on(method, path, opts, handler, store);
    }
  }

  #defaultRoute(ctx: Context) {
    const defaultRoute = this.#config.defaultRoute;
    if (defaultRoute) {
      return defaultRoute(ctx);
    }
    return new Response("404: Page Not Found", { status: 404 });
  }

  #onBadUrl(_path: string) {
    const onBadUrl = this.#config.onBadUrl;
    if (!onBadUrl) {
      return null;
    }
    return {
      handler: onBadUrl,
      params: {},
      store: null,
    } as unknown as FindResult<string>;
  }
  //   prettyPrint(options: Router.RouteOptions = {}) {
  //     const method = options.method;

  //     options.buildPrettyMeta = this.#config.buildPrettyMeta.bind(this);

  //     let tree = null;
  //     if (method === undefined) {
  //       const { version, host, ...constraints } = this.#constrainer.strategies;
  //       constraints[httpMethodStrategy.name] = httpMethodStrategy;

  //       const mergedRouter = new MyRouter({ ...this.#config, constraints });
  //       const mergedRoutes = this.#routes.map((route): Route => {
  //         const constraints = {
  //           ...route.opts.constraints,
  //           [httpMethodStrategy.name]: route.method,
  //         };
  //         return { ...route, method: "MERGED", opts: { constraints } };
  //       });
  //       mergedRouter.#rebuild(mergedRoutes);
  //       tree = mergedRouter.#trees.MERGED;
  //     } else {
  //       tree = this.#trees[method];
  //     }

  //     if (tree == null) return "(empty tree)";
  //     return prettyPrintTree(tree, options);
  //   }
  get(...args: Router.OnMethodArgs) {
    this.on(METHOD.Get, ...args);
  }
  post(...args: Router.OnMethodArgs) {
    this.on(METHOD.Post, ...args);
  }
  put(...args: Router.OnMethodArgs) {
    this.on(METHOD.Put, ...args);
  }
  delete(...args: Router.OnMethodArgs) {
    this.on(METHOD.Delete, ...args);
  }
  patch(...args: Router.OnMethodArgs) {
    this.on(METHOD.Patch, ...args);
  }
  head(...args: Router.OnMethodArgs) {
    this.on(METHOD.Head, ...args);
  }
  options(...args: Router.OnMethodArgs) {
    this.on(METHOD.Options, ...args);
  }
  trace(...args: Router.OnMethodArgs) {
    this.on(METHOD.Trace, ...args);
  }
  connect(...args: Router.OnMethodArgs) {
    this.on(METHOD.Connect, ...args);
  }
  all(...args: Router.OnMethodArgs) {
    this.on(HTTP_METHODS, ...args);
  }
}

// Router.prototype.all = function (path, handler, store) {
//   this.on(httpMethods, path, handler, store);
// };

// Router.sanitizeUrlPath = function sanitizeUrlPath(url, useSemicolonDelimiter) {
//   const decoded = safeDecodeURI(url, useSemicolonDelimiter);
//   if (decoded.shouldDecodeParam) {
//     return safeDecodeURIComponent(decoded.path);
//   }
//   return decoded.path;
// };

// Router.removeDuplicateSlashes = removeDuplicateSlashes;
// Router.trimLastSlash = trimLastSlash;
