import { assert } from "@std/assert";
import type { Handler, Route } from "./node.ts";
import type { ConstraintStrategy } from "../types.d.ts";

export type QuerystringParser = (s: string) => unknown;

export class Config {
  ignoreTrailingSlash: boolean = false;

  ignoreDuplicateSlashes: boolean = false;

  allowUnsafeRegex: boolean = false;

  useSemicolonDelimiter: boolean = false;

  caseSensitive: boolean = true;

  maxParamLength: number = 100;

  querystringParser: QuerystringParser = (query: string) => {
    return query.length === 0
      ? {}
      : Object.fromEntries(new URLSearchParams(query));
  };

  defaultRoute: Handler = () => new Response("Not Found", { status: 404 });

  onBadUrl: Handler = () => new Response("Bad URL", { status: 400 });

  buildPrettyMeta = (route?: Route | null) => {
    // buildPrettyMeta function must return an object, which will be parsed into key/value pairs for display
    if (!route) return {};
    if (!route.store) return {};
    return Object.assign({}, route.store);
  };

  constraints?: {
    [key: string]: ConstraintStrategy;
  };
  constructor(config?: Partial<Config>) {
    if (config) {
      if (typeof config.defaultRoute !== "undefined") {
        assert(
          typeof config.defaultRoute === "function",
          "The default route must be a function",
        );
        this.defaultRoute = config.defaultRoute;
      }
      if (typeof config.onBadUrl !== "undefined") {
        assert(
          typeof config.onBadUrl === "function",
          "The bad url handler must be a function",
        );
        this.onBadUrl = config.onBadUrl;
      }
      if (typeof config.querystringParser !== "undefined") {
        assert(
          typeof config.querystringParser === "function",
          "The querystring parser must be a function",
        );
        this.querystringParser = config.querystringParser;
      }
      if (typeof config.buildPrettyMeta !== "undefined") {
        assert(
          typeof config.buildPrettyMeta === "function",
          "buildPrettyMeta must be a function",
        );
        this.buildPrettyMeta = config.buildPrettyMeta;
      }
      if (config.ignoreTrailingSlash) {
        this.ignoreTrailingSlash = true;
      }
      if (config.ignoreDuplicateSlashes) {
        this.ignoreDuplicateSlashes = true;
      }
      if (config.allowUnsafeRegex) {
        this.allowUnsafeRegex = true;
      }
      if (config.useSemicolonDelimiter) {
        this.useSemicolonDelimiter = true;
      }
      if (typeof config.caseSensitive === "boolean") {
        this.caseSensitive = config.caseSensitive;
      }
      if (typeof config.maxParamLength !== "undefined") {
        assert(
          typeof config.maxParamLength === "number",
          "The max param length must be a number",
        );
        this.maxParamLength = config.maxParamLength;
      }
      if (config.constraints) {
        this.constraints = config.constraints;
      }
    }
  }
}
