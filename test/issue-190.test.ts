// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('issue-190', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  let staticCounter = 0
  let paramCounter = 0
  const staticPath = function staticPath () { staticCounter++ }
  const paramPath = function paramPath () { paramCounter++ }
  const extraPath = function extraPath () { }
  findMyWay.on('GET', '/api/users/award_winners', staticPath)
  findMyWay.on('GET', '/api/users/admins', staticPath)
  findMyWay.on('GET', '/api/users/:id', paramPath)
  findMyWay.on('GET', '/api/:resourceType/foo', extraPath)

  deepEqual(findMyWay.find('GET', '/api/users/admins').handler, staticPath)
  deepEqual(findMyWay.find('GET', '/api/users/award_winners').handler, staticPath)
  deepEqual(findMyWay.find('GET', '/api/users/a766c023-34ec-40d2-923c-e8259a28d2c5').handler, paramPath)
  deepEqual(findMyWay.find('GET', '/api/users/b766c023-34ec-40d2-923c-e8259a28d2c5').handler, paramPath)

  findMyWay.lookup({
    method: 'GET',
    url: '/api/users/admins',
    headers: { }
  })
  findMyWay.lookup({
    method: 'GET',
    url: '/api/users/award_winners',
    headers: { }
  })
  findMyWay.lookup({
    method: 'GET',
    url: '/api/users/a766c023-34ec-40d2-923c-e8259a28d2c5',
    headers: { }
  })

  deepEqual(staticCounter, 2)
  deepEqual(paramCounter, 1)
})
