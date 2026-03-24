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
const delta = () => {};

const customHeaderConstraint = {
  name: "requestedBy",
  storage: function () {
    let requestedBys = {};
    return {
      get: (requestedBy) => {
        return requestedBys[requestedBy] || null;
      },
      set: (requestedBy, store) => {
        requestedBys[requestedBy] = store;
      },
      del: (requestedBy) => {
        delete requestedBys[requestedBy];
      },
      empty: () => {
        requestedBys = {};
      },
    };
  },
  deriveConstraint: (req, ctx) => {
    return req.headers["user-agent"];
  },
};

Deno.test("A route could support a custom constraint strategy", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    constraints: { requestedBy: customHeaderConstraint },
  });

  findMyWay.on("GET", "/", { constraints: { requestedBy: "curl" } }, alpha);
  findMyWay.on("GET", "/", { constraints: { requestedBy: "wget" } }, beta);

  deepEqual(findMyWay.find("GET", "/", { requestedBy: "curl" }).handler, alpha);
  deepEqual(findMyWay.find("GET", "/", { requestedBy: "wget" }).handler, beta);
  assert(!findMyWay.find("GET", "/", { requestedBy: "chrome" }));
});

Deno.test("A route could support a custom constraint strategy (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.addConstraintStrategy(customHeaderConstraint);

  findMyWay.on("GET", "/", { constraints: { requestedBy: "curl" } }, alpha);
  findMyWay.on("GET", "/", { constraints: { requestedBy: "wget" } }, beta);

  deepEqual(findMyWay.find("GET", "/", { requestedBy: "curl" }).handler, alpha);
  deepEqual(findMyWay.find("GET", "/", { requestedBy: "wget" }).handler, beta);
  assert(!findMyWay.find("GET", "/", { requestedBy: "chrome" }));
});

Deno.test("A route could support a custom constraint strategy while versioned", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    constraints: { requestedBy: customHeaderConstraint },
  });

  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "1.0.0" },
  }, alpha);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "2.0.0" },
  }, beta);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "wget", version: "2.0.0" },
  }, gamma);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "wget", version: "3.0.0" },
  }, delta);

  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "curl", version: "1.x" }).handler,
    alpha,
  );
  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "curl", version: "2.x" }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "wget", version: "2.x" }).handler,
    gamma,
  );
  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "wget", version: "3.x" }).handler,
    delta,
  );

  assert(!findMyWay.find("GET", "/", { requestedBy: "chrome" }));
  assert(
    !findMyWay.find("GET", "/", { requestedBy: "chrome", version: "1.x" }),
  );

  assert(!findMyWay.find("GET", "/", { requestedBy: "curl", version: "3.x" }));
  assert(!findMyWay.find("GET", "/", { requestedBy: "wget", version: "1.x" }));
});

Deno.test("A route could support a custom constraint strategy while versioned (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.addConstraintStrategy(customHeaderConstraint);

  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "1.0.0" },
  }, alpha);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "2.0.0" },
  }, beta);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "wget", version: "2.0.0" },
  }, gamma);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "wget", version: "3.0.0" },
  }, delta);

  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "curl", version: "1.x" }).handler,
    alpha,
  );
  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "curl", version: "2.x" }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "wget", version: "2.x" }).handler,
    gamma,
  );
  deepEqual(
    findMyWay.find("GET", "/", { requestedBy: "wget", version: "3.x" }).handler,
    delta,
  );

  assert(!findMyWay.find("GET", "/", { requestedBy: "chrome" }));
  assert(
    !findMyWay.find("GET", "/", { requestedBy: "chrome", version: "1.x" }),
  );

  assert(!findMyWay.find("GET", "/", { requestedBy: "curl", version: "3.x" }));
  assert(!findMyWay.find("GET", "/", { requestedBy: "wget", version: "1.x" }));
});

Deno.test("A route could support a custom constraint strategy while versioned and host constrained", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    constraints: { requestedBy: customHeaderConstraint },
  });

  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "1.0.0", host: "jsr.io" },
  }, alpha);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "2.0.0", host: "jsr.io" },
  }, beta);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "2.0.0", host: "example.io" },
  }, delta);

  deepEqual(
    findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "1.x",
      host: "jsr.io",
    }).handler,
    alpha,
  );
  deepEqual(
    findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "2.x",
      host: "jsr.io",
    }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "2.x",
      host: "example.io",
    }).handler,
    delta,
  );

  assert(!findMyWay.find("GET", "/", { requestedBy: "chrome" }));
  assert(
    !findMyWay.find("GET", "/", { requestedBy: "chrome", version: "1.x" }),
  );
  assert(!findMyWay.find("GET", "/", { requestedBy: "curl", version: "1.x" }));
  assert(!findMyWay.find("GET", "/", { requestedBy: "curl", version: "2.x" }));
  assert(
    !findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "3.x",
      host: "jsr.io",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "1.x",
      host: "example.io",
    }),
  );
});

