// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('the router is an object with methods', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  deepEqual(typeof findMyWay.on, 'function')
  deepEqual(typeof findMyWay.off, 'function')
  deepEqual(typeof findMyWay.lookup, 'function')
  deepEqual(typeof findMyWay.find, 'function')
})

Deno.test('on throws for invalid method', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  assertThrows(() => {
    findMyWay.on('INVALID', '/a/b')
  })
})

Deno.test('on throws for invalid path', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  // Non string
  assertThrows(() => {
    findMyWay.on('GET', 1)
  })

  // Empty
  assertThrows(() => {
    findMyWay.on('GET', '')
  })

  // Doesn't start with / or *
  assertThrows(() => {
    findMyWay.on('GET', 'invalid')
  })
})

Deno.test('register a route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', () => {
    assert('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
})

Deno.test('register a route with multiple methods', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on(['GET', 'POST'], '/test', () => {
    assert('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'POST', url: '/test', headers: {} }, null)
})

Deno.test('does not register /test/*/ when ignoreTrailingSlash is true', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: true
  })

  findMyWay.on('GET', '/test/*', () => {})
  deepEqual(
    findMyWay.routes.filter((r) => r.path.includes('/test')).length,
    1
  )
})

Deno.test('off throws for invalid method', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  assertThrows(() => {
    findMyWay.off('INVALID', '/a/b')
  })
})

Deno.test('off throws for invalid path', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  // Non string
  assertThrows(() => {
    findMyWay.off('GET', 1)
  })

  // Empty
  assertThrows(() => {
    findMyWay.off('GET', '')
  })

  // Doesn't start with / or *
  assertThrows(() => {
    findMyWay.off('GET', 'invalid')
  })
})

Deno.test('off with nested wildcards with parametric and static', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    deepEqual(params['*'], '/foo2/first/second')
  })
  findMyWay.on('GET', '/foo1/*', () => {})
  findMyWay.on('GET', '/foo2/*', () => {})
  findMyWay.on('GET', '/foo3/:param', () => {})
  findMyWay.on('GET', '/foo3/*', () => {})
  findMyWay.on('GET', '/foo4/param/hello/test/long/route', () => {})

  const route1 = findMyWay.find('GET', '/foo3/first/second')
  deepEqual(route1.params['*'], 'first/second')

  findMyWay.off('GET', '/foo3/*')

  const route2 = findMyWay.find('GET', '/foo3/first/second')
  deepEqual(route2.params['*'], '/foo3/first/second')

  findMyWay.off('GET', '/foo2/*')
  findMyWay.lookup(
    { method: 'GET', url: '/foo2/first/second', headers: {} },
    null
  )
})

Deno.test('off removes all routes when ignoreTrailingSlash is true', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: true
  })

  findMyWay.on('GET', '/test1/', () => {})
  deepEqual(findMyWay.routes.length, 1)

  findMyWay.on('GET', '/test2', () => {})
  deepEqual(findMyWay.routes.length, 2)

  findMyWay.off('GET', '/test1')
  deepEqual(findMyWay.routes.length, 1)
  deepEqual(
    findMyWay.routes.filter((r) => r.path === '/test2').length,
    1
  )
  deepEqual(
    findMyWay.routes.filter((r) => r.path === '/test2/').length,
    0
  )

  findMyWay.off('GET', '/test2/')
  deepEqual(findMyWay.routes.length, 0)
})

Deno.test('off removes all routes when ignoreDuplicateSlashes is true', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreDuplicateSlashes: true
  })

  findMyWay.on('GET', '//test1', () => {})
  deepEqual(findMyWay.routes.length, 1)

  findMyWay.on('GET', '/test2', () => {})
  deepEqual(findMyWay.routes.length, 2)

  findMyWay.off('GET', '/test1')
  deepEqual(findMyWay.routes.length, 1)
  deepEqual(
    findMyWay.routes.filter((r) => r.path === '/test2').length,
    1
  )
  deepEqual(
    findMyWay.routes.filter((r) => r.path === '//test2').length,
    0
  )

  findMyWay.off('GET', '//test2')
  deepEqual(findMyWay.routes.length, 0)
})

