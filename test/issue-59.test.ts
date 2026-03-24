// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';
const noop = () => {}

Deno.test('single-character prefix', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/b/', noop)
  findMyWay.on('GET', '/b/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('multi-character prefix', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bu/', noop)
  findMyWay.on('GET', '/bu/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('static / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/', noop)
  findMyWay.on('GET', '/bb/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('static / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/ff/', noop)
  findMyWay.on('GET', '/bb/ff/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
  deepEqual(findMyWay.find('GET', '/ff/bulk'), null)
})

Deno.test('static / 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/ff/', noop)
  findMyWay.on('GET', '/bb/ff/bulk', noop)
  findMyWay.on('GET', '/bb/ff/gg/bulk', noop)
  findMyWay.on('GET', '/bb/ff/bulk/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('with parameter / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/:foo/', noop)
  findMyWay.on('GET', '/:foo/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('with parameter / 2', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/', noop)
  findMyWay.on('GET', '/bb/:foo', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('with parameter / 3', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/ff/', noop)
  findMyWay.on('GET', '/bb/ff/:foo', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('with parameter / 4', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/:foo/', noop)
  findMyWay.on('GET', '/bb/:foo/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})

Deno.test('with parameter / 5', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/:foo/aa/', noop)
  findMyWay.on('GET', '/bb/:foo/aa/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
  deepEqual(findMyWay.find('GET', '/bb/foo/bulk'), null)
})

Deno.test('with parameter / 6', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/static/:parametric/static/:parametric', noop)
  findMyWay.on('GET', '/static/:parametric/static/:parametric/bulk', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
  deepEqual(findMyWay.find('GET', '/static/foo/bulk'), null)
  t.assert.notEqual(findMyWay.find('GET', '/static/foo/static/bulk'), null)
})

Deno.test('wildcard / 1', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/bb/', noop)
  findMyWay.on('GET', '/bb/*', noop)

  deepEqual(findMyWay.find('GET', '/bulk'), null)
})
