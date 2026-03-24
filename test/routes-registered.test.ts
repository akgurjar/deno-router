// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

function initializeRoutes (router, handler, quantity) {
  for (const x of Array(quantity).keys()) {
    router.on('GET', '/test-route-' + x, handler)
  }
  return router
}

Deno.test('verify routes registered', async () => {
  const assertPerTest = 5
  const quantity = 5
  // 1 (check length) + quantity of routes * quantity of tests per route
  t.plan(1 + (quantity * assertPerTest))

  let findMyWay = FindMyWay()
  const defaultHandler = (req, res, params) => res.end(JSON.stringify({ hello: 'world' }))

  findMyWay = initializeRoutes(findMyWay, defaultHandler, quantity)
  deepEqual(findMyWay.routes.length, quantity)
  findMyWay.routes.forEach((route, idx) => {
    deepEqual(route.method, 'GET')
    deepEqual(route.path, '/test-route-' + idx)
    t.assert.deepStrictEqual(route.opts, {})
    deepEqual(route.handler, defaultHandler)
    deepEqual(route.store, undefined)
  })
})

Deno.test('verify routes registered and deregister', async () => {
  // 1 (check length) + quantity of routes * quantity of tests per route
  // t.plan()

  let findMyWay = FindMyWay()
  const quantity = 2
  const defaultHandler = (req, res, params) => res.end(JSON.stringify({ hello: 'world' }))

  findMyWay = initializeRoutes(findMyWay, defaultHandler, quantity)
  deepEqual(findMyWay.routes.length, quantity)
  findMyWay.off('GET', '/test-route-0')
  deepEqual(findMyWay.routes.length, quantity - 1)
})
