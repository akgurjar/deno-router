// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('wildcard should not limit by maxParamLength', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('we should not be here, the url is: ' + req.url)
    }
  })

  findMyWay.on('GET', '*', (req, res, params) => {
    deepEqual(params['*'], '/portfolios/b5859fb9-6c76-4db8-b3d1-337c5be3fd8b/instruments/2a694406-b43f-439d-aa11-0c814805c930/positions')
  })

  findMyWay.lookup(
    { method: 'GET', url: '/portfolios/b5859fb9-6c76-4db8-b3d1-337c5be3fd8b/instruments/2a694406-b43f-439d-aa11-0c814805c930/positions', headers: {} },
    null
  )
})
