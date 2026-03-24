// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Parametric regex match with similar routes', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:a(a)', () => {})
  findMyWay.on('GET', '/:param/static', () => {})

  deepEqual(findMyWay.find('GET', '/a', {}).params, { a: 'a' })
  deepEqual(findMyWay.find('GET', '/param/static', {}).params, { param: 'param' })
})

Deno.test('Parametric regex match with similar routes', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:a(a)', () => {})
  findMyWay.on('GET', '/:b(b)/static', () => {})

  deepEqual(findMyWay.find('GET', '/a', {}).params, { a: 'a' })
  deepEqual(findMyWay.find('GET', '/b/static', {}).params, { b: 'b' })
})

Deno.test('Parametric regex match with similar routes', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:a(a)/static', { constraints: { version: '1.0.0' } }, () => {})
  findMyWay.on('GET', '/:b(b)/static', { constraints: { version: '2.0.0' } }, () => {})

  deepEqual(findMyWay.find('GET', '/a/static', { version: '1.0.0' }).params, { a: 'a' })
  deepEqual(findMyWay.find('GET', '/b/static', { version: '2.0.0' }).params, { b: 'b' })
})
