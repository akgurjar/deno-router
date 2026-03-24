// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import FindMyWay from '../index.ts';

const noop = function () {}

Deno.test('issue-62', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ allowUnsafeRegex: true })

  findMyWay.on('GET', '/foo/:id(([a-f0-9]{3},?)+)', noop)

  assert(!findMyWay.find('GET', '/foo/qwerty'))
  assert(findMyWay.find('GET', '/foo/bac,1ea'))
})

Deno.test('issue-62 - escape chars', async () => {
  const findMyWay = FindMyWay()

  // t.plan()

  findMyWay.get('/foo/:param(\\([a-f0-9]{3}\\))', noop)

  assert(!findMyWay.find('GET', '/foo/abc'))
  assert(findMyWay.find('GET', '/foo/(abc)', {}))
})
