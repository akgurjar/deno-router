// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('case insensitive static routes of level 1', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/woo', (req, res, params) => {
    assert('we should be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/WOO', headers: {} }, null)
})

Deno.test('case insensitive static routes of level 2', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/woo', (req, res, params) => {
    assert('we should be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/FoO/WOO', headers: {} }, null)
})

Deno.test('case insensitive static routes of level 3', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/bar/woo', (req, res, params) => {
    assert('we should be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/Foo/bAR/WoO', headers: {} }, null)
})

Deno.test('parametric case insensitive', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/:param', (req, res, params) => {
    deepEqual(params.param, 'bAR')
  })

  findMyWay.lookup({ method: 'GET', url: '/Foo/bAR', headers: {} }, null)
})

Deno.test('parametric case insensitive with a static part', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/my-:param', (req, res, params) => {
    deepEqual(params.param, 'bAR')
  })

  findMyWay.lookup({ method: 'GET', url: '/Foo/MY-bAR', headers: {} }, null)
})

Deno.test('parametric case insensitive with capital letter', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/:Param', (req, res, params) => {
    deepEqual(params.Param, 'bAR')
  })

  findMyWay.lookup({ method: 'GET', url: '/Foo/bAR', headers: {} }, null)
})

Deno.test('case insensitive with capital letter in static path with param', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/Foo/bar/:param', (req, res, params) => {
    deepEqual(params.param, 'baZ')
  })

  findMyWay.lookup({ method: 'GET', url: '/foo/bar/baZ', headers: {} }, null)
})

Deno.test('case insensitive with multiple paths containing capital letter in static path with param', async () => {
  /*
   * This is a reproduction of the issue documented at
   * https://github.com/delvedor/find-my-way/issues/96.
   */
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/Foo/bar/:param', (req, res, params) => {
    deepEqual(params.param, 'baZ')
  })

  findMyWay.on('GET', '/Foo/baz/:param', (req, res, params) => {
    deepEqual(params.param, 'baR')
  })

  findMyWay.lookup({ method: 'GET', url: '/foo/bar/baZ', headers: {} }, null)
  findMyWay.lookup({ method: 'GET', url: '/foo/baz/baR', headers: {} }, null)
})

Deno.test('case insensitive with multiple mixed-case params within same slash couple', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/:param1-:param2', (req, res, params) => {
    deepEqual(params.param1, 'My')
    deepEqual(params.param2, 'bAR')
  })

  findMyWay.lookup({ method: 'GET', url: '/FOO/My-bAR', headers: {} }, null)
})

Deno.test('case insensitive with multiple mixed-case params', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/:param1/:param2', (req, res, params) => {
    deepEqual(params.param1, 'My')
    deepEqual(params.param2, 'bAR')
  })

  findMyWay.lookup({ method: 'GET', url: '/FOO/My/bAR', headers: {} }, null)
})

Deno.test('case insensitive with wildcard', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/*', (req, res, params) => {
    deepEqual(params['*'], 'baR')
  })

  findMyWay.lookup({ method: 'GET', url: '/FOO/baR', headers: {} }, null)
})

Deno.test('parametric case insensitive with multiple routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('POST', '/foo/:param/Static/:userId/Save', (req, res, params) => {
    deepEqual(params.param, 'bAR')
    deepEqual(params.userId, 'one')
  })
  findMyWay.on('POST', '/foo/:param/Static/:userId/Update', (req, res, params) => {
    deepEqual(params.param, 'Bar')
    deepEqual(params.userId, 'two')
  })
  findMyWay.on('POST', '/foo/:param/Static/:userId/CANCEL', (req, res, params) => {
    deepEqual(params.param, 'bAR')
    deepEqual(params.userId, 'THREE')
  })

  findMyWay.lookup({ method: 'POST', url: '/foo/bAR/static/one/SAVE', headers: {} }, null)
  findMyWay.lookup({ method: 'POST', url: '/fOO/Bar/Static/two/update', headers: {} }, null)
  findMyWay.lookup({ method: 'POST', url: '/Foo/bAR/STATIC/THREE/cAnCeL', headers: {} }, null)
})