Deno.test("A route could support a custom constraint strategy while versioned and host constrained (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.addConstraintStrategy(customHeaderConstraint);

  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "1.0.0", host: "jsr.io" },
  }, alpha);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "2.0.0", host: "jsr.io" },
  }, beta);
  findMyWay.on("GET", "/", {
    constraints: { requestedBy: "curl", version: "2.0.0", host: "example.io" },
  }, delta);

  deepEqual(
    findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "1.x",
      host: "jsr.io",
    }).handler,
    alpha,
  );
  deepEqual(
    findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "2.x",
      host: "jsr.io",
    }).handler,
    beta,
  );
  deepEqual(
    findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "2.x",
      host: "example.io",
    }).handler,
    delta,
  );

  assert(!findMyWay.find("GET", "/", { requestedBy: "chrome" }));
  assert(
    !findMyWay.find("GET", "/", { requestedBy: "chrome", version: "1.x" }),
  );
  assert(!findMyWay.find("GET", "/", { requestedBy: "curl", version: "1.x" }));
  assert(!findMyWay.find("GET", "/", { requestedBy: "curl", version: "2.x" }));
  assert(
    !findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "3.x",
      host: "jsr.io",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      requestedBy: "curl",
      version: "1.x",
      host: "example.io",
    }),
  );
});

Deno.test("Custom constraint strategies can set mustMatchWhenDerived flag to true which prevents matches to unconstrained routes when a constraint is derived and there are no other routes", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    constraints: {
      requestedBy: {
        ...customHeaderConstraint,
        mustMatchWhenDerived: true,
      },
    },
    defaultRoute(req, res) {
      assert("pass");
    },
  });

  findMyWay.on("GET", "/", {}, () => t.asserfail());

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { "user-agent": "node" },
  }, null);
});

Deno.test("Custom constraint strategies can set mustMatchWhenDerived flag to true which prevents matches to unconstrained routes when a constraint is derived and there are no other routes (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute(req, res) {
      assert("pass");
    },
  });

  findMyWay.addConstraintStrategy({
    ...customHeaderConstraint,
    mustMatchWhenDerived: true,
  });

  findMyWay.on("GET", "/", {}, () => t.asserfail());

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { "user-agent": "node" },
  }, null);
});

Deno.test("Custom constraint strategies can set mustMatchWhenDerived flag to true which prevents matches to unconstrained routes when a constraint is derived when there are constrained routes", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    constraints: {
      requestedBy: {
        ...customHeaderConstraint,
        mustMatchWhenDerived: true,
      },
    },
    defaultRoute(req, res) {
      assert("pass");
    },
  });

  findMyWay.on("GET", "/", {}, () => t.asserfail());
  findMyWay.on(
    "GET",
    "/",
    { constraints: { requestedBy: "curl" } },
    () => t.asserfail(),
  );
  findMyWay.on(
    "GET",
    "/",
    { constraints: { requestedBy: "wget" } },
    () => t.asserfail(),
  );

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { "user-agent": "node" },
  }, null);
});

Deno.test("Custom constraint strategies can set mustMatchWhenDerived flag to true which prevents matches to unconstrained routes when a constraint is derived when there are constrained routes (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute(req, res) {
      assert("pass");
    },
  });

  findMyWay.addConstraintStrategy({
    ...customHeaderConstraint,
    mustMatchWhenDerived: true,
  });

  findMyWay.on("GET", "/", {}, () => t.asserfail());
  findMyWay.on(
    "GET",
    "/",
    { constraints: { requestedBy: "curl" } },
    () => t.asserfail(),
  );
  findMyWay.on(
    "GET",
    "/",
    { constraints: { requestedBy: "wget" } },
    () => t.asserfail(),
  );

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { "user-agent": "node" },
  }, null);
});

Deno.test("Custom constraint strategies can set mustMatchWhenDerived flag to false which allows matches to unconstrained routes when a constraint is derived", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    constraints: {
      requestedBy: {
        ...customHeaderConstraint,
        mustMatchWhenDerived: false,
      },
    },
    defaultRoute(req, res) {
      t.asserfail();
    },
  });

  findMyWay.on("GET", "/", {}, () => assert("pass"));

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { "user-agent": "node" },
  }, null);
});

Deno.test("Custom constraint strategies can set mustMatchWhenDerived flag to false which allows matches to unconstrained routes when a constraint is derived (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute(req, res) {
      assert("pass");
    },
  });

  findMyWay.addConstraintStrategy({
    ...customHeaderConstraint,
    mustMatchWhenDerived: true,
  });

  findMyWay.on("GET", "/", {}, () => assert("pass"));

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { "user-agent": "node" },
  }, null);
});

Deno.test("Has constraint strategy method test", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  deepEqual(
    findMyWay.hasConstraintStrategy(customHeaderConstraint.name),
    false,
  );
  findMyWay.addConstraintStrategy(customHeaderConstraint);
  deepEqual(findMyWay.hasConstraintStrategy(customHeaderConstraint.name), true);
});
