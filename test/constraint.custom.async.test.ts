// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';
const rfdc = await import('rfdc')({ proto: true })

const customHeaderConstraint = {
  name: 'requestedBy',
  storage: function () {
    const requestedBys = {}
    return {
      get: (requestedBy) => { return requestedBys[requestedBy] || null },
      set: (requestedBy, store) => { requestedBys[requestedBy] = store }
    }
  },
  deriveConstraint: (req, ctx, done) => {
    if (req.headers['user-agent'] === 'wrong') {
      done(new Error('wrong user-agent'))
      return
    }

    done(null, req.headers['user-agent'])
  }
}

Deno.test('should derive multiple async constraints', async () => {
  // t.plan()

  const customHeaderConstraint2 = rfdc(customHeaderConstraint)
  customHeaderConstraint2.name = 'requestedBy2'

  const router = FindMyWay({ constraints: { requestedBy: customHeaderConstraint, requestedBy2: customHeaderConstraint2 } })
  router.on('GET', '/', { constraints: { requestedBy: 'node', requestedBy2: 'node' } }, () => 'asyncHandler')

  router.lookup(
    {
      method: 'GET',
      url: '/',
      headers: {
        'user-agent': 'node'
      }
    },
    null,
    (err, result) => {
      deepEqual(err, null)
      deepEqual(result, 'asyncHandler')
    }
  )
})

Deno.test('lookup should return an error from deriveConstraint', async () => {
  // t.plan()

  const router = FindMyWay({ constraints: { requestedBy: customHeaderConstraint } })
  router.on('GET', '/', { constraints: { requestedBy: 'node' } }, () => 'asyncHandler')

  router.lookup(
    {
      method: 'GET',
      url: '/',
      headers: {
        'user-agent': 'wrong'
      }
    },
    null,
    (err, result) => {
      t.assert.deepStrictEqual(err, new Error('wrong user-agent'))
      deepEqual(result, undefined)
    }
  )
})

Deno.test('should derive sync and async constraints', async () => {
  // t.plan()

  const router = FindMyWay({ constraints: { requestedBy: customHeaderConstraint } })
  router.on('GET', '/', { constraints: { version: '1.0.0', requestedBy: 'node' } }, () => 'asyncHandlerV1')
  router.on('GET', '/', { constraints: { version: '2.0.0', requestedBy: 'node' } }, () => 'asyncHandlerV2')

  router.lookup(
    {
      method: 'GET',
      url: '/',
      headers: {
        'user-agent': 'node',
        'accept-version': '1.0.0'
      }
    },
    null,
    (err, result) => {
      deepEqual(err, null)
      deepEqual(result, 'asyncHandlerV1')
    }
  )

  router.lookup(
    {
      method: 'GET',
      url: '/',
      headers: {
        'user-agent': 'node',
        'accept-version': '2.0.0'
      }
    },
    null,
    (err, result) => {
      deepEqual(err, null)
      deepEqual(result, 'asyncHandlerV2')
    }
  )
})
