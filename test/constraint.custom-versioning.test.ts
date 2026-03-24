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
const noop = () => {};

const customVersioning = {
  name: "version",
  // storage factory
  storage: function () {
    let versions = {};
    return {
      get: (version) => {
        return versions[version] || null;
      },
      set: (version, store) => {
        versions[version] = store;
      },
      del: (version) => {
        delete versions[version];
      },
      empty: () => {
        versions = {};
      },
    };
  },
  deriveConstraint: (req, ctx) => {
    return req.headers.accept;
  },
};

Deno.test("A route could support multiple versions (find) / 1", async () => {
  // t.plan()

  const findMyWay = FindMyWay({ constraints: { version: customVersioning } });

  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=2" },
  }, noop);
  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=3" },
  }, noop);

  assert(
    findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=2",
    }),
  );
  assert(
    findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=3",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=4",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=5",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=6",
    }),
  );
});

Deno.test("A route could support multiple versions (find) / 1 (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.addConstraintStrategy(customVersioning);

  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=2" },
  }, noop);
  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=3" },
  }, noop);

  assert(
    findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=2",
    }),
  );
  assert(
    findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=3",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=4",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=5",
    }),
  );
  assert(
    !findMyWay.find("GET", "/", {
      version: "application/vnd.example.api+json;version=6",
    }),
  );
});

Deno.test("Overriding default strategies uses the custom deriveConstraint function", async () => {
  // t.plan()

  const findMyWay = FindMyWay({ constraints: { version: customVersioning } });

  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=2" },
  }, (req, res, params) => {
    deepEqual(req.headers.accept, "application/vnd.example.api+json;version=2");
  });

  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=3" },
  }, (req, res, params) => {
    deepEqual(req.headers.accept, "application/vnd.example.api+json;version=3");
  });

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { accept: "application/vnd.example.api+json;version=2" },
  });
  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { accept: "application/vnd.example.api+json;version=3" },
  });
});

Deno.test("Overriding default strategies uses the custom deriveConstraint function (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.addConstraintStrategy(customVersioning);

  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=2" },
  }, (req, res, params) => {
    deepEqual(req.headers.accept, "application/vnd.example.api+json;version=2");
  });

  findMyWay.on("GET", "/", {
    constraints: { version: "application/vnd.example.api+json;version=3" },
  }, (req, res, params) => {
    deepEqual(req.headers.accept, "application/vnd.example.api+json;version=3");
  });

  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { accept: "application/vnd.example.api+json;version=2" },
  });
  findMyWay.lookup({
    method: "GET",
    url: "/",
    headers: { accept: "application/vnd.example.api+json;version=3" },
  });
});

Deno.test("Overriding custom strategies throws as error (add strategy outside constructor)", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.addConstraintStrategy(customVersioning);

  assertThrows(
    () => findMyWay.addConstraintStrategy(customVersioning),
    new Error(
      "There already exists a custom constraint with the name version.",
    ),
  );
});

Deno.test("Overriding default strategies after defining a route with constraint", async () => {
  // t.plan()

  const findMyWay = FindMyWay();

  findMyWay.on("GET", "/", {
    constraints: { host: "jsr.io", version: "1.0.0" },
  }, () => {});

  assertThrows(
    () => findMyWay.addConstraintStrategy(customVersioning),
    new Error("There already exists a route with version constraint."),
  );
});
