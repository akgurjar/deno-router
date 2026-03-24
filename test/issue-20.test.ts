// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Standard case', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be here')
    }
  })

  findMyWay.on('GET', '/a/:param', (req, res, params) => {
    deepEqual(params.param, 'perfectly-fine-route')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/perfectly-fine-route', headers: {} }, null)
})

Deno.test('Should be 404 / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('Everything good')
    }
  })

  findMyWay.on('GET', '/a/:param', (req, res, params) => {
    fail('We should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/a', headers: {} }, null)
})

Deno.test('Should be 404 / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('Everything good')
    }
  })

  findMyWay.on('GET', '/a/:param', (req, res, params) => {
    fail('We should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/a-non-existing-route', headers: {} }, null)
})

Deno.test('Should be 404 / 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('Everything good')
    }
  })

  findMyWay.on('GET', '/a/:param', (req, res, params) => {
    fail('We should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/a//', headers: {} }, null)
})

Deno.test('Should get an empty parameter', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('We should not be here')
    }
  })

  findMyWay.on('GET', '/a/:param', (req, res, params) => {
    deepEqual(params.param, '')
  })

  findMyWay.lookup({ method: 'GET', url: '/a/', headers: {} }, null)
})
