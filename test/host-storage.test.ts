// @ts-nocheck
const acceptHostStrategy = await import("../lib/strategies/accept-host.ts");

import {
  assert,
  assertEquals,
  assertMatch,
  assertNotEquals,
  assertThrows,
  fail,
} from "@std/assert";
import { deepEqual } from "node:assert";

Deno.test("can get hosts by exact matches", async () => {
  const storage = acceptHostStrategy.storage();
  deepEqual(storage.get("jsr.io"), undefined);
  storage.set("jsr.io", true);
  deepEqual(storage.get("jsr.io"), true);
});

Deno.test("can get hosts by regexp matches", async () => {
  const storage = acceptHostStrategy.storage();
  deepEqual(storage.get("jsr.io"), undefined);
  storage.set(/.+fastify\.io/, true);
  deepEqual(storage.get("foo.jsr.io"), true);
  deepEqual(storage.get("bar.jsr.io"), true);
});

Deno.test("exact host matches take precendence over regexp matches", async () => {
  const storage = acceptHostStrategy.storage();
  storage.set(/.+fastify\.io/, "wildcard");
  storage.set("auth.jsr.io", "exact");
  deepEqual(storage.get("foo.jsr.io"), "wildcard");
  deepEqual(storage.get("bar.jsr.io"), "wildcard");
  deepEqual(storage.get("auth.jsr.io"), "exact");
});
