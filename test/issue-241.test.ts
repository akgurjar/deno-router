// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Double colon and parametric children', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/::articles', () => {})
  findMyWay.on('GET', '/:article_name', () => {})

  deepEqual(findMyWay.find('GET', '/:articles').params, {})
  deepEqual(findMyWay.find('GET', '/articles_param').params, { article_name: 'articles_param' })
})

Deno.test('Double colon and parametric children', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/::test::foo/:param/::articles', () => {})
  findMyWay.on('GET', '/::test::foo/:param/:article_name', () => {})

  deepEqual(
    findMyWay.find('GET', '/:test:foo/param_value1/:articles').params,
    { param: 'param_value1' }
  )
  deepEqual(
    findMyWay.find('GET', '/:test:foo/param_value2/articles_param').params,
    { param: 'param_value2', article_name: 'articles_param' }
  )
})
