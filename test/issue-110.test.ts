// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Nested static parametric route, url with parameter common prefix > 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/api/foo/b2', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/api/foo/bar/qux', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/api/foo/:id/bar', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/foo', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  deepEqual(findMyWay.find('GET', '/api/foo/b-123/bar').params, { id: 'b-123' })
})
