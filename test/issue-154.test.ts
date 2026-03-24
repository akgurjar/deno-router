// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import FindMyWay from '../index.ts';
const noop = () => {}

Deno.test('Should throw when not sending a string', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  assertThrows(() => {
    findMyWay.on('GET', '/t1', { constraints: { version: 42 } }, noop)
  })
  assertThrows(() => {
    findMyWay.on('GET', '/t2', { constraints: { version: null } }, noop)
  })
  assertThrows(() => {
    findMyWay.on('GET', '/t2', { constraints: { version: true } }, noop)
  })
})
