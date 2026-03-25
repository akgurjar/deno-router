
import {
  assert,
  assertEquals
} from "@std/assert";
import Router from "../mod.ts";
const alpha = () => {};
const beta = () => {};
const gamma = () => {};

Deno.test("A route could support multiple host constraints while versioned", () => {

  const router = new Router();

  router.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.1.0" },
  }, beta);
  router.on("GET", "/", {
    constraints: { host: "jsr.io", version: "2.1.0" },
  }, gamma);

  assertEquals(
    router.find("GET", "/", { host: "jsr.io", version: "1.x" })?.handler,
    beta,
  );
  assertEquals(
    router.find("GET", "/", { host: "jsr.io", version: "1.1.x" })?.handler,
    beta,
  );
  assertEquals(
    router.find("GET", "/", { host: "jsr.io", version: "2.x" })?.handler,
    gamma,
  );
  assertEquals(
    router.find("GET", "/", { host: "jsr.io", version: "2.1.x" })?.handler,
    gamma,
  );
  assert(!router.find("GET", "/", { host: "jsr.io", version: "3.x" }));
  assert(
    !router.find("GET", "/", { host: "something-else.io", version: "1.x" }),
  );
});

Deno.test("Constrained routes are matched before unconstrainted routes when the constrained route is added last", () => {

  const router = new Router();

  router.on("GET", "/", {}, alpha);
  router.on("GET", "/", { constraints: { host: "jsr.io" } }, beta);

  assertEquals(router.find("GET", "/", {})?.handler, alpha);
  assertEquals(router.find("GET", "/", { host: "jsr.io" })?.handler, beta);
  assertEquals(router.find("GET", "/", { host: "example.com" })?.handler, alpha);
});

Deno.test("Constrained routes are matched before unconstrainted routes when the constrained route is added first", () => {

  const router = new Router();

  router.on("GET", "/", { constraints: { host: "jsr.io" } }, beta);
  router.on("GET", "/", {}, alpha);

  assertEquals(router.find("GET", "/", {})?.handler, alpha);
  assertEquals(router.find("GET", "/", { host: "jsr.io" })?.handler, beta);
  assertEquals(router.find("GET", "/", { host: "example.com" })?.handler, alpha);
});

Deno.test("Routes with multiple constraints are matched before routes with one constraint when the doubly-constrained route is added last", () => {

  const router = new Router();

  router.on("GET", "/", { constraints: { host: "jsr.io" } }, alpha);
  router.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, beta);

  assertEquals(router.find("GET", "/", { host: "jsr.io" })?.handler, alpha);
  assertEquals(
    router.find("GET", "/", { host: "jsr.io", version: "1.0.0" })?.handler,
    beta,
  );
  assert(!router.find("GET", "/", { host: "jsr.io", version: "2.0.0" }));
});

Deno.test("Routes with multiple constraints are matched before routes with one constraint when the doubly-constrained route is added first", () => {

  const router = new Router();

  router.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, beta);
  router.on("GET", "/", { constraints: { host: "jsr.io" } }, alpha);

  assertEquals(router.find("GET", "/", { host: "jsr.io" })?.handler, alpha);
  assertEquals(
    router.find("GET", "/", { host: "jsr.io", version: "1.0.0" })?.handler,
    beta,
  );
  assert(!router.find("GET", "/", { host: "jsr.io", version: "2.0.0" }));
});

Deno.test("Routes with multiple constraints are matched before routes with one constraint before unconstrained routes", () => {

  const router = new Router();

  router.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, beta);
  router.on("GET", "/", { constraints: { host: "jsr.io" } }, alpha);
  router.on("GET", "/", { constraints: {} }, gamma);

  assertEquals(
    router.find("GET", "/", { host: "jsr.io", version: "1.0.0" })?.handler,
    beta,
  );
  assert(!router.find("GET", "/", { host: "jsr.io", version: "2.0.0" }));
  assertEquals(router.find("GET", "/", { host: "example.io" })?.handler, gamma);
});

Deno.test("Has constraint strategy method test", () => {

  const router = new Router();

  assertEquals(router.hasConstraintStrategy("version"), false);
  assertEquals(router.hasConstraintStrategy("host"), false);

  router.on("GET", "/", { constraints: { host: "jsr.io" } }, () => {});

  assertEquals(router.hasConstraintStrategy("version"), false);
  assertEquals(router.hasConstraintStrategy("host"), true);

  router.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, () => {});

  assertEquals(router.hasConstraintStrategy("version"), true);
  assertEquals(router.hasConstraintStrategy("host"), true);
});
