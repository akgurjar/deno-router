// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Parametric route, request.url contains dash', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:param/b', (req, res, params) => {
    deepEqual(params.param, 'foo-bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar/b', headers: {} }, null)
})

Deno.test('Parametric route with fixed suffix', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('Should not be defaultRoute')
  })

  findMyWay.on('GET', '/a/:param-static', () => {})
  findMyWay.on('GET', '/b/:param.static', () => {})

  deepEqual(findMyWay.find('GET', '/a/param-static', {}).params, { param: 'param' })
  deepEqual(findMyWay.find('GET', '/b/param.static', {}).params, { param: 'param' })

  deepEqual(findMyWay.find('GET', '/a/param-param-static', {}).params, { param: 'param-param' })
  deepEqual(findMyWay.find('GET', '/b/param.param.static', {}).params, { param: 'param.param' })

  deepEqual(findMyWay.find('GET', '/a/param.param-static', {}).params, { param: 'param.param' })
  deepEqual(findMyWay.find('GET', '/b/param-param.static', {}).params, { param: 'param-param' })
})

Deno.test('Regex param exceeds max parameter length', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('route not matched')
    }
  })

  findMyWay.on('GET', '/a/:param(^\\w{3})', (req, res, params) => {
    fail('regex match')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/fool', headers: {} }, null)
})

Deno.test('Parametric route with regexp and fixed suffix / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('route not matched')
    }
  })

  findMyWay.on('GET', '/a/:param(^\\w{3})bar', (req, res, params) => {
    fail('regex match')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/$mebar', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/a/foolol', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/a/foobaz', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/a/foolbar', headers: {} }, null)
})

Deno.test('Parametric route with regexp and fixed suffix / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:param(^\\w{3})bar', (req, res, params) => {
    deepEqual(params.param, 'foo')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foobar', headers: {} }, null)
})

Deno.test('Parametric route with regexp and fixed suffix / 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:param(^\\w{3}-\\w{3})foo', (req, res, params) => {
    deepEqual(params.param, 'abc-def')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/abc-deffoo', headers: {} }, null)
})

Deno.test('Multi parametric route / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1-:p2', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
  })

  findMyWay.on('GET', '/b/:p1.:p2', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.bar', headers: {} }, null)
})

Deno.test('Multi parametric route / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1-:p2', (req, res, params) => {
    deepEqual(params.p1, 'foo-bar')
    deepEqual(params.p2, 'baz')
  })

  findMyWay.on('GET', '/b/:p1.:p2', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar-baz')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar-baz', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.bar-baz', headers: {} }, null)
})

Deno.test('Multi parametric route / 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p_1-:$p', (req, res, params) => {
    deepEqual(params.p_1, 'foo')
    deepEqual(params.$p, 'bar')
  })

  findMyWay.on('GET', '/b/:p_1.:$p', (req, res, params) => {
    deepEqual(params.p_1, 'foo')
    deepEqual(params.$p, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.bar', headers: {} }, null)
})

Deno.test('Multi parametric route / 4', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('Everything good')
    }
  })

  findMyWay.on('GET', '/a/:p1-:p2', (req, res, params) => {
    fail('Should not match this route')
  })

  findMyWay.on('GET', '/b/:p1.:p2', (req, res, params) => {
    fail('Should not match this route')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo', headers: {} }, null)
})

Deno.test('Multi parametric route with regexp / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/at/:hour(^\\d+)h:minute(^\\d+)m', (req, res, params) => {
    deepEqual(params.hour, '0')
    deepEqual(params.minute, '42')
  })

  findMyWay.lookup({ method: 'GET', url: '/at/0h42m', headers: {} }, null)
})

Deno.test('Multi parametric route with colon separator', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/:param(.*)::suffix', (req, res, params) => {
    deepEqual(params.param, 'foo')
  })

  findMyWay.on('GET', '/:param1(.*)::suffix1-:param2(.*)::suffix2/static', (req, res, params) => {
    deepEqual(params.param1, 'foo')
    deepEqual(params.param2, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/foo:suffix', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/foo:suffix1-bar:suffix2/static', headers: {} }, null)
})

Deno.test('Multi parametric route with regexp / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:uuid(^[\\d-]{19})-:user(^\\w+)', (req, res, params) => {
    deepEqual(params.uuid, '1111-2222-3333-4444')
    deepEqual(params.user, 'foo')
  })

  findMyWay.on('GET', '/a/:uuid(^[\\d-]{19})-:user(^\\w+)/account', (req, res, params) => {
    deepEqual(params.uuid, '1111-2222-3333-4445')
    deepEqual(params.user, 'bar')
  })

  findMyWay.on('GET', '/b/:uuid(^[\\d-]{19}).:user(^\\w+)', (req, res, params) => {
    deepEqual(params.uuid, '1111-2222-3333-4444')
    deepEqual(params.user, 'foo')
  })

  findMyWay.on('GET', '/b/:uuid(^[\\d-]{19}).:user(^\\w+)/account', (req, res, params) => {
    deepEqual(params.uuid, '1111-2222-3333-4445')
    deepEqual(params.user, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/1111-2222-3333-4444-foo', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/a/1111-2222-3333-4445-bar/account', headers: {} }, null)

  findMyWay.lookup({ method: 'GET', url: '/b/1111-2222-3333-4444.foo', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/1111-2222-3333-4445.bar/account', headers: {} }, null)
})

Deno.test('Multi parametric route with fixed suffix', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1-:p2-baz', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
  })

  findMyWay.on('GET', '/b/:p1.:p2-baz', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar-baz', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.bar-baz', headers: {} }, null)
})

Deno.test('Multi parametric route with regexp and fixed suffix', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1(^\\w+)-:p2(^\\w+)-kuux', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'barbaz')
  })

  findMyWay.on('GET', '/b/:p1(^\\w+).:p2(^\\w+)-kuux', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'barbaz')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-barbaz-kuux', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.barbaz-kuux', headers: {} }, null)
})

Deno.test('Multi parametric route with wildcard', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1-:p2/*', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
  })

  findMyWay.on('GET', '/b/:p1.:p2/*', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar/baz', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.bar/baz', headers: {} }, null)
})

Deno.test('Nested multi parametric route', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1-:p2/b/:p3', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
    deepEqual(params.p3, 'baz')
  })

  findMyWay.on('GET', '/b/:p1.:p2/b/:p3', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, 'bar')
    deepEqual(params.p3, 'baz')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-bar/b/baz', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.bar/b/baz', headers: {} }, null)
})

Deno.test('Nested multi parametric route with regexp / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1(^\\w{3})-:p2(^\\d+)/b/:p3', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, '42')
    deepEqual(params.p3, 'bar')
  })

  findMyWay.on('GET', '/b/:p1(^\\w{3}).:p2(^\\d+)/b/:p3', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, '42')
    deepEqual(params.p3, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-42/b/bar', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.42/b/bar', headers: {} }, null)
})

Deno.test('Nested multi parametric route with regexp / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a/:p1(^\\w{3})-:p2/b/:p3', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, '42')
    deepEqual(params.p3, 'bar')
  })

  findMyWay.on('GET', '/b/:p1(^\\w{3}).:p2/b/:p3', (req, res, params) => {
    deepEqual(params.p1, 'foo')
    deepEqual(params.p2, '42')
    deepEqual(params.p3, 'bar')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/foo-42/b/bar', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/b/foo.42/b/bar', headers: {} }, null)
})
