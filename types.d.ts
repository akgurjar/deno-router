import type { Method } from "@std/http/unstable-method";
import type { Handler } from "./lib/node.ts";

export type QuerystringParser = (s: string) => unknown;

export interface ConstraintStore<K = string, V = unknown> {
  get(value: K): V | null;
  set(value: K, handler: V): void;
  del?(value: K): void;
  empty?(): void;
}

export interface ConstraintStrategy<T = string> {
  name: string;
  mustMatchWhenDerived?: boolean;
  storage(): ConstraintStore<T, unknown>;
  validate?(value: unknown): void;
  deriveConstraint?(req: Request): T | Promise<T>;
  isCustom?: boolean;
  isAsync?: boolean;
}

export type Constraints = Record<string, ConstraintStrategy>;

export interface RouteOptions {
  [key: string]: unknown;
  constraints?: { [key: string]: unknown };
}

export type OnArgs =
  | [Method | Method[], string, Handler]
  | [Method | Method[], string, RouteOptions, Handler]
  | [Method | Method[], string, Handler, unknown]
  | [Method | Method[], string, RouteOptions, Handler, unknown];

type CamelCase<S extends string> = S extends `${infer T}-${infer U}`
  ? `${Lowercase<T>}${Capitalize<CamelCase<U>>}`
  : Lowercase<S>;

export type OnMethodArgs =
  | [string, Handler]
  | [string, RouteOptions, Handler]
  | [string, Handler, unknown]
  | [string, RouteOptions, Handler, unknown];

type HttpMethods = {
  [K in Method as CamelCase<K>]: (...args: OnMethodArgs) => void;
};
