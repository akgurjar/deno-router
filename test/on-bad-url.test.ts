// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('If onBadUrl is defined, then a bad url should be handled differently (find)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    },
    onBadUrl: (path, req, res) => {
      deepEqual(path, '/%world', { todo: 'this is not executed' })
    }
  })

  findMyWay.on('GET', '/hello/:id', (req, res) => {
    fail('Should not be here')
  })

  const handle = findMyWay.find('GET', '/hello/%world')
  t.assert.notDeepStrictEqual(handle, null)
})

Deno.test('If onBadUrl is defined, then a bad url should be handled differently (lookup)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    },
    onBadUrl: (path, req, res) => {
      deepEqual(path, '/hello/%world')
    }
  })

  findMyWay.on('GET', '/hello/:id', (req, res) => {
    fail('Should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/hello/%world', headers: {} }, null)
})

Deno.test('If onBadUrl is not defined, then we should call the defaultRoute (find)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/hello/:id', (req, res) => {
    fail('Should not be here')
  })

  const handle = findMyWay.find('GET', '/hello/%world')
  deepEqual(handle, null)
})

Deno.test('If onBadUrl is not defined, then we should call the defaultRoute (lookup)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('Everything fine')
    }
  })

  findMyWay.on('GET', '/hello/:id', (req, res) => {
    fail('Should not be here')
  })

  findMyWay.lookup({ method: 'GET', url: '/hello/%world', headers: {} }, null)
})
