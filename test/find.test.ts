// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import FindMyWay from '../index.ts';

Deno.test('find calls can pass no constraints', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/a', () => {})
  findMyWay.on('GET', '/a/b', () => {})

  assert(findMyWay.find('GET', '/a'))
  assert(findMyWay.find('GET', '/a/b'))
  assert(!findMyWay.find('GET', '/a/b/c'))
})
