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

Deno.test("route with matching regex", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      fail("route not matched");
    },
  });

  findMyWay.on("GET", "/test/:id(^\\d+$)", () => {
    assert("regex match");
  });

  findMyWay.lookup({ method: "GET", url: "/test/12", headers: {} }, null);
});

Deno.test("route without matching regex", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      assert("route not matched");
    },
  });

  findMyWay.on("GET", "/test/:id(^\\d+$)", () => {
    fail("regex match");
  });

  findMyWay.lookup({ method: "GET", url: "/test/test", headers: {} }, null);
});

Deno.test("route with an extension regex 2", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req) => {
      fail(`route not matched: ${req.url}`);
    },
  });
  findMyWay.on("GET", "/test/S/:file(^\\S+).png", () => {
    assert("regex match");
  });
  findMyWay.on("GET", "/test/D/:file(^\\D+).png", () => {
    assert("regex match");
  });
  findMyWay.lookup(
    { method: "GET", url: "/test/S/foo.png", headers: {} },
    null,
  );
  findMyWay.lookup(
    { method: "GET", url: "/test/D/foo.png", headers: {} },
    null,
  );
});

Deno.test("nested route with matching regex", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      fail("route not matched");
    },
  });

  findMyWay.on("GET", "/test/:id(^\\d+$)/hello", () => {
    assert("regex match");
  });

  findMyWay.lookup({ method: "GET", url: "/test/12/hello", headers: {} }, null);
});

Deno.test("mixed nested route with matching regex", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      fail("route not matched");
    },
  });

  findMyWay.on("GET", "/test/:id(^\\d+$)/hello/:world", (req, res, params) => {
    deepEqual(params.id, "12");
    deepEqual(params.world, "world");
  });

  findMyWay.lookup(
    { method: "GET", url: "/test/12/hello/world", headers: {} },
    null,
  );
});

Deno.test("mixed nested route with double matching regex", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      fail("route not matched");
    },
  });

  findMyWay.on(
    "GET",
    "/test/:id(^\\d+$)/hello/:world(^\\d+$)",
    (req, res, params) => {
      deepEqual(params.id, "12");
      deepEqual(params.world, "15");
    },
  );

  findMyWay.lookup(
    { method: "GET", url: "/test/12/hello/15", headers: {} },
    null,
  );
});

Deno.test("mixed nested route without double matching regex", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      assert("route not matched");
    },
  });

  findMyWay.on(
    "GET",
    "/test/:id(^\\d+$)/hello/:world(^\\d+$)",
    (req, res, params) => {
      fail("route mathed");
    },
  );

  findMyWay.lookup(
    { method: "GET", url: "/test/12/hello/test", headers: {} },
    null,
  );
});

Deno.test("route with an extension regex", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      fail("route not matched");
    },
  });

  findMyWay.on("GET", "/test/:file(^\\d+).png", () => {
    assert("regex match");
  });

  findMyWay.lookup({ method: "GET", url: "/test/12.png", headers: {} }, null);
});

Deno.test("route with an extension regex - no match", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      assert("route not matched");
    },
  });

  findMyWay.on("GET", "/test/:file(^\\d+).png", () => {
    fail("regex match");
  });

  findMyWay.lookup({ method: "GET", url: "/test/aa.png", headers: {} }, null);
});

Deno.test("safe decodeURIComponent", async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => {
      assert("route not matched");
    },
  });

  findMyWay.on("GET", "/test/:id(^\\d+$)", () => {
    fail("we should not be here");
  });

  deepEqual(
    findMyWay.find("GET", '/test/hel%"Flo', {}),
    null,
  );
});

Deno.test("Should check if a regex is safe to use", async () => {
  // t.plan()

  const noop = () => {};

  // https://github.com/substack/safe-regex/blob/master/test/regex.js
  const good = [
    /\bOakland\b/,
    /\b(Oakland|San Francisco)\b/i,
    /^\d+1337\d+$/i,
    /^\d+(1337|404)\d+$/i,
    /^\d+(1337|404)*\d+$/i,
    RegExp(Array(26).join("a?") + Array(26).join("a")),
  ];

  const bad = [
    /^(a?){25}(a){25}$/,
    RegExp(Array(27).join("a?") + Array(27).join("a")),
    /(x+x+)+y/,
    /foo|(x+x+)+y/,
    /(a+){10}y/,
    /(a+){2}y/,
    /(.*){1,32000}[bc]/,
  ];

  const findMyWay = FindMyWay();

  good.forEach((regex) => {
    try {
      findMyWay.on("GET", `/test/:id(${regex.toString()})`, noop);
      assert("ok");
      findMyWay.off("GET", `/test/:id(${regex.toString()})`);
    } catch (err) {
      fail(err);
    }
  });

  bad.forEach((regex) => {
    try {
      findMyWay.on("GET", `/test/:id(${regex.toString()})`, noop);
      fail("should throw");
    } catch (err) {
      assert(err);
    }
  });
});

Deno.test("Disable safe regex check", async () => {
  // t.plan()

  const noop = () => {};

  // https://github.com/substack/safe-regex/blob/master/test/regex.js
  const good = [
    /\bOakland\b/,
    /\b(Oakland|San Francisco)\b/i,
    /^\d+1337\d+$/i,
    /^\d+(1337|404)\d+$/i,
    /^\d+(1337|404)*\d+$/i,
    RegExp(Array(26).join("a?") + Array(26).join("a")),
  ];

  const bad = [
    /^(a?){25}(a){25}$/,
    RegExp(Array(27).join("a?") + Array(27).join("a")),
    /(x+x+)+y/,
    /foo|(x+x+)+y/,
    /(a+){10}y/,
    /(a+){2}y/,
    /(.*){1,32000}[bc]/,
  ];

  const findMyWay = FindMyWay({ allowUnsafeRegex: true });

  good.forEach((regex) => {
    try {
      findMyWay.on("GET", `/test/:id(${regex.toString()})`, noop);
      assert("ok");
      findMyWay.off("GET", `/test/:id(${regex.toString()})`);
    } catch (err) {
      fail(err);
    }
  });

  bad.forEach((regex) => {
    try {
      findMyWay.on("GET", `/test/:id(${regex.toString()})`, noop);
      assert("ok");
      findMyWay.off("GET", `/test/:id(${regex.toString()})`);
    } catch (err) {
      fail(err);
    }
  });
});

Deno.test("prevent back-tracking", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: () => {
      fail("route not matched");
    },
  });

  findMyWay.on("GET", "/:foo-:bar-", (req, res, params) => {});
  findMyWay.find("GET", "/" + "-".repeat(16000) + "a", { host: "jsr.io" });
});