Deno.test('deregister a route without children', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/a', () => {})
  findMyWay.on('GET', '/a/b', () => {})
  findMyWay.off('GET', '/a/b')

  assert(findMyWay.find('GET', '/a'))
  assert(!findMyWay.find('GET', '/a/b'))
})

Deno.test('deregister a route with children', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/a', () => {})
  findMyWay.on('GET', '/a/b', () => {})
  findMyWay.off('GET', '/a')

  assert(!findMyWay.find('GET', '/a'))
  assert(findMyWay.find('GET', '/a/b'))
})

Deno.test('deregister a route by method', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on(['GET', 'POST'], '/a', () => {})
  findMyWay.off('GET', '/a')

  assert(!findMyWay.find('GET', '/a'))
  assert(findMyWay.find('POST', '/a'))
})

Deno.test('deregister a route with multiple methods', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on(['GET', 'POST'], '/a', () => {})
  findMyWay.off(['GET', 'POST'], '/a')

  assert(!findMyWay.find('GET', '/a'))
  assert(!findMyWay.find('POST', '/a'))
})

Deno.test('reset a router', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on(['GET', 'POST'], '/a', () => {})
  findMyWay.reset()

  assert(!findMyWay.find('GET', '/a'))
  assert(!findMyWay.find('POST', '/a'))
})

Deno.test('default route', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: () => {
      assert('inside the default route')
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
})

Deno.test('parametric route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    deepEqual(params.id, 'hello')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
})

Deno.test('multiple parametric route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    deepEqual(params.id, 'hello')
  })

  findMyWay.on('GET', '/other-test/:id', (req, res, params) => {
    deepEqual(params.id, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/other-test/world', headers: {} }, null)
})

Deno.test('multiple parametric route with the same prefix', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    deepEqual(params.id, 'hello')
  })

  findMyWay.on('GET', '/test/:id/world', (req, res, params) => {
    deepEqual(params.id, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/world/world', headers: {} }, null)
})

Deno.test('nested parametric route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:hello/test/:world', (req, res, params) => {
    deepEqual(params.hello, 'hello')
    deepEqual(params.world, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello/test/world', headers: {} }, null)
})

Deno.test('nested parametric route with same prefix', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', (req, res, params) => {
    assert('inside route')
  })

  findMyWay.on('GET', '/test/:hello/test/:world', (req, res, params) => {
    deepEqual(params.hello, 'hello')
    deepEqual(params.world, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello/test/world', headers: {} }, null)
})

Deno.test('long route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/abc/def/ghi/lmn/opq/rst/uvz', (req, res, params) => {
    assert('inside long path')
  })

  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz', headers: {} }, null)
})

Deno.test('long parametric route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/abc/:def/ghi/:lmn/opq/:rst/uvz', (req, res, params) => {
    deepEqual(params.def, 'def')
    deepEqual(params.lmn, 'lmn')
    deepEqual(params.rst, 'rst')
  })

  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz', headers: {} }, null)
})

Deno.test('long parametric route with common prefix', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', (req, res, params) => {
    throw new Error('I shoul not be here')
  })

  findMyWay.on('GET', '/abc', (req, res, params) => {
    throw new Error('I shoul not be here')
  })

  findMyWay.on('GET', '/abc/:def', (req, res, params) => {
    deepEqual(params.def, 'def')
  })

  findMyWay.on('GET', '/abc/:def/ghi/:lmn', (req, res, params) => {
    deepEqual(params.def, 'def')
    deepEqual(params.lmn, 'lmn')
  })

  findMyWay.on('GET', '/abc/:def/ghi/:lmn/opq/:rst', (req, res, params) => {
    deepEqual(params.def, 'def')
    deepEqual(params.lmn, 'lmn')
    deepEqual(params.rst, 'rst')
  })

  findMyWay.on('GET', '/abc/:def/ghi/:lmn/opq/:rst/uvz', (req, res, params) => {
    deepEqual(params.def, 'def')
    deepEqual(params.lmn, 'lmn')
    deepEqual(params.rst, 'rst')
  })

  findMyWay.lookup({ method: 'GET', url: '/abc/def', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/abc/def/ghi/lmn/opq/rst/uvz', headers: {} }, null)
})

