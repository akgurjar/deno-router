// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('handler should have the store object', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', (req, res, params, store) => {
    deepEqual(store.hello, 'world')
  }, { hello: 'world' })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
})

Deno.test('find a store object', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  const fn = () => {}

  findMyWay.on('GET', '/test', fn, { hello: 'world' })

  deepEqual(findMyWay.find('GET', '/test'), {
    handler: fn,
    params: {},
    store: { hello: 'world' },
    searchParams: {}
  })
})

Deno.test('update the store', async () => {
  // t.plan()
  const findMyWay = FindMyWay()
  let bool = false

  findMyWay.on('GET', '/test', (req, res, params, store) => {
    if (!bool) {
      deepEqual(store.hello, 'world')
      store.hello = 'hello'
      bool = true
      findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
    } else {
      deepEqual(store.hello, 'hello')
    }
  }, { hello: 'world' })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
})
