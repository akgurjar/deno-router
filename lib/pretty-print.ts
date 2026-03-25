import { equal } from "@std/assert";
import type { Node, Route, StaticNode } from "./node.ts";

import httpMethodStrategy from "./strategies/http-method.ts";

const treeDataSymbol = Symbol("treeData");

type ObjectTree = {
  [key: string]: ObjectTree | string | undefined;
  [treeDataSymbol]?: string;
};

export interface PrettyPrintOptions {
  method?: string;
  commonPrefix?: boolean;
  includeMeta?: boolean | (string | symbol)[];
  buildPrettyMeta?: (route: Route) => Record<string | symbol, unknown>;
}

interface PrettyRoute extends Route {
  metaData?: Record<string, string>;
}

function printObjectTree(obj: ObjectTree, parentPrefix = ""): string {
  let tree = "";
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key] as ObjectTree;
    const isLast = i === keys.length - 1;

    const nodePrefix = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";

    const nodeData = value[treeDataSymbol] || "";
    const prefixedNodeData = nodeData.replaceAll(
      "\n",
      "\n" + parentPrefix + childPrefix,
    );

    tree += parentPrefix + nodePrefix + key + prefixedNodeData + "\n";
    tree += printObjectTree(value, parentPrefix + childPrefix);
  }
  return tree;
}

function parseFunctionName(fn: Function): string {
  let fName = fn.name || "";

  fName = fName.replace("bound", "").trim();
  fName = (fName || "anonymous") + "()";
  return fName;
}

function parseMeta(meta: unknown): unknown {
  if (Array.isArray(meta)) return meta.map((m) => parseMeta(m));
  if (typeof meta === "symbol") return meta.toString();
  if (typeof meta === "function") return parseFunctionName(meta);
  return meta;
}

function getRouteMetaData(
  route: Route,
  options: PrettyPrintOptions,
): Record<string, string> {
  if (!options.includeMeta) return {};

  const metaDataObject = options.buildPrettyMeta
    ? options.buildPrettyMeta(route)
    : {};
  const filteredMetaData: Record<string, string> = {};

  let includeMetaKeys = options.includeMeta;
  if (!Array.isArray(includeMetaKeys)) {
    includeMetaKeys = Reflect.ownKeys(metaDataObject) as (string | symbol)[];
  }

  for (const metaKey of includeMetaKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(
        metaDataObject,
        metaKey as PropertyKey,
      )
    ) {
      continue;
    }

    const serializedKey = metaKey.toString();
    const metaValue = metaDataObject[metaKey as string];

    if (metaValue !== undefined && metaValue !== null) {
      const serializedValue = JSON.stringify(parseMeta(metaValue));
      filteredMetaData[serializedKey] = serializedValue;
    }
  }

  return filteredMetaData;
}

function serializeMetaData(metaData: Record<string, string>): string {
  let serializedMetaData = "";
  for (const [key, value] of Object.entries(metaData)) {
    serializedMetaData += `\n• (${key}) ${value}`;
  }
  return serializedMetaData;
}

// get original merged tree node route
function normalizeRoute(route: PrettyRoute): PrettyRoute {
  const constraints = { ...route.opts.constraints } as Record<string, string>;
  const method = constraints[httpMethodStrategy.name] as typeof route.method;
  delete constraints[httpMethodStrategy.name];
  return { ...route, method, opts: { constraints } };
}

function serializeRoute(route: PrettyRoute): string {
  let serializedRoute = ` (${route.method})`;

  const constraints = route.opts.constraints || {};
  if (Object.keys(constraints).length !== 0) {
    serializedRoute += " " + JSON.stringify(constraints);
  }

  if (route.metaData) {
    serializedRoute += serializeMetaData(route.metaData);
  }
  return serializedRoute;
}

function mergeSimilarRoutes(routes: PrettyRoute[]): PrettyRoute[] {
  return routes.reduce((mergedRoutes: PrettyRoute[], route: PrettyRoute) => {
    for (const nodeRoute of mergedRoutes) {
      if (
        equal(route.opts.constraints, nodeRoute.opts.constraints) &&
        equal(route.metaData, nodeRoute.metaData)
      ) {
        nodeRoute.method =
          (nodeRoute.method + ", " + route.method) as typeof route.method;
        return mergedRoutes;
      }
    }
    mergedRoutes.push(route);
    return mergedRoutes;
  }, [] as PrettyRoute[]);
}

function serializeNode(
  node: Node,
  prefix: string,
  options: PrettyPrintOptions,
): string {
  let routes = (node.routes || []) as PrettyRoute[];

  if (options.method === undefined) {
    routes = routes.map(normalizeRoute);
  }

  routes = routes.map((route: PrettyRoute) => {
    route.metaData = getRouteMetaData(route, options);
    return route;
  });

  if (options.method === undefined) {
    routes = mergeSimilarRoutes(routes);
  }

  return routes.map(serializeRoute).join(`\n${prefix}`);
}

function buildObjectTree(
  node: Node,
  tree: ObjectTree,
  prefix: string,
  options: PrettyPrintOptions,
): void {
  let currentTree = tree;

  if (node.isLeafNode || options.commonPrefix !== false) {
    prefix = prefix || "(empty root node)";
    if (!tree[prefix]) tree[prefix] = {};
    currentTree = tree[prefix] as ObjectTree;

    if (node.isLeafNode) {
      currentTree[treeDataSymbol] = serializeNode(node, prefix, options);
    }

    prefix = "";
  }

  if ("staticChildren" in node) {
    const staticNode = node as StaticNode;
    if (staticNode.staticChildren) {
      for (const child of Object.values(staticNode.staticChildren)) {
        buildObjectTree(child, currentTree, prefix + child.prefix, options);
      }
    }
  }

  if ("parametricChildren" in node) {
    const parentNode = node as StaticNode;
    if (parentNode.parametricChildren) {
      for (const child of Object.values(parentNode.parametricChildren)) {
        const childPrefix = Array.from(child.nodePaths).join("|");
        buildObjectTree(child, currentTree, prefix + childPrefix, options);
      }
    }
  }

  if ("wildcardChild" in node) {
    const staticNode = node as StaticNode;
    if (staticNode.wildcardChild) {
      buildObjectTree(staticNode.wildcardChild, currentTree, "*", options);
    }
  }
}

export function prettyPrintTree(
  root: StaticNode,
  options: PrettyPrintOptions,
): string {
  const objectTree: ObjectTree = {};
  buildObjectTree(root, objectTree, root.prefix, options);
  return printObjectTree(objectTree);
}
