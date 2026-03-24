// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('If there are constraints param, router.off method support filter', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/a', { constraints: { host: '1' } }, () => {}, { name: 1 })
  findMyWay.on('GET', '/a', { constraints: { host: '2', version: '1.0.0' } }, () => {}, { name: 2 })
  findMyWay.on('GET', '/a', { constraints: { host: '2', version: '2.0.0' } }, () => {}, { name: 3 })

  deepEqual(findMyWay.find('GET', '/a', { host: '1' }).store, { name: 1 })
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '1.0.0' }).store, { name: 2 })
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '2.0.0' }).store, { name: 3 })

  findMyWay.off('GET', '/a', { host: '1' })

  deepEqual(findMyWay.find('GET', '/a', { host: '1' }), null)
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '1.0.0' }).store, { name: 2 })
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '2.0.0' }).store, { name: 3 })

  findMyWay.off('GET', '/a', { host: '2', version: '1.0.0' })

  deepEqual(findMyWay.find('GET', '/a', { host: '1' }), null)
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '1.0.0' }), null)
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '2.0.0' }).store, { name: 3 })

  findMyWay.off('GET', '/a', { host: '2', version: '2.0.0' })

  deepEqual(findMyWay.find('GET', '/a', { host: '1' }), null)
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '1.0.0' }), null)
  deepEqual(findMyWay.find('GET', '/a', { host: '2', version: '2.0.0' }), null)
})

Deno.test('If there are no constraints param, router.off method remove all matched router', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/a', { constraints: { host: '1' } }, () => {}, { name: 1 })
  findMyWay.on('GET', '/a', { constraints: { host: '2' } }, () => {}, { name: 2 })

  deepEqual(findMyWay.find('GET', '/a', { host: '1' }).store, { name: 1 })
  deepEqual(findMyWay.find('GET', '/a', { host: '2' }).store, { name: 2 })

  findMyWay.off('GET', '/a')

  deepEqual(findMyWay.find('GET', '/a', { host: '1' }), null)
  deepEqual(findMyWay.find('GET', '/a', { host: '2' }), null)
})
