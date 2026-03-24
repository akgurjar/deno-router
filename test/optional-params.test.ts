// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Test route with optional parameter', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:param/b/:optional?', (req, res, params) => {
    if (params.optional) {
      deepEqual(params.optional, 'foo')
    } else {
      deepEqual(params.optional, undefined)
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar/b', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar/b/foo', headers: {} }, null)
})

Deno.test('Test for duplicate route with optional param', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/:bar?', (req, res, params) => {})

  try {
    findMyWay.on('GET', '/foo', (req, res, params) => {})
    fail('method is already declared for route with optional param')
  } catch (e) {
    deepEqual(e.message, 'Method \'GET\' already declared for route \'/foo\' with constraints \'{}\'')
  }
})

Deno.test('Test for param with ? not at the end', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  try {
    findMyWay.on('GET', '/foo/:bar?/baz', (req, res, params) => {})
    fail('Optional Param in the middle of the path is not allowed')
  } catch (e) {
    deepEqual(e.message, 'Optional Parameter needs to be the last parameter of the path')
  }
})

Deno.test('Multi parametric route with optional param', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1-:p2?', (req, res, params) => {
    if (params.p1 && params.p2) {
      deepEqual(params.p1, 'foo-bar')
      deepEqual(params.p2, 'baz')
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar-baz', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/a', headers: {} }, null)
})

Deno.test('Optional Parameter with ignoreTrailingSlash = true', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: true,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/test/hello/:optional?', (req, res, params) => {
    if (params.optional) {
      deepEqual(params.optional, 'foo')
    } else {
      deepEqual(params.optional, undefined)
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello/', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/foo', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/foo/', headers: {} }, null)
})

Deno.test('Optional Parameter with ignoreTrailingSlash = false', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: false,
    defaultRoute: (req, res) => {
      deepEqual(req.url, '/test/hello/foo/')
    }
  })

  findMyWay.on('GET', '/test/hello/:optional?', (req, res, params) => {
    if (req.url === '/test/hello/') {
      deepEqual(params, { optional: '' })
    } else if (req.url === '/test/hello') {
      deepEqual(params, {})
    } else if (req.url === '/test/hello/foo') {
      deepEqual(params, { optional: 'foo' })
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello/', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/foo', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/foo/', headers: {} }, null)
})

Deno.test('Optional Parameter with ignoreDuplicateSlashes = true', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreDuplicateSlashes: true,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/test/hello/:optional?', (req, res, params) => {
    if (params.optional) {
      deepEqual(params.optional, 'foo')
    } else {
      deepEqual(params.optional, undefined)
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/test//hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/foo', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test//hello//foo', headers: {} }, null)
})

Deno.test('Optional Parameter with ignoreDuplicateSlashes = false', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreDuplicateSlashes: false,
    defaultRoute: (req, res) => {
      if (req.url === '/test//hello') {
        deepEqual(req.params, undefined)
      } else if (req.url === '/test//hello/foo') {
        deepEqual(req.params, undefined)
      }
    }
  })

  findMyWay.on('GET', '/test/hello/:optional?', (req, res, params) => {
    if (req.url === '/test/hello/') {
      deepEqual(params, { optional: '' })
    } else if (req.url === '/test/hello') {
      deepEqual(params, {})
    } else if (req.url === '/test/hello/foo') {
      deepEqual(params, { optional: 'foo' })
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/test//hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/foo', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test//hello/foo', headers: {} }, null)
})

Deno.test('deregister a route with optional param', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:param/b/:optional?', (req, res, params) => {})

  assert(findMyWay.find('GET', '/a/:param/b'))
  assert(findMyWay.find('GET', '/a/:param/b/:optional'))

  findMyWay.off('GET', '/a/:param/b/:optional?')

  assert(!findMyWay.find('GET', '/a/:param/b'))
  assert(!findMyWay.find('GET', '/a/:param/b/:optional'))
})

Deno.test('optional parameter on root', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/:optional?', (req, res, params) => {
    if (params.optional) {
      deepEqual(params.optional, 'foo')
    } else {
      deepEqual(params.optional, undefined)
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/foo', headers: {} }, null)
})
