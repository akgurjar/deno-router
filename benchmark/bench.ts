import MyRouter from "../mod.ts";
import type { Method } from "@std/http/unstable-method";
import versionStrategy from "../lib/strategies/accept-version.ts";
import hostStrategy from "../lib/strategies/accept-host.ts";

interface Route {
  method: Method;
  path: string;
  opts?: { constraints?: Record<string, string> };
}

interface Benchmark {
  name: string;
  routes: Route[];
  requests: Request[];
}

const createRequest = (
  path: string,
  req?: RequestInit,
) => {
  const host = "localhost";
  if (!req) {
    req = { headers: { host } };
  } else if (!req.headers) {
    req.headers = { host };
  } else {
    (req.headers as Record<string, string>)["host"] = host;
  }
  return new Request(`http://${host}${path}`, req);
};

const benchmarks: Benchmark[] = [
  {
    name: 'lookup root "/" route',
    routes: [{ method: "GET", path: "/" }],
    requests: [createRequest("/")],
  },
  {
    name: "lookup short static route",
    routes: [{ method: "GET", path: "/static" }],
    requests: [createRequest("/static")],
  },
  {
    name: "lookup long static route",
    routes: [{ method: "GET", path: "/static/static/static/static/static" }],
    requests: [
      createRequest("/static/static/static/static/static"),
    ],
  },
  {
    name: "lookup long static route (common prefix)",
    routes: [
      { method: "GET", path: "/static" },
      { method: "GET", path: "/static/static" },
      { method: "GET", path: "/static/static/static" },
      { method: "GET", path: "/static/static/static/static" },
      { method: "GET", path: "/static/static/static/static/static" },
    ],
    requests: [
      createRequest("/static/static/static/static/static"),
    ],
  },
  {
    name: "lookup short parametric route",
    routes: [{ method: "GET", path: "/:param" }],
    requests: [createRequest("/param1")],
  },
  {
    name: "lookup long parametric route",
    routes: [{ method: "GET", path: "/:param" }],
    requests: [
      createRequest("/longParamParamParamParamParamParam"),
    ],
  },
  {
    name: "lookup short parametric route (encoded unoptimized)",
    routes: [{ method: "GET", path: "/:param" }],
    requests: [createRequest("/param%2B")],
  },
  {
    name: "lookup short parametric route (encoded optimized)",
    routes: [{ method: "GET", path: "/:param" }],
    requests: [createRequest("/param%20")],
  },
  {
    name: "lookup parametric route with two short params",
    routes: [{ method: "GET", path: "/:param1/:param2" }],
    requests: [createRequest("/param1/param2")],
  },
  {
    name: "lookup multi-parametric route with two short params",
    routes: [{ method: "GET", path: "/:param1-:param2" }],
    requests: [createRequest("/param1-param2")],
  },
  {
    name: "lookup multi-parametric route with two short regex params",
    routes: [{ method: "GET", path: "/:param1([a-z]*)1:param2([a-z]*)2" }],
    requests: [createRequest("/param1param2")],
  },
  {
    name: "lookup long static + parametric route",
    routes: [{ method: "GET", path: "/static/:param1/static/:param2/static" }],
    requests: [
      createRequest("/static/param1/static/param2/static"),
    ],
  },
  {
    name: "lookup short wildcard route",
    routes: [{ method: "GET", path: "/*" }],
    requests: [createRequest("/static")],
  },
  {
    name: "lookup long wildcard route",
    routes: [{ method: "GET", path: "/*" }],
    requests: [
      createRequest("/static/static/static/static/static"),
    ],
  },
  {
    name: "lookup root route on constrained router",
    routes: [
      { method: "GET", path: "/" },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "1.2.0" } },
      },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "example.com" } },
      },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "jsr.io" } },
      },
    ],
    requests: [
      createRequest("/", { headers: { host: "jsr.io" } }),
    ],
  },
  {
    name: "lookup short static unconstraint route",
    routes: [
      { method: "GET", path: "/static", opts: {} },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "example.com" } },
      },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "jsr.io" } },
      },
    ],
    requests: [createRequest("/static")],
  },
  {
    name: "lookup short static versioned route",
    routes: [
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "1.2.0" } },
      },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "example.com" } },
      },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "jsr.io" } },
      },
    ],
    requests: [
      createRequest("/static", {
        headers: { "accept-version": "1.x", host: "jsr.io" },
      }),
    ],
  },
  {
    name: "lookup short static constrained (version & host) route",
    routes: [
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "1.2.0" } },
      },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "example.com" } },
      },
      {
        method: "GET",
        path: "/static",
        opts: { constraints: { version: "2.0.0", host: "jsr.io" } },
      },
    ],
    requests: [
      createRequest("/static", {
        headers: { "accept-version": "2.x", host: "jsr.io" },
      }),
    ],
  },
];

for (const bench of benchmarks) {
  // We want to pre-allocate constraints and routers so they aren't part of the benchmark time
  const router = new MyRouter({
    constraints: {
      "version": {
        ...versionStrategy,
        deriveConstraint: (req: Request) =>
          req.headers.get("accept-version") || "",
      },
      "host": {
        ...hostStrategy,
        deriveConstraint: (req: Request) => req.headers.get("host") || "",
      },
    },
  });

  for (const setup of bench.routes) {
    if (setup.opts) {
      router.on(
        setup.method,
        setup.path,
        setup.opts,
        () => new Response("OK"),
      );
    } else {
      router.on(setup.method, setup.path, () => new Response("OK"));
    }
  }

  // Support multiple arguments by just taking the first one
  const req = bench.requests[0];

  Deno.bench({
    name: bench.name,
    fn: async () => {
      await router.lookup(req);
    },
  });
}
