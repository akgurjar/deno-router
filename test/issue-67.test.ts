// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';
const noop = () => {}

Deno.test('static routes', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/b/', noop)
  findMyWay.on('GET', '/b/bulk', noop)
  findMyWay.on('GET', '/b/ulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('parametric routes', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  function foo () { }

  findMyWay.on('GET', '/foo/:fooParam', foo)
  findMyWay.on('GET', '/foo/bar/:barParam', noop)
  findMyWay.on('GET', '/foo/search', noop)
  findMyWay.on('GET', '/foo/submit', noop)

  deepEqual(findMyWay.find('GET', '/foo/awesome-parameter').handler, foo)
  deepEqual(findMyWay.find('GET', '/foo/b-first-character').handler, foo)
  deepEqual(findMyWay.find('GET', '/foo/s-first-character').handler, foo)
  deepEqual(findMyWay.find('GET', '/foo/se-prefix').handler, foo)
  deepEqual(findMyWay.find('GET', '/foo/sx-prefix').handler, foo)
})

Deno.test('parametric with common prefix', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', noop)
  findMyWay.on('GET', '/:test', (req, res, params) => {
    deepEqual(
      { test: 'text' },
      params
    )
  })
  findMyWay.on('GET', '/text/hello', noop)

  findMyWay.lookup({ url: '/text', method: 'GET', headers: {} })
})
