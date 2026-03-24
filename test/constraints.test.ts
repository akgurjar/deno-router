// @ts-nocheck
// 'use strict'

import {
  assert,
  assertEquals,
  assertMatch,
  assertNotEquals,
  assertThrows,
  fail,
} from "@std/assert";
import { deepEqual } from "node:assert";
import FindMyWay from "../index.ts";
const alpha = () => {};
const beta = () => {};
const gamma = () => {};

Deno.test("A route could support multiple host constraints while versioned", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.1.0" },
  }, beta);
  findMyWay.on("GET", "/", {
    constraints: { host: "jsr.io", version: "2.1.0" },
  }, gamma);

  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "1.x" }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "1.1.x" }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "2.x" }).handler,
    gamma,
  );
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "2.1.x" }).handler,
    gamma,
  );
  assert(!findMyWay.find("GET", "/", { host: "jsr.io", version: "3.x" }));
  assert(
    !findMyWay.find("GET", "/", { host: "something-else.io", version: "1.x" }),
  );
});

Deno.test("Constrained routes are matched before unconstrainted routes when the constrained route is added last", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", {}, alpha);
  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, beta);

  deepEqual(findMyWay.find("GET", "/", {}).handler, alpha);
  deepEqual(findMyWay.find("GET", "/", { host: "jsr.io" }).handler, beta);
  deepEqual(findMyWay.find("GET", "/", { host: "example.com" }).handler, alpha);
});

Deno.test("Constrained routes are matched before unconstrainted routes when the constrained route is added first", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, beta);
  findMyWay.on("GET", "/", {}, alpha);

  deepEqual(findMyWay.find("GET", "/", {}).handler, alpha);
  deepEqual(findMyWay.find("GET", "/", { host: "jsr.io" }).handler, beta);
  deepEqual(findMyWay.find("GET", "/", { host: "example.com" }).handler, alpha);
});

Deno.test("Routes with multiple constraints are matched before routes with one constraint when the doubly-constrained route is added last", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, alpha);
  findMyWay.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, beta);

  deepEqual(findMyWay.find("GET", "/", { host: "jsr.io" }).handler, alpha);
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "1.0.0" }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "2.0.0" }),
    null,
  );
});

Deno.test("Routes with multiple constraints are matched before routes with one constraint when the doubly-constrained route is added first", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, beta);
  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, alpha);

  deepEqual(findMyWay.find("GET", "/", { host: "jsr.io" }).handler, alpha);
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "1.0.0" }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "2.0.0" }),
    null,
  );
});

Deno.test("Routes with multiple constraints are matched before routes with one constraint before unconstrained routes", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, beta);
  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, alpha);
  findMyWay.on("GET", "/", { constraints: {} }, gamma);

  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "1.0.0" }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", { host: "jsr.io", version: "2.0.0" }),
    null,
  );
  deepEqual(findMyWay.find("GET", "/", { host: "example.io" }).handler, gamma);
});

Deno.test("Has constraint strategy method test", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  deepEqual(findMyWay.hasConstraintStrategy("version"), false);
  deepEqual(findMyWay.hasConstraintStrategy("host"), false);

  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, () => {});

  deepEqual(findMyWay.hasConstraintStrategy("version"), false);
  deepEqual(findMyWay.hasConstraintStrategy("host"), true);

  findMyWay.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, () => {});

  deepEqual(findMyWay.hasConstraintStrategy("version"), true);
  deepEqual(findMyWay.hasConstraintStrategy("host"), true);
});
