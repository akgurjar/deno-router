// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import FindMyWay from '../index.ts';

Deno.test('Constraints should not be overrided when multiple router is created', async () => {
  // t.plan()

  const constraint = {
    name: 'secret',
    storage: function () {
      const secrets = {}
      return {
        get: (secret) => { return secrets[secret] || null },
        set: (secret, store) => { secrets[secret] = store }
      }
    },
    deriveConstraint: (req, ctx) => {
      return req.headers['x-secret']
    },
    validate () { return true }
  }

  const router1 = FindMyWay({ constraints: { secret: constraint } })
  FindMyWay()

  router1.on('GET', '/', { constraints: { secret: 'alpha' } }, () => {})
  router1.find('GET', '/', { secret: 'alpha' })

  assert('constraints is not overrided')
})
