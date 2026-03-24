// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('full-url', async () => {
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/a', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  findMyWay.on('GET', '/a/:id', (req, res) => {
    res.end('{"message":"hello world"}')
  })

  deepEqual(findMyWay.find('GET', 'http://localhost/a', { host: 'localhost' }), findMyWay.find('GET', '/a', { host: 'localhost' }))
  deepEqual(findMyWay.find('GET', 'http://localhost:8080/a', { host: 'localhost' }), findMyWay.find('GET', '/a', { host: 'localhost' }))
  deepEqual(findMyWay.find('GET', 'http://123.123.123.123/a', {}), findMyWay.find('GET', '/a', {}))
  deepEqual(findMyWay.find('GET', 'https://localhost/a', { host: 'localhost' }), findMyWay.find('GET', '/a', { host: 'localhost' }))

  deepEqual(findMyWay.find('GET', 'http://localhost/a/100', { host: 'localhost' }), findMyWay.find('GET', '/a/100', { host: 'localhost' }))
  deepEqual(findMyWay.find('GET', 'http://localhost:8080/a/100', { host: 'localhost' }), findMyWay.find('GET', '/a/100', { host: 'localhost' }))
  deepEqual(findMyWay.find('GET', 'http://123.123.123.123/a/100', {}), findMyWay.find('GET', '/a/100', {}))
  deepEqual(findMyWay.find('GET', 'https://localhost/a/100', { host: 'localhost' }), findMyWay.find('GET', '/a/100', { host: 'localhost' }))
})
