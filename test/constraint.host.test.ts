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

Deno.test("A route supports multiple host constraints", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", {}, alpha);
  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, beta);
  findMyWay.on("GET", "/", { constraints: { host: "example.com" } }, gamma);

  deepEqual(findMyWay.find("GET", "/", {}).handler, alpha);
  deepEqual(
    findMyWay.find("GET", "/", { host: "something-else.io" }).handler,
    alpha,
  );
  deepEqual(findMyWay.find("GET", "/", { host: "jsr.io" }).handler, beta);
  deepEqual(findMyWay.find("GET", "/", { host: "example.com" }).handler, gamma);
});

Deno.test("A route supports wildcard host constraints", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, beta);
  findMyWay.on("GET", "/", { constraints: { host: /.*\.fastify\.io/ } }, gamma);

  deepEqual(findMyWay.find("GET", "/", { host: "jsr.io" }).handler, beta);
  deepEqual(findMyWay.find("GET", "/", { host: "foo.jsr.io" }).handler, gamma);
  deepEqual(findMyWay.find("GET", "/", { host: "bar.jsr.io" }).handler, gamma);
  assert(!findMyWay.find("GET", "/", { host: "example.com" }));
});

Deno.test("A route supports multiple host constraints (lookup)", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", {}, (req, res) => {});
  findMyWay.on("GET", "/", { constraints: { host: "jsr.io" } }, (req, res) => {
    deepEqual(req.headers.host, "jsr.io");
  });
  findMyWay.on(
    "GET",
    "/",
    { constraints: { host: "example.com" } },
    (req, res) => {
      deepEqual(req.headers.host, "example.com");
    },
  );
  findMyWay.on(
    "GET",
    "/",
    { constraints: { host: /.+\.fancy\.ca/ } },
    (req, res) => {
      assert(req.headers.host.endsWith(".fancy.ca"));
    },
  );

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { host: "jsr.io" },
  });

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { host: "example.com" },
  });
  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { host: "foo.fancy.ca" },
  });
  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { host: "bar.fancy.ca" },
  });
});

Deno.test("A route supports up to 31 host constraints", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  for (let i = 0; i < 31; i++) {
    const host = `h${i.toString().padStart(2, "0")}`;
    findMyWay.on("GET", "/", { constraints: { host } }, alpha);
  }

  deepEqual(findMyWay.find("GET", "/", { host: "h01" }).handler, alpha);
});

Deno.test("A route throws when constraint limit exceeded", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  for (let i = 0; i < 31; i++) {
    const host = `h${i.toString().padStart(2, "0")}`;
    findMyWay.on("GET", "/", { constraints: { host } }, alpha);
  }

  assertThrows(
    () => findMyWay.on("GET", "/", { constraints: { host: "h31" } }, beta),
    new Error(
      "find-my-way supports a maximum of 31 route handlers per node when there are constraints, limit reached",
    ),
  );
});
