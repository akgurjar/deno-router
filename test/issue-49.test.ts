// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';
const noop = () => {}

Deno.test('Defining static route after parametric - 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/static', noop)
  findMyWay.on('GET', '/:param', noop)

  assert(findMyWay.find('GET', '/static'))
  assert(findMyWay.find('GET', '/para'))
  assert(findMyWay.find('GET', '/s'))
})

Deno.test('Defining static route after parametric - 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:param', noop)
  findMyWay.on('GET', '/static', noop)

  assert(findMyWay.find('GET', '/static'))
  assert(findMyWay.find('GET', '/para'))
  assert(findMyWay.find('GET', '/s'))
})

Deno.test('Defining static route after parametric - 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:param', noop)
  findMyWay.on('GET', '/static', noop)
  findMyWay.on('GET', '/other', noop)

  assert(findMyWay.find('GET', '/static'))
  assert(findMyWay.find('GET', '/para'))
  assert(findMyWay.find('GET', '/s'))
  assert(findMyWay.find('GET', '/o'))
})

Deno.test('Defining static route after parametric - 4', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/static', noop)
  findMyWay.on('GET', '/other', noop)
  findMyWay.on('GET', '/:param', noop)

  assert(findMyWay.find('GET', '/static'))
  assert(findMyWay.find('GET', '/para'))
  assert(findMyWay.find('GET', '/s'))
  assert(findMyWay.find('GET', '/o'))
})

Deno.test('Defining static route after parametric - 5', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/static', noop)
  findMyWay.on('GET', '/:param', noop)
  findMyWay.on('GET', '/other', noop)

  assert(findMyWay.find('GET', '/static'))
  assert(findMyWay.find('GET', '/para'))
  assert(findMyWay.find('GET', '/s'))
  assert(findMyWay.find('GET', '/o'))
})

Deno.test('Should produce the same tree - 1', async () => {
  // t.plan()
  const findMyWay1 = FindMyWay()
  const findMyWay2 = FindMyWay()

  findMyWay1.on('GET', '/static', noop)
  findMyWay1.on('GET', '/:param', noop)

  findMyWay2.on('GET', '/:param', noop)
  findMyWay2.on('GET', '/static', noop)

  deepEqual(findMyWay1.tree, findMyWay2.tree)
})

Deno.test('Should produce the same tree - 2', async () => {
  // t.plan()
  const findMyWay1 = FindMyWay()
  const findMyWay2 = FindMyWay()
  const findMyWay3 = FindMyWay()

  findMyWay1.on('GET', '/:param', noop)
  findMyWay1.on('GET', '/static', noop)
  findMyWay1.on('GET', '/other', noop)

  findMyWay2.on('GET', '/static', noop)
  findMyWay2.on('GET', '/:param', noop)
  findMyWay2.on('GET', '/other', noop)

  findMyWay3.on('GET', '/static', noop)
  findMyWay3.on('GET', '/other', noop)
  findMyWay3.on('GET', '/:param', noop)

  deepEqual(findMyWay1.tree, findMyWay2.tree)
  deepEqual(findMyWay2.tree, findMyWay3.tree)
  deepEqual(findMyWay1.tree, findMyWay3.tree)
})
