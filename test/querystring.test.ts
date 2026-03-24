// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('should sanitize the url - query', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', (req, res, params, store, query) => {
    deepEqual(query, { hello: 'world' })
    assert('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test?hello=world', headers: {} }, null)
})

Deno.test('should sanitize the url - hash', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', (req, res, params, store, query) => {
    deepEqual(query, { hello: '' })
    assert('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test#hello', headers: {} }, null)
})

Deno.test('handles path and query separated by ; with useSemicolonDelimiter enabled', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    useSemicolonDelimiter: true
  })

  findMyWay.on('GET', '/test', (req, res, params, store, query) => {
    deepEqual(query, { jsessionid: '123456' })
    assert('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test;jsessionid=123456', headers: {} }, null)
})

Deno.test('handles path and query separated by ? using ; in the path', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test;jsessionid=123456', (req, res, params, store, query) => {
    deepEqual(query, { foo: 'bar' })
    assert('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test;jsessionid=123456?foo=bar', headers: {} }, null)
})
