// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Nested static parametric route, url with parameter common prefix > 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/bbbb', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/a/bbaa', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/a/babb', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('DELETE', '/a/:id', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  deepEqual(findMyWay.find('DELETE', '/a/bbar').params, { id: 'bbar' })
})

Deno.test('Parametric route, url with parameter common prefix > 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/aaa', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/aabb', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/abc', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/:id', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  deepEqual(findMyWay.find('GET', '/aab').params, { id: 'aab' })
})

Deno.test('Parametric route, url with multi parameter common prefix > 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/:id/aaa/:id2', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/:id/aabb/:id2', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/:id/abc/:id2', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/:a/:b', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  deepEqual(findMyWay.find('GET', '/hello/aab').params, { a: 'hello', b: 'aab' })
})

Deno.test('Mixed routes, url with parameter common prefix > 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/test', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/testify', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/test/hello', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/test/hello/test', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/te/:a', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/test/hello/:b', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/:c', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/text/hello', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/text/:d', (req, res, params) => {
    res.end('{"winter":"is here"}')
  })

  findMyWay.on('GET', '/text/:e/test', (req, res, params) => {
    res.end('{"winter":"is here"}')
  })

  deepEqual(findMyWay.find('GET', '/test').params, {})
  deepEqual(findMyWay.find('GET', '/testify').params, {})
  deepEqual(findMyWay.find('GET', '/test/hello').params, {})
  deepEqual(findMyWay.find('GET', '/test/hello/test').params, {})
  deepEqual(findMyWay.find('GET', '/te/hello').params, { a: 'hello' })
  deepEqual(findMyWay.find('GET', '/te/').params, { a: '' })
  deepEqual(findMyWay.find('GET', '/testy').params, { c: 'testy' })
  deepEqual(findMyWay.find('GET', '/besty').params, { c: 'besty' })
  deepEqual(findMyWay.find('GET', '/text/hellos/test').params, { e: 'hellos' })
  deepEqual(findMyWay.find('GET', '/te/hello/'), null)
  deepEqual(findMyWay.find('GET', '/te/hellos/testy'), null)
})

Deno.test('Parent parametric brother should not rewrite child node parametric brother', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/text/hello', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/text/:e/test', (req, res, params) => {
    res.end('{"winter":"is here"}')
  })

  findMyWay.on('GET', '/:c', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  deepEqual(findMyWay.find('GET', '/text/hellos/test').params, { e: 'hellos' })
})

Deno.test('Mixed parametric routes, with last defined route being static', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/test', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/test/:a', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/test/hello/:b', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/test/hello/:c/test', (req, res, params) => {
    res.end('{"hello":"world"}')
  })
  findMyWay.on('GET', '/test/hello/:c/:k', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  findMyWay.on('GET', '/test/world', (req, res, params) => {
    res.end('{"hello":"world"}')
  })

  deepEqual(findMyWay.find('GET', '/test/hello').params, { a: 'hello' })
  deepEqual(findMyWay.find('GET', '/test/hello/world/test').params, { c: 'world' })
  deepEqual(findMyWay.find('GET', '/test/hello/world/te').params, { c: 'world', k: 'te' })
  deepEqual(findMyWay.find('GET', '/test/hello/world/testy').params, { c: 'world', k: 'testy' })
})
