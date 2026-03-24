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
import { NullObject } from "../lib/null-object.ts";

Deno.test("NullObject", () => {
  // t.plan()
  const nullObject = new NullObject();
  assert(nullObject instanceof NullObject);
  assert(typeof nullObject === "object");
});

Deno.test("has no methods from generic Object class", () => {
  function getAllPropertyNames(obj) {
    const props = [];

    do {
      Object.getOwnPropertyNames(obj).forEach(function (prop) {
        if (props.indexOf(prop) === -1) {
          props.push(prop);
        }
      });
    } while (obj = Object.getPrototypeOf(obj)); // eslint-disable-line

    return props;
  }
  const propertyNames = getAllPropertyNames({});
  t.plan(propertyNames.length + 1);

  const nullObject = new NullObject();

  for (const propertyName of propertyNames) {
    assert(!(propertyName in nullObject), propertyName);
  }
  deepEqual(getAllPropertyNames(nullObject).length, 0);
});
