// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('contain param and wildcard together', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '/:lang/item/:id', (req, res, params) => {
    deepEqual(params.lang, 'fr')
    deepEqual(params.id, '12345')
  })

  findMyWay.on('GET', '/:lang/item/*', (req, res, params) => {
    deepEqual(params.lang, 'fr')
    deepEqual(params['*'], '12345/edit')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/fr/item/12345', headers: {} },
    null
  )

  findMyWay.lookup(
    { method: 'GET', url: '/fr/item/12345/edit', headers: {} },
    null
  )
})
