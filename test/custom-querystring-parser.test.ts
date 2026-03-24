// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import querystring from 'fast-querystring';
import FindMyWay from '../index.ts';

Deno.test('Custom querystring parser', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    querystringParser: function (str) {
      deepEqual(str, 'foo=bar&baz=faz')
      return querystring.parse(str)
    }
  })
  findMyWay.on('GET', '/', () => {})

  deepEqual(findMyWay.find('GET', '/?foo=bar&baz=faz').searchParams, { foo: 'bar', baz: 'faz' })
})

Deno.test('Custom querystring parser should be called also if there is nothing to parse', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    querystringParser: function (str) {
      deepEqual(str, '')
      return querystring.parse(str)
    }
  })
  findMyWay.on('GET', '/', () => {})

  deepEqual(findMyWay.find('GET', '/').searchParams, {})
})

Deno.test('Querystring without value', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    querystringParser: function (str) {
      deepEqual(str, 'foo')
      return querystring.parse(str)
    }
  })
  findMyWay.on('GET', '/', () => {})
  deepEqual(findMyWay.find('GET', '/?foo').searchParams, { foo: '' })
})
