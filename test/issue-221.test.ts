// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Should return correct param after switching from static route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/prefix-:id', () => {})
  findMyWay.on('GET', '/prefix-111', () => {})

  deepEqual(findMyWay.find('GET', '/prefix-1111').params, { id: '1111' })
})

Deno.test('Should return correct param after switching from static route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/prefix-111', () => {})
  findMyWay.on('GET', '/prefix-:id/hello', () => {})

  deepEqual(findMyWay.find('GET', '/prefix-1111/hello').params, { id: '1111' })
})

Deno.test('Should return correct param after switching from parametric route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/prefix-111', () => {})
  findMyWay.on('GET', '/prefix-:id/hello', () => {})
  findMyWay.on('GET', '/:id', () => {})

  deepEqual(findMyWay.find('GET', '/prefix-1111-hello').params, { id: 'prefix-1111-hello' })
})

Deno.test('Should return correct params after switching from parametric route', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:param1/test/:param2/prefix-111', () => {})
  findMyWay.on('GET', '/test/:param1/test/:param2/prefix-:id/hello', () => {})
  findMyWay.on('GET', '/test/:param1/test/:param2/:id', () => {})

  deepEqual(findMyWay.find('GET', '/test/value1/test/value2/prefix-1111-hello').params, {
    param1: 'value1',
    param2: 'value2',
    id: 'prefix-1111-hello'
  })
})
