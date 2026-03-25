import type { Method } from "@std/http/unstable-method";
import type { RouteOptions } from "../types.d.ts";
import type Constrainer from "./constrainer.ts";
import type { Context } from "./context.ts";
import HandlerStorage from "./handler-storage.ts";

export const NODE_TYPES = {
  STATIC: 0,
  PARAMETRIC: 1,
  WILDCARD: 2,
};

export type Handler = (ctx: Context) => Response | void | Promise<Response | void>;

export interface Route {
  method: Method;
  path: string;
  pattern: string;
  params: string[];
  opts: RouteOptions;
  handler: Handler;
  store: unknown;
}

export class Node {
  isLeafNode = false;
  routes: Route[] | null = null;
  handlerStorage: HandlerStorage | null = null;

  addRoute(route: Route, constrainer: Constrainer) {
    if (this.routes === null) {
      this.routes = [];
    }
    if (this.handlerStorage === null) {
      this.handlerStorage = new HandlerStorage();
    }
    this.isLeafNode = true;
    this.routes.push(route);
    this.handlerStorage.addHandler(constrainer, route);
  }
}

export class ParentNode extends Node {
  readonly staticChildren: Record<string, StaticNode> = Object.create(null);

  findStaticMatchingChild(path: string, pathIndex: number) {
    const staticChild = this.staticChildren[path.charAt(pathIndex)];
    if (
      staticChild === undefined || !staticChild.matchPrefix(path, pathIndex)
    ) {
      return null;
    }
    return staticChild;
  }

  getStaticChild(path: string, pathIndex = 0): ParentNode | null {
    if (path.length === pathIndex) {
      return this;
    }

    const staticChild = this.findStaticMatchingChild(path, pathIndex);
    if (staticChild) {
      return staticChild.getStaticChild(
        path,
        pathIndex + staticChild.prefix.length,
      );
    }

    return null;
  }

  createStaticChild(path: string): ParentNode {
    if (path.length === 0) {
      return this;
    }

    let staticChild = this.staticChildren[path.charAt(0)];
    if (staticChild) {
      let i = 1;
      for (; i < staticChild.prefix.length; i++) {
        if (path.charCodeAt(i) !== staticChild.prefix.charCodeAt(i)) {
          staticChild = staticChild.split(this, i);
          break;
        }
      }
      return staticChild.createStaticChild(path.slice(i));
    }

    const label = path.charAt(0);
    this.staticChildren[label] = new StaticNode(path);
    return this.staticChildren[label];
  }
}

export class StaticNode extends ParentNode {
  readonly kind = NODE_TYPES.STATIC;
  readonly parametricChildren: ParametricNode[] = [];
  wildcardChild: WildcardNode | null = null;
  prefix: string;
  matchPrefix!: (path: string, index: number) => boolean;
  constructor(prefix: string) {
    super();
    this.prefix = prefix;
    this.#compilePrefixMatch();
  }

  getParametricChild(
    regex: RegExp | null,
    staticSuffix: string | null,
    nodePath: string,
  ) {
    const regexpSource = regex && regex.source;

    const parametricChild = this.parametricChildren.find((child) => {
      const childRegexSource = child.regex && child.regex.source;
      return childRegexSource === regexpSource;
    });

    if (parametricChild) {
      return parametricChild;
    }

    return null;
  }

  createParametricChild(
    regex: RegExp | null,
    staticSuffix: string | null,
    nodePath: string,
  ) {
    let parametricChild = this.getParametricChild(
      regex,
      staticSuffix,
      nodePath,
    );
    if (parametricChild) {
      parametricChild.nodePaths.add(nodePath);
      return parametricChild;
    }

    parametricChild = new ParametricNode(regex, staticSuffix, nodePath);
    this.parametricChildren.push(parametricChild);
    this.parametricChildren.sort((child1, child2) => {
      if (!child1.isRegex) return 1;
      if (!child2.isRegex) return -1;

      if (child1.staticSuffix === null) return 1;
      if (child2.staticSuffix === null) return -1;

      if (child2.staticSuffix.endsWith(child1.staticSuffix)) return 1;
      if (child1.staticSuffix.endsWith(child2.staticSuffix)) return -1;

      return 0;
    });

    return parametricChild;
  }

  getWildcardChild() {
    return this.wildcardChild;
  }

  createWildcardChild() {
    this.wildcardChild = this.getWildcardChild() || new WildcardNode();
    return this.wildcardChild;
  }

  split(parentNode: ParentNode, length: number) {
    const parentPrefix = this.prefix.slice(0, length);
    const childPrefix = this.prefix.slice(length);

    this.prefix = childPrefix;
    this.#compilePrefixMatch();

    const staticNode = new StaticNode(parentPrefix);
    staticNode.staticChildren[childPrefix.charAt(0)] = this;
    parentNode.staticChildren[parentPrefix.charAt(0)] = staticNode;

    return staticNode;
  }

  getNextNode(path: string, pathIndex: number, nodeStack: {
    paramsCount: number;
    brotherPathIndex: number;
    brotherNode: Node;
  }[], paramsCount: number) {
    let node: ParentNode | null = this.findStaticMatchingChild(path, pathIndex);
    let parametricBrotherNodeIndex = 0;

    if (node === null) {
      if (this.parametricChildren.length === 0) {
        return this.wildcardChild;
      }

      node = this.parametricChildren[0];
      parametricBrotherNodeIndex = 1;
    }

    if (this.wildcardChild !== null) {
      nodeStack.push({
        paramsCount,
        brotherPathIndex: pathIndex,
        brotherNode: this.wildcardChild,
      });
    }

    for (
      let i = this.parametricChildren.length - 1;
      i >= parametricBrotherNodeIndex;
      i--
    ) {
      nodeStack.push({
        paramsCount,
        brotherPathIndex: pathIndex,
        brotherNode: this.parametricChildren[i],
      });
    }

    return node;
  }

  #compilePrefixMatch() {
    if (this.prefix.length === 1) {
      this.matchPrefix = () => true;
      return;
    }

    const lines = [];
    for (let i = 1; i < this.prefix.length; i++) {
      const charCode = this.prefix.charCodeAt(i);
      lines.push(`path.charCodeAt(i + ${i}) === ${charCode}`);
    }
    this.matchPrefix = new Function(
      "path",
      "i",
      `return ${lines.join(" && ")}`,
    ) as (path: string, index: number) => boolean;
  }
}

export class ParametricNode extends ParentNode {
  readonly kind = NODE_TYPES.PARAMETRIC;
  readonly isRegex: boolean;
  readonly regex: RegExp | null;
  readonly staticSuffix: string | null;
  readonly nodePaths: Set<string>;
  constructor(
    regex: RegExp | null,
    staticSuffix: string | null,
    nodePath: string,
  ) {
    super();
    this.isRegex = !!regex;
    this.regex = regex || null;
    this.staticSuffix = staticSuffix || null;
    this.nodePaths = new Set([nodePath]);
  }

  getNextNode(path: string, pathIndex: number) {
    return this.findStaticMatchingChild(path, pathIndex);
  }
}

export class WildcardNode extends Node {
  readonly kind = NODE_TYPES.WILDCARD;

  getNextNode() {
    return null;
  }
}
