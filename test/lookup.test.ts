// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('lookup calls route handler with no context', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/example', function handle (req, res, params) {
    // without context, this will be the result object returned from router.find
    deepEqual(this.handler, handle)
  })

  findMyWay.lookup({ method: 'GET', url: '/example', headers: {} }, null)
})

Deno.test('lookup calls route handler with context as scope', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const ctx = { foo: 'bar' }

  findMyWay.on('GET', '/example', function handle (req, res, params) {
    deepEqual(this, ctx)
  })

  findMyWay.lookup({ method: 'GET', url: '/example', headers: {} }, null, ctx)
})

Deno.test('lookup calls default route handler with no context', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute (req, res) {
      // without context, the default route's scope is the router itself
      deepEqual(this, findMyWay)
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/example', headers: {} }, null)
})

Deno.test('lookup calls default route handler with context as scope', async () => {
  // t.plan()

  const ctx = { foo: 'bar' }

  const findMyWay = FindMyWay({
    defaultRoute (req, res) {
      deepEqual(this, ctx)
    }
  })

  findMyWay.lookup({ method: 'GET', url: '/example', headers: {} }, null, ctx)
})
