// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('double colon is replaced with single colon, no parameters', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('should not be default route')
  })

  function handler (req, res, params) {
    deepEqual(params, {})
  }

  findMyWay.on('GET', '/name::customVerb', handler)

  findMyWay.lookup({ method: 'GET', url: '/name:customVerb' }, null)
})

Deno.test('exactly one match for static route with colon', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  function handler () {}
  findMyWay.on('GET', '/name::customVerb', handler)

  deepEqual(findMyWay.find('GET', '/name:customVerb').handler, handler)
  deepEqual(findMyWay.find('GET', '/name:test'), null)
})

Deno.test('double colon is replaced with single colon, no parameters, same parent node name', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('should not be default route')
  })

  findMyWay.on('GET', '/name', () => {
    fail('should not be parent route')
  })

  findMyWay.on('GET', '/name::customVerb', (req, res, params) => {
    deepEqual(params, {})
  })

  findMyWay.lookup({ method: 'GET', url: '/name:customVerb', headers: {} }, null)
})

Deno.test('double colon is replaced with single colon, default route, same parent node name', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => assert('should be default route')
  })

  findMyWay.on('GET', '/name', () => {
    fail('should not be parent route')
  })

  findMyWay.on('GET', '/name::customVerb', () => {
    fail('should not be child route')
  })

  findMyWay.lookup({ method: 'GET', url: '/name:wrongCustomVerb', headers: {} }, null)
})

Deno.test('double colon is replaced with single colon, with parameters', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: () => fail('should not be default route')
  })

  findMyWay.on('GET', '/name1::customVerb1/:param1/name2::customVerb2:param2', (req, res, params) => {
    deepEqual(params, {
      param1: 'value1',
      param2: 'value2'
    })
  })

  findMyWay.lookup({ method: 'GET', url: '/name1:customVerb1/value1/name2:customVerb2value2', headers: {} }, null)
})
