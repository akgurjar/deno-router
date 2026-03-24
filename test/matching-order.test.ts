// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Matching order', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/foo/bar/static', { constraints: { host: 'test' } }, () => {})
  findMyWay.on('GET', '/foo/bar/*', () => {})
  findMyWay.on('GET', '/foo/:param/static', () => {})

  deepEqual(findMyWay.find('GET', '/foo/bar/static', { host: 'test' }).params, {})
  deepEqual(findMyWay.find('GET', '/foo/bar/static').params, { '*': 'static' })
  deepEqual(findMyWay.find('GET', '/foo/value/static').params, { param: 'value' })
})
