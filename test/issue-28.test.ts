// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('wildcard (more complex test)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '/test/*', (req, res, params) => {
    switch (params['*']) {
      case 'hello':
        assert('correct parameter')
        break
      case 'hello/world':
        assert('correct parameter')
        break
      case '':
        assert('correct parameter')
        break
      default:
        fail('wrong parameter: ' + params['*'])
    }
  })

  findMyWay.lookup(
    { method: 'GET', url: '/test/hello', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'GET', url: '/test/hello/world', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'GET', url: '/test/', headers: {} },
    null
  )
})

Deno.test('Wildcard inside a node with a static route but different method', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '/test/hello', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/test/hello', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test/hello', headers: {} },
    null
  )
})

Deno.test('Wildcard inside a node with a static route but different method (more complex case)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      if (req.url === '/test/helloo' && req.method === 'GET') {
        assert('Everything fine')
      } else {
        fail('we should not be here, the url is: ' + req.url)
      }
    }
  })

  findMyWay.on('GET', '/test/hello', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/test/hello', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'GET', url: '/test/helloo', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test/', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test/helloo', headers: {} },
    null
  )
})

Deno.test('Wildcard edge cases', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '/test1/foo', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/test2/foo', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    deepEqual(params['*'], 'test1/foo')
  })

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test1/foo', headers: {} },
    null
  )
})

Deno.test('Wildcard edge cases same method', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('OPTIONS', '/test1/foo', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.on('OPTIONS', '/test2/foo', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    deepEqual(params['*'], 'test/foo')
  })

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test1/foo', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test/foo', headers: {} },
    null
  )
})

Deno.test('Wildcard and parametric edge cases', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('OPTIONS', '/test1/foo', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.on('OPTIONS', '/test2/foo', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/:test/foo', (req, res, params) => {
    deepEqual(params.test, 'example')
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    deepEqual(params['*'], 'test/foo/hey')
  })

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test1/foo', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'OPTIONS', url: '/test/foo/hey', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'GET', url: '/example/foo', headers: {} },
    null
  )
})

Deno.test('Mixed wildcard and static with same method', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '/foo1/bar1/baz', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/bar2/baz', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo2/bar2/baz', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    deepEqual(params['*'], '/foo1/bar1/kuux')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo1/bar1/kuux', headers: {} },
    null
  )
})

Deno.test('Nested wildcards case - 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    deepEqual(params['*'], 'bar1/kuux')
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo1/bar1/kuux', headers: {} },
    null
  )
})

Deno.test('Nested wildcards case - 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    deepEqual(params['*'], 'bar1/kuux')
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo1/bar1/kuux', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    deepEqual(params['*'], 'bar1/kuux')
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo4/param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo1/bar1/kuux', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    deepEqual(params.param, 'bar1')
  })

  findMyWay.on('GET', '/foo4/param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo3/bar1', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo4/param', (req, res, params) => {
    deepEqual(req.url, '/foo4/param')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo4/param', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 4', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/param', (req, res, params) => {
    deepEqual(req.url, '/foo1/param')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo1/param', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 5', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    deepEqual(params['*'], 'param/hello/test/long/routee')
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/param/hello/test/long/route', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo1/param/hello/test/long/routee', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 6', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    deepEqual(params['*'], '/foo4/param/hello/test/long/routee')
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo4/param/hello/test/long/route', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo4/param/hello/test/long/routee', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 7', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    deepEqual(params.param, 'hello')
  })

  findMyWay.on('GET', '/foo3/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo4/example/hello/test/long/route', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo3/hello', headers: {} },
    null
  )
})

Deno.test('Nested wildcards with parametric and static - 8', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo2/*', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/:param', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo3/*', (req, res, params) => {
    deepEqual(params['*'], 'hello/world')
  })

  findMyWay.on('GET', '/foo4/param/hello/test/long/route', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo3/hello/world', headers: {} },
    null
  )
})

Deno.test('Wildcard node with constraints', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', { constraints: { host: 'fastify.io' } }, (req, res, params) => {
    deepEqual(params['*'], '/foo1/foo3')
  })

  findMyWay.on('GET', '/foo1/*', { constraints: { host: 'something-else.io' } }, (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.on('GET', '/foo1/foo2', (req, res, params) => {
    fail('we should not be here, the url is: ' + req.url)
  })

  findMyWay.lookup(
    { method: 'GET', url: '/foo1/foo3', headers: { host: 'fastify.io' } },
    null
  )
})

Deno.test('Wildcard must be the last character in the route', async () => {
  // t.plan()

  const expectedError = new Error('Wildcard must be the last character in the route')

  const findMyWay = FindMyWay()

  assertThrows(() => findMyWay.on('GET', '*1', () => {}), expectedError)
  assertThrows(() => findMyWay.on('GET', '*/', () => {}), expectedError)
  assertThrows(() => findMyWay.on('GET', '*?', () => {}), expectedError)

  assertThrows(() => findMyWay.on('GET', '/foo*123', () => {}), expectedError)
  assertThrows(() => findMyWay.on('GET', '/foo*?', () => {}), expectedError)
  assertThrows(() => findMyWay.on('GET', '/foo*/', () => {}), expectedError)
})
