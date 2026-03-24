// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('should return result in the done callback', async () => {
  // t.plan()

  const router = FindMyWay()
  router.on('GET', '/', () => 'asyncHandlerResult')

  router.lookup({ method: 'GET', url: '/' }, null, (err, result) => {
    deepEqual(err, null)
    deepEqual(result, 'asyncHandlerResult')
  })
})

Deno.test('should return an error in the done callback', async () => {
  // t.plan()

  const router = FindMyWay()
  const error = new Error('ASYNC_HANDLER_ERROR')
  router.on('GET', '/', () => { throw error })

  router.lookup({ method: 'GET', url: '/' }, null, (err, result) => {
    deepEqual(err, error)
    deepEqual(result, undefined)
  })
})
