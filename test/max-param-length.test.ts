// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('maxParamLength default value is 500', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  deepEqual(findMyWay.maxParamLength, 100)
})

Deno.test('maxParamLength should set the maximum length for a parametric route', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ maxParamLength: 10 })
  findMyWay.on('GET', '/test/:param', () => {})
  deepEqual(findMyWay.find('GET', '/test/123456789abcd'), null)
})

Deno.test('maxParamLength should set the maximum length for a parametric (regex) route', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ maxParamLength: 10 })
  findMyWay.on('GET', '/test/:param(^\\d+$)', () => {})

  deepEqual(findMyWay.find('GET', '/test/123456789abcd'), null)
})

Deno.test('maxParamLength should set the maximum length for a parametric (multi) route', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ maxParamLength: 10 })
  findMyWay.on('GET', '/test/:param-bar', () => {})
  deepEqual(findMyWay.find('GET', '/test/123456789abcd'), null)
})

Deno.test('maxParamLength should set the maximum length for a parametric (regex with suffix) route', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ maxParamLength: 10 })
  findMyWay.on('GET', '/test/:param(^\\w{3})bar', () => {})
  deepEqual(findMyWay.find('GET', '/test/123456789abcd'), null)
})
