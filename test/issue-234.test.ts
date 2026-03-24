// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Match static url without encoding option', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const handler = () => {}

  findMyWay.on('GET', '/🍌', handler)

  deepEqual(findMyWay.find('GET', '/🍌').handler, handler)
  deepEqual(findMyWay.find('GET', '/%F0%9F%8D%8C').handler, handler)
})

Deno.test('Match parametric url with encoding option', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/🍌/:param', () => {})

  deepEqual(findMyWay.find('GET', '/🍌/@').params, { param: '@' })
  deepEqual(findMyWay.find('GET', '/%F0%9F%8D%8C/@').params, { param: '@' })
})

Deno.test('Match encoded parametric url with encoding option', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/🍌/:param', () => {})

  deepEqual(findMyWay.find('GET', '/🍌/%23').params, { param: '#' })
  deepEqual(findMyWay.find('GET', '/%F0%9F%8D%8C/%23').params, { param: '#' })
})

Deno.test('Decode url components', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:param1/:param2', () => {})

  deepEqual(findMyWay.find('GET', '/foo%23bar/foo%23bar').params, { param1: 'foo#bar', param2: 'foo#bar' })
  deepEqual(findMyWay.find('GET', '/%F0%9F%8D%8C/%F0%9F%8D%8C').params, { param1: '🍌', param2: '🍌' })
  deepEqual(findMyWay.find('GET', '/%F0%9F%8D%8C/foo%23bar').params, { param1: '🍌', param2: 'foo#bar' })
})

Deno.test('Decode url components', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/foo🍌bar/:param1/:param2', () => {})
  findMyWay.on('GET', '/user/:id', () => {})

  deepEqual(findMyWay.find('GET', '/foo%F0%9F%8D%8Cbar/foo%23bar/foo%23bar').params, { param1: 'foo#bar', param2: 'foo#bar' })
  deepEqual(findMyWay.find('GET', '/user/maintainer+tomas').params, { id: 'maintainer+tomas' })
  deepEqual(findMyWay.find('GET', '/user/maintainer%2Btomas').params, { id: 'maintainer+tomas' })
  deepEqual(findMyWay.find('GET', '/user/maintainer%20tomas').params, { id: 'maintainer tomas' })
  deepEqual(findMyWay.find('GET', '/user/maintainer%252Btomas').params, { id: 'maintainer%2Btomas' })
})

Deno.test('Decode url components', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:param1', () => {})
  deepEqual(findMyWay.find('GET', '/foo%23bar').params, { param1: 'foo#bar' })
  deepEqual(findMyWay.find('GET', '/foo%24bar').params, { param1: 'foo$bar' })
  deepEqual(findMyWay.find('GET', '/foo%26bar').params, { param1: 'foo&bar' })
  deepEqual(findMyWay.find('GET', '/foo%2bbar').params, { param1: 'foo+bar' })
  deepEqual(findMyWay.find('GET', '/foo%2Bbar').params, { param1: 'foo+bar' })
  deepEqual(findMyWay.find('GET', '/foo%2cbar').params, { param1: 'foo,bar' })
  deepEqual(findMyWay.find('GET', '/foo%2Cbar').params, { param1: 'foo,bar' })
  deepEqual(findMyWay.find('GET', '/foo%2fbar').params, { param1: 'foo/bar' })
  deepEqual(findMyWay.find('GET', '/foo%2Fbar').params, { param1: 'foo/bar' })

  deepEqual(findMyWay.find('GET', '/foo%3abar').params, { param1: 'foo:bar' })
  deepEqual(findMyWay.find('GET', '/foo%3Abar').params, { param1: 'foo:bar' })
  deepEqual(findMyWay.find('GET', '/foo%3bbar').params, { param1: 'foo;bar' })
  deepEqual(findMyWay.find('GET', '/foo%3Bbar').params, { param1: 'foo;bar' })
  deepEqual(findMyWay.find('GET', '/foo%3dbar').params, { param1: 'foo=bar' })
  deepEqual(findMyWay.find('GET', '/foo%3Dbar').params, { param1: 'foo=bar' })
  deepEqual(findMyWay.find('GET', '/foo%3fbar').params, { param1: 'foo?bar' })
  deepEqual(findMyWay.find('GET', '/foo%3Fbar').params, { param1: 'foo?bar' })

  deepEqual(findMyWay.find('GET', '/foo%40bar').params, { param1: 'foo@bar' })
})