Deno.test('common prefix', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/f', (req, res, params) => {
    assert('inside route')
  })

  findMyWay.on('GET', '/ff', (req, res, params) => {
    assert('inside route')
  })

  findMyWay.on('GET', '/ffa', (req, res, params) => {
    assert('inside route')
  })

  findMyWay.on('GET', '/ffb', (req, res, params) => {
    assert('inside route')
  })

  findMyWay.lookup({ method: 'GET', url: '/f', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/ff', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/ffa', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/ffb', headers: {} }, null)
})

Deno.test('wildcard', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/*', (req, res, params) => {
    deepEqual(params['*'], 'hello')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/test/hello', headers: {} },
    null
  )
})

Deno.test('catch all wildcard', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '*', (req, res, params) => {
    deepEqual(params['*'], '/test/hello')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/test/hello', headers: {} },
    null
  )
})

Deno.test('find should return the route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test', fn)

  deepEqual(
    findMyWay.find('GET', '/test'),
    { handler: fn, params: {}, store: null, searchParams: {} }
  )
})

Deno.test('find should return the route with params', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test/:id', fn)

  deepEqual(
    findMyWay.find('GET', '/test/hello'),
    { handler: fn, params: { id: 'hello' }, store: null, searchParams: {} }
  )
})

Deno.test('find should return a null handler if the route does not exist', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  deepEqual(
    findMyWay.find('GET', '/test'),
    null
  )
})

Deno.test('should decode the uri - parametric', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test/:id', fn)

  deepEqual(
    findMyWay.find('GET', '/test/he%2Fllo'),
    { handler: fn, params: { id: 'he/llo' }, store: null, searchParams: {} }
  )
})

Deno.test('should decode the uri - wildcard', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test/*', fn)

  deepEqual(
    findMyWay.find('GET', '/test/he%2Fllo'),
    { handler: fn, params: { '*': 'he/llo' }, store: null, searchParams: {} }
  )
})

Deno.test('safe decodeURIComponent', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test/:id', fn)

  deepEqual(
    findMyWay.find('GET', '/test/hel%"Flo'),
    null
  )
})

Deno.test('safe decodeURIComponent - nested route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test/hello/world/:id/blah', fn)

  deepEqual(
    findMyWay.find('GET', '/test/hello/world/hel%"Flo/blah'),
    null
  )
})

Deno.test('safe decodeURIComponent - wildcard', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test/*', fn)

  deepEqual(
    findMyWay.find('GET', '/test/hel%"Flo'),
    null
  )
})

Deno.test('static routes should be inserted before parametric / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/hello', () => {
    assert('inside correct handler')
  })

  findMyWay.on('GET', '/test/:id', () => {
    fail('wrong handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
})

Deno.test('static routes should be inserted before parametric / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', () => {
    fail('wrong handler')
  })

  findMyWay.on('GET', '/test/hello', () => {
    assert('inside correct handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
})

Deno.test('static routes should be inserted before parametric / 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:id', () => {
    fail('wrong handler')
  })

  findMyWay.on('GET', '/test', () => {
    assert('inside correct handler')
  })

  findMyWay.on('GET', '/test/:id', () => {
    fail('wrong handler')
  })

  findMyWay.on('GET', '/test/hello', () => {
    assert('inside correct handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
})

Deno.test('static routes should be inserted before parametric / 4', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:id', () => {
    assert('inside correct handler')
  })

  findMyWay.on('GET', '/test', () => {
    fail('wrong handler')
  })

  findMyWay.on('GET', '/test/:id', () => {
    assert('inside correct handler')
  })

  findMyWay.on('GET', '/test/hello', () => {
    fail('wrong handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/id', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/id', headers: {} }, null)
})

Deno.test('Static parametric with shared part of the path', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      deepEqual(req.url, '/example/shared/nested/oopss')
    }
  })

  findMyWay.on('GET', '/example/shared/nested/test', (req, res, params) => {
    fail('We should not be here')
  })

  findMyWay.on('GET', '/example/:param/nested/oops', (req, res, params) => {
    deepEqual(params.param, 'other')
  })

  findMyWay.lookup({ method: 'GET', url: '/example/shared/nested/oopss', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/example/other/nested/oops', headers: {} }, null)
})

Deno.test('parametric route with different method', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    deepEqual(params.id, 'hello')
  })

  findMyWay.on('POST', '/test/:other', (req, res, params) => {
    deepEqual(params.other, 'world')
  })

  findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
  findMyWay.lookup({ method: 'POST', url: '/test/world', headers: {} }, null)
})

Deno.test('params does not keep the object reference', async () => {
  return new Promise((resolve) => {
    // t.plan()
    const findMyWay = FindMyWay()
    let first = true

    findMyWay.on('GET', '/test/:id', (req, res, params) => {
      if (first) {
        setTimeout(() => {
          deepEqual(params.id, 'hello')
        }, 10)
      } else {
        setTimeout(() => {
          deepEqual(params.id, 'world')
          resolve()
        }, 10)
      }
      first = false
    })

    findMyWay.lookup({ method: 'GET', url: '/test/hello', headers: {} }, null)
    findMyWay.lookup({ method: 'GET', url: '/test/world', headers: {} }, null)
  })
})

Deno.test('Unsupported method (static)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('Everything ok')
    }
  })

  findMyWay.on('GET', '/', (req, res, params) => {
    fail('We should not be here')
  })

  findMyWay.lookup({ method: 'TROLL', url: '/', headers: {} }, null)
})

Deno.test('Unsupported method (wildcard)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('Everything ok')
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('We should not be here')
  })

  findMyWay.lookup({ method: 'TROLL', url: '/hello/world', headers: {} }, null)
})

Deno.test('Unsupported method (static find)', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', () => {})

  deepEqual(findMyWay.find('TROLL', '/'), null)
})

Deno.test('Unsupported method (wildcard find)', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '*', () => {})

  deepEqual(findMyWay.find('TROLL', '/hello/world'), null)
})

Deno.test('register all known HTTP methods', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  const { default: httpMethods } = await import('../lib/http-methods.ts');
  const handlers = {}
  for (const i in httpMethods) {
    const m = httpMethods[i]
    handlers[m] = function myHandler () {}
    findMyWay.on(m, '/test', handlers[m])
  }

  assert(findMyWay.find('COPY', '/test'))
  deepEqual(findMyWay.find('COPY', '/test').handler, handlers.COPY)

  assert(findMyWay.find('SUBSCRIBE', '/test'))
  deepEqual(findMyWay.find('SUBSCRIBE', '/test').handler, handlers.SUBSCRIBE)

  assert(findMyWay.find('M-SEARCH', '/test'))
  deepEqual(findMyWay.find('M-SEARCH', '/test').handler, handlers['M-SEARCH'])
})

Deno.test('off removes all routes without checking constraints if no constraints are specified', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', {}, (req, res) => {})
  findMyWay.on('GET', '/test', { constraints: { host: 'example.com' } }, (req, res) => {})

  findMyWay.off('GET', '/test')

  deepEqual(findMyWay.routes.length, 0)
})

Deno.test('off removes only constrainted routes if constraints are specified', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', {}, (req, res) => {})
  findMyWay.on('GET', '/test', { constraints: { host: 'example.com' } }, (req, res) => {})

  findMyWay.off('GET', '/test', { host: 'example.com' })

  deepEqual(findMyWay.routes.length, 1)
  assert(!findMyWay.routes[0].opts.constraints)
})

Deno.test('off removes no routes if provided constraints does not match any registered route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', {}, (req, res) => {})
  findMyWay.on('GET', '/test', { constraints: { version: '2.x' } }, (req, res) => {})
  findMyWay.on('GET', '/test', { constraints: { version: '3.x' } }, (req, res) => {})

  findMyWay.off('GET', '/test', { version: '1.x' })

  deepEqual(findMyWay.routes.length, 3)
})

Deno.test('off validates that constraints is an object or undefined', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  assertThrows(() => findMyWay.off('GET', '/', 2))
  assertThrows(() => findMyWay.off('GET', '/', 'should throw'))
  assertThrows(() => findMyWay.off('GET', '/', []))
  findMyWay.off('GET', '/', undefined)
  findMyWay.off('GET', '/', {})
  findMyWay.off('GET', '/')
})

Deno.test('off removes only unconstrainted route if an empty object is given as constraints', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.get('/', {}, () => {})
  findMyWay.get('/', { constraints: { host: 'fastify.io' } }, () => {})

  findMyWay.off('GET', '/', {})

  deepEqual(findMyWay.routes.length, 1)
  deepEqual(findMyWay.routes[0].opts.constraints.host, 'fastify.io')
})
