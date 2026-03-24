// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Parametric and static with shared prefix / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/woo', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.on('GET', '/:param', (req, res, params) => {
    deepEqual(params.param, 'winter')
  })

  findMyWay.lookup({ method: 'GET', url: '/winter', headers: {} }, null)
})

Deno.test('Parametric and static with shared prefix / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/woo', (req, res, params) => {
    assert('we should be here')
  })

  findMyWay.on('GET', '/:param', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/woo', headers: {} }, null)
})

Deno.test('Parametric and static with shared prefix (nested)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('We should be here')
    }
  })

  findMyWay.on('GET', '/woo', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.on('GET', '/:param', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/winter/coming', headers: {} }, null)
})

Deno.test('Parametric and static with shared prefix and different suffix', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('We should not be here')
    }
  })

  findMyWay.on('GET', '/example/shared/nested/test', (req, res, params) => {
    fail('We should not be here')
  })

  findMyWay.on('GET', '/example/:param/nested/other', (req, res, params) => {
    assert('We should be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/example/shared/nested/other', headers: {} }, null)
})

Deno.test('Parametric and static with shared prefix (with wildcard)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/woo', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.on('GET', '/:param', (req, res, params) => {
    deepEqual(params.param, 'winter')
  })

  findMyWay.on('GET', '/*', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/winter', headers: {} }, null)
})

Deno.test('Parametric and static with shared prefix (nested with wildcard)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/woo', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.on('GET', '/:param', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.on('GET', '/*', (req, res, params) => {
    deepEqual(params['*'], 'winter/coming')
  })

  findMyWay.lookup({ method: 'GET', url: '/winter/coming', headers: {} }, null)
})

Deno.test('Parametric and static with shared prefix (nested with split)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here')
    }
  })

  findMyWay.on('GET', '/woo', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.on('GET', '/:param', (req, res, params) => {
    deepEqual(params.param, 'winter')
  })

  findMyWay.on('GET', '/wo', (req, res, params) => {
    fail('we should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/winter', headers: {} }, null)
})
