// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Multi-parametric tricky path', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('Should not be defaultRoute')
  })

  findMyWay.on('GET', '/:param1-static-:param2', () => {})

  deepEqual(
    findMyWay.find('GET', '/param1-static-param2', {}).params,
    { param1: 'param1', param2: 'param2' }
  )
  deepEqual(
    findMyWay.find('GET', '/param1.1-param1.2-static-param2.1-param2.2', {}).params,
    { param1: 'param1.1-param1.2', param2: 'param2.1-param2.2' }
  )
  deepEqual(
    findMyWay.find('GET', '/param1-1-param1-2-static-param2-1-param2-2', {}).params,
    { param1: 'param1-1-param1-2', param2: 'param2-1-param2-2' }
  )
  deepEqual(
    findMyWay.find('GET', '/static-static-static', {}).params,
    { param1: 'static', param2: 'static' }
  )
  deepEqual(
    findMyWay.find('GET', '/static-static-static-static', {}).params,
    { param1: 'static', param2: 'static-static' }
  )
  deepEqual(
    findMyWay.find('GET', '/static-static1-static-static', {}).params,
    { param1: 'static-static1', param2: 'static' }
  )
})

Deno.test('Multi-parametric nodes with different static ending 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('Should not be defaultRoute')
  })

  const paramHandler = () => {}
  const multiParamHandler = () => {}

  findMyWay.on('GET', '/v1/foo/:code', paramHandler)
  findMyWay.on('GET', '/v1/foo/:code.png', multiParamHandler)

  deepEqual(findMyWay.find('GET', '/v1/foo/hello', {}).handler, paramHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello', {}).params, { code: 'hello' })

  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png', {}).handler, multiParamHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png', {}).params, { code: 'hello' })
})

Deno.test('Multi-parametric nodes with different static ending 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('Should not be defaultRoute')
  })

  const jpgHandler = () => {}
  const pngHandler = () => {}

  findMyWay.on('GET', '/v1/foo/:code.jpg', jpgHandler)
  findMyWay.on('GET', '/v1/foo/:code.png', pngHandler)

  deepEqual(findMyWay.find('GET', '/v1/foo/hello.jpg', {}).handler, jpgHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello.jpg', {}).params, { code: 'hello' })

  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png', {}).handler, pngHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png', {}).params, { code: 'hello' })
})

Deno.test('Multi-parametric nodes with different static ending 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('Should not be defaultRoute')
  })

  const jpgHandler = () => {}
  const pngHandler = () => {}

  findMyWay.on('GET', '/v1/foo/:code.jpg/bar', jpgHandler)
  findMyWay.on('GET', '/v1/foo/:code.png/bar', pngHandler)

  deepEqual(findMyWay.find('GET', '/v1/foo/hello.jpg/bar', {}).handler, jpgHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello.jpg/bar', {}).params, { code: 'hello' })

  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png/bar', {}).handler, pngHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png/bar', {}).params, { code: 'hello' })
})

Deno.test('Multi-parametric nodes with different static ending 4', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('Should not be defaultRoute')
  })

  const handler = () => {}
  const jpgHandler = () => {}
  const pngHandler = () => {}

  findMyWay.on('GET', '/v1/foo/:code/bar', handler)
  findMyWay.on('GET', '/v1/foo/:code.jpg/bar', jpgHandler)
  findMyWay.on('GET', '/v1/foo/:code.png/bar', pngHandler)

  deepEqual(findMyWay.find('GET', '/v1/foo/hello/bar', {}).handler, handler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello/bar', {}).params, { code: 'hello' })

  deepEqual(findMyWay.find('GET', '/v1/foo/hello.jpg/bar', {}).handler, jpgHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello.jpg/bar', {}).params, { code: 'hello' })

  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png/bar', {}).handler, pngHandler)
  deepEqual(findMyWay.find('GET', '/v1/foo/hello.png/bar', {}).params, { code: 'hello' })
})
