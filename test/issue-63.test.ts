// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import factory from '../index.ts';

const noop = function () {}

Deno.test('issue-63', async () => {
  // t.plan()

  const fmw = factory()

  assertThrows(function () {
    fmw.on('GET', '/foo/:id(a', noop)
  })

  try {
    fmw.on('GET', '/foo/:id(a', noop)
    fail('should fail')
  } catch (err) {
    deepEqual(err.message, 'Invalid regexp expression in "/foo/:id(a"')
  }
})
