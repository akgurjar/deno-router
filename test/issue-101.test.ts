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

  findMyWay.on('GET', '/:namespace/:type/:id', () => {})
  findMyWay.on('GET', '/:namespace/jobs/:name/run', () => {})

  deepEqual(
    findMyWay.find('GET', '/test_namespace/test_type/test_id').params,
    { namespace: 'test_namespace', type: 'test_type', id: 'test_id' }
  )

  deepEqual(
    findMyWay.find('GET', '/test_namespace/jobss/test_id').params,
    { namespace: 'test_namespace', type: 'jobss', id: 'test_id' }
  )

  deepEqual(
    findMyWay.find('GET', '/test_namespace/jobs/test_id').params,
    { namespace: 'test_namespace', type: 'jobs', id: 'test_id' }
  )
})
