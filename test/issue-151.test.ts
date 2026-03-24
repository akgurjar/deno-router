// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Wildcard route should not be blocked by Parametric with different method / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    fail('Should not be here')
  })

  findMyWay.on('OPTIONS', '/obj/*', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.on('GET', '/obj/:id', (req, res, params) => {
    fail('Should not be GET')
  })

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj/params', headers: {} }, null)
})

Deno.test('Wildcard route should not be blocked by Parametric with different method / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('OPTIONS', '/*', { version: '1.2.3' }, (req, res, params) => {
    fail('Should not be here')
  })

  findMyWay.on('OPTIONS', '/obj/*', { version: '1.2.3' }, (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.on('GET', '/obj/:id', { version: '1.2.3' }, (req, res, params) => {
    fail('Should not be GET')
  })

  findMyWay.lookup({
    method: 'OPTIONS',
    url: '/obj/params',
    headers: { 'accept-version': '1.2.3' }
  }, null)
})
