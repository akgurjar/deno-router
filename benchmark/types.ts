import type { Method } from "@std/http/unstable-method";

export interface Route {
  method: Method;
  path: string;
  opts?: { constraints?: Record<string, string> };
}

export interface Benchmark {
  name: string;
  routes: Route[];
  requests: Request[];
}
