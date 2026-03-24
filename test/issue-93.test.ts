// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import FindMyWay from '../index.ts';
const noop = () => {}

Deno.test('Should keep semver store when split node', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/t1', { constraints: { version: '1.0.0' } }, noop)
  findMyWay.on('GET', '/t2', { constraints: { version: '2.1.0' } }, noop)

  assert(findMyWay.find('GET', '/t1', { version: '1.0.0' }))
  assert(findMyWay.find('GET', '/t2', { version: '2.x' }))
  assert(!findMyWay.find('GET', '/t1', { version: '2.x' }))
  assert(!findMyWay.find('GET', '/t2', { version: '1.0.0' }))
})
