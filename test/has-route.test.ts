// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
const rfdc = await import('rfdc')({ proto: true })
import FindMyWay from '../index.ts';

function equalRouters (t, router1, router2) {
  t.assert.deepStrictEqual(router1._opts, router2._opts)
  deepEqual(router1.routes, router2.routes)
  deepEqual(JSON.stringify(router1.trees), JSON.stringify(router2.trees))

  t.assert.deepStrictEqual(
    router1.constrainer.strategies,
    router2.constrainer.strategies
  )
  t.assert.deepStrictEqual(
    router1.constrainer.strategiesInUse,
    router2.constrainer.strategiesInUse
  )
  t.assert.deepStrictEqual(
    router1.constrainer.asyncStrategiesInUse,
    router2.constrainer.asyncStrategiesInUse
  )
}

Deno.test('hasRoute returns false if there is no routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/example')
  deepEqual(hasRoute, false)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns true for a static route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/example', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/example')
  deepEqual(hasRoute, true)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns false for a static route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/example', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/example1')
  deepEqual(hasRoute, false)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns true for a parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:param', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/:param')
  deepEqual(hasRoute, true)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns false for a parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo/:param', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/bar/:param')
  deepEqual(hasRoute, false)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns true for a parametric route with static suffix', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:param-static', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/:param-static')
  deepEqual(hasRoute, true)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns false for a parametric route with static suffix', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:param-static1', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/:param-static2')
  deepEqual(hasRoute, false)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns true even if a param name different', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:param1', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/:param2')
  deepEqual(hasRoute, true)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns true for a multi-parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:param1-:param2', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/:param1-:param2')
  deepEqual(hasRoute, true)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns false for a multi-parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo/:param1-:param2/bar1', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/foo/:param1-:param2/bar2')
  deepEqual(hasRoute, false)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns true for a regexp route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:param(^\\d+$)', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/:param(^\\d+$)')
  deepEqual(hasRoute, true)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns false for a regexp route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:file(^\\S+).png', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/:file(^\\D+).png')
  deepEqual(hasRoute, false)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns true for a wildcard route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/example/*', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/example/*')
  deepEqual(hasRoute, true)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('hasRoute returns false for a wildcard route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo1/*', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const hasRoute = findMyWay.hasRoute('GET', '/foo2/*')
  deepEqual(hasRoute, false)

  equalRouters(t, findMyWay, fundMyWayClone)
})
