// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import FindMyWay from '../index.ts';

Deno.test('Set method property when splitting node', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  function handler (req, res, params) {
    assert()
  }

  findMyWay.on('GET', '/health-a/health', handler)
  findMyWay.on('GET', '/health-b/health', handler)

  assert(!findMyWay.prettyPrint().includes('undefined'))
})
