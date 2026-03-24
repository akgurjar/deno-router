// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Wildcard mixed with dynamic and common prefix / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.on('GET', '/obj/params/*', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.on('GET', '/obj/:id', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.on('GET', '/obj_params/*', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj/params', headers: {} }, null)

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj/params/12', headers: {} }, null)

  findMyWay.lookup({ method: 'GET', url: '/obj/params/12', headers: {} }, null)

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj_params/12', headers: {} }, null)

  findMyWay.lookup({ method: 'GET', url: '/obj_params/12', headers: {} }, null)
})

Deno.test('Wildcard mixed with dynamic and common prefix / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('OPTIONS', '/*', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.on('OPTIONS', '/obj/*', (req, res, params) => {
    deepEqual(req.method, 'OPTIONS')
  })

  findMyWay.on('GET', '/obj/params/*', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.on('GET', '/obj/:id', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.on('GET', '/obj_params/*', (req, res, params) => {
    deepEqual(req.method, 'GET')
  })

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj_params/params', headers: {} }, null)

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj/params', headers: {} }, null)

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj/params/12', headers: {} }, null)

  findMyWay.lookup({ method: 'GET', url: '/obj/params/12', headers: {} }, null)

  findMyWay.lookup({ method: 'OPTIONS', url: '/obj_params/12', headers: {} }, null)

  findMyWay.lookup({ method: 'GET', url: '/obj_params/12', headers: {} }, null)
})
