# deno-router

A fast HTTP router for Deno, internally using a highly performant [Radix Tree](https://en.wikipedia.org/wiki/Radix_tree) (aka compact [Prefix Tree](https://en.wikipedia.org/wiki/Trie)). It supports route parameters, wildcards, and constraint-based routing.

> **Acknowledgements & Credits**
> 
> `deno-router` is a native Deno port of the legendary [find-my-way](https://github.com/delvedor/find-my-way) Node.js router by Tomas Della Vedova. It retains the ultra-fast routing engine and Radix tree structure of the original project, while upgrading the API to strictly type-safe, modern Web Standard `Request` and `Response` objects suitable for the Deno and Fetch ecosystems.

## Installation

You can import `deno-router` locally or directly from your preferred Deno registry:

```typescript
import Router from "./mod.ts";
```

## Basic Usage

The core API is designed around Deno's native `Request` and `Response` paradigm. Handler functions take a `Context` object, which encapsulates the original `Request` alongside any extracted URL params.

```typescript
import Router from "./mod.ts";

const router = new Router();

// Register a basic literal route
router.on('GET', '/', (ctx) => {
  return new Response('{"message":"hello world"}', {
    headers: { "content-type": "application/json" }
  });
});

// Register a parametric route
router.on('GET', '/users/:id', (ctx) => {
  const userId = ctx.params.id;
  return new Response(`Hello user ${userId}`);
});

// Start a Deno server
Deno.serve(async (req) => {
  return await router.lookup(req);
});
```

## Supported Path Formats

- **Static Routes**: `/example`
- **Parametric Routes**: `/example/:userId` 
- **Wildcards**: `/example/*`
- **Multi-Parametric**: `/example/near/:lat-:lng/radius/:r`
- **Regex Parameters**: `/example/:file(^\\d+).png`

### Match Order
Nodes are matched in the following order to ensure expected determinism:
1. Static
2. Parametric node with static ending
3. Parametric (regex) / Multi-parametric
4. Parametric
5. Wildcard

## Shorthand Methods
For improved developer experience, you can use the lower-cased HTTP methods instead of `router.on()`:

```typescript
router.get('/path', handler);
router.post('/path', handler);
router.put('/path', handler);
router.delete('/path', handler);
// Also supports patch, head, options, etc.
```

## Constraints (Versioning & Host Routing)

`deno-router` supports restricting handlers to only match certain constraints (like headers, hosts, or versions).

```typescript
import versionStrategy from "./lib/strategies/accept-version.ts";

const myRouter = new Router({
  constraints: {
    "version": {
      ...versionStrategy,
      deriveConstraint: (req: Request) => req.headers.get("accept-version") || ""
    }
  }
});

// Handlers are selectively matched based on the constraint!
myRouter.on('GET', '/', { constraints: { version: '1.2.0' }}, (ctx) => {
  return new Response("Action from v1.2.0");
});

myRouter.on('GET', '/', { constraints: { version: '2.0.0' }}, (ctx) => {
  return new Response("Action from v2.0.0");
});
```

## Benchmarks

Because `deno-router` maintains the exact same tree structure as `find-my-way`, it averages over **1 million route lookups per second** (sub-microsecond resolution). Run the included benchmark suite to test your setup:

```bash
deno task bench
```

## License

**[find-my-way - MIT](https://github.com/delvedor/find-my-way/blob/master/LICENSE)**  
**[deno-router - MIT](./LICENSE)**

Original constraints and optimization logic Copyright © 2017-2023 Tomas Della Vedova
