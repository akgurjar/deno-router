// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Falling back for node\'s parametric brother', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/foo/:id', () => {})
  findMyWay.on('GET', '/foo/:color/:id', () => {})
  findMyWay.on('GET', '/foo/red', () => {})

  deepEqual(findMyWay.find('GET', '/foo/red/123').params, { color: 'red', id: '123' })
  deepEqual(findMyWay.find('GET', '/foo/blue/123').params, { color: 'blue', id: '123' })
  deepEqual(findMyWay.find('GET', '/foo/red').params, {})
})
