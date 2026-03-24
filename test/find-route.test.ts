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

  t.assert.deepStrictEqual(router1.constrainer.strategies, router2.constrainer.strategies)
  t.assert.deepStrictEqual(
    router1.constrainer.strategiesInUse,
    router2.constrainer.strategiesInUse
  )
  t.assert.deepStrictEqual(
    router1.constrainer.asyncStrategiesInUse,
    router2.constrainer.asyncStrategiesInUse
  )
}

Deno.test('findRoute returns null if there is no routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/example')
  deepEqual(route, null)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler and store for a static route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  const store = { hello: 'world' }
  findMyWay.on('GET', '/example', handler, store)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/example')
  deepEqual(route.handler, handler)
  deepEqual(route.store, store)
  deepEqual(route.params, [])

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns null for a static route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/example', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/example1')
  deepEqual(route, null)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler and params for a parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/:param', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/:param')
  deepEqual(route.handler, handler)
  deepEqual(route.params, ['param'])

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns null for a parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/foo/:param', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/bar/:param')
  deepEqual(route, null)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler and params for a parametric route with static suffix', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/:param-static', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/:param-static')
  deepEqual(route.handler, handler)
  deepEqual(route.params, ['param'])

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns null for a parametric route with static suffix', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:param-static1', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/:param-static2')
  deepEqual(route, null)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler and original params even if a param name different', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/:param1', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/:param2')
  deepEqual(route.handler, handler)
  deepEqual(route.params, ['param1'])

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler and params for a multi-parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/:param1-:param2', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/:param1-:param2')
  deepEqual(route.handler, handler)
  deepEqual(route.params, ['param1', 'param2'])

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns null for a multi-parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo/:param1-:param2/bar1', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/foo/:param1-:param2/bar2')
  deepEqual(route, null)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler and regexp param for a regexp route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/:param(^\\d+$)', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/:param(^\\d+$)')
  deepEqual(route.handler, handler)
  deepEqual(route.params, ['param'])

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns null for a regexp route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/:file(^\\S+).png', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/:file(^\\D+).png')
  deepEqual(route, null)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler and wildcard param for a wildcard route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on('GET', '/example/*', handler)

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/example/*')
  deepEqual(route.handler, handler)
  deepEqual(route.params, ['*'])

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns null for a wildcard route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo1/*', () => {})

  const fundMyWayClone = rfdc(findMyWay)

  const route = findMyWay.findRoute('GET', '/foo2/*')
  deepEqual(route, null)

  equalRouters(t, findMyWay, fundMyWayClone)
})

Deno.test('findRoute returns handler for a constrained route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}
  findMyWay.on(
    'GET',
    '/example',
    { constraints: { version: '1.0.0' } },
    handler
  )

  const fundMyWayClone = rfdc(findMyWay)

  {
    const route = findMyWay.findRoute('GET', '/example')
    deepEqual(route, null)
  }

  {
    const route = findMyWay.findRoute('GET', '/example', { version: '1.0.0' })
    deepEqual(route.handler, handler)
  }

  {
    const route = findMyWay.findRoute('GET', '/example', { version: '2.0.0' })
    deepEqual(route, null)
  }

  equalRouters(t, findMyWay, fundMyWayClone)
})
