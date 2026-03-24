// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('should setup parametric and regexp node', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const paramHandler = () => {}
  const regexpHandler = () => {}

  findMyWay.on('GET', '/foo/:bar', paramHandler)
  findMyWay.on('GET', '/foo/:bar(123)', regexpHandler)

  deepEqual(findMyWay.find('GET', '/foo/value').handler, paramHandler)
  deepEqual(findMyWay.find('GET', '/foo/123').handler, regexpHandler)
})

Deno.test('should setup parametric and multi-parametric node', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const paramHandler = () => {}
  const regexpHandler = () => {}

  findMyWay.on('GET', '/foo/:bar', paramHandler)
  findMyWay.on('GET', '/foo/:bar.png', regexpHandler)

  deepEqual(findMyWay.find('GET', '/foo/value').handler, paramHandler)
  deepEqual(findMyWay.find('GET', '/foo/value.png').handler, regexpHandler)
})

Deno.test('should throw when set upping two parametric nodes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo/:bar', () => {})

  assertThrows(() => findMyWay.on('GET', '/foo/:baz', () => {}))
})

Deno.test('should throw when set upping two regexp nodes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo/:bar(123)', () => {})

  assertThrows(() => findMyWay.on('GET', '/foo/:bar(456)', () => {}))
})

Deno.test('should set up two parametric nodes with static ending', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const paramHandler1 = () => {}
  const paramHandler2 = () => {}

  findMyWay.on('GET', '/foo/:bar.png', paramHandler1)
  findMyWay.on('GET', '/foo/:bar.jpeg', paramHandler2)

  deepEqual(findMyWay.find('GET', '/foo/value.png').handler, paramHandler1)
  deepEqual(findMyWay.find('GET', '/foo/value.jpeg').handler, paramHandler2)
})

Deno.test('should set up two regexp nodes with static ending', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const paramHandler1 = () => {}
  const paramHandler2 = () => {}

  findMyWay.on('GET', '/foo/:bar(123).png', paramHandler1)
  findMyWay.on('GET', '/foo/:bar(456).jpeg', paramHandler2)

  deepEqual(findMyWay.find('GET', '/foo/123.png').handler, paramHandler1)
  deepEqual(findMyWay.find('GET', '/foo/456.jpeg').handler, paramHandler2)
})

Deno.test('node with longer static suffix should have higher priority', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const paramHandler1 = () => {}
  const paramHandler2 = () => {}

  findMyWay.on('GET', '/foo/:bar.png', paramHandler1)
  findMyWay.on('GET', '/foo/:bar.png.png', paramHandler2)

  deepEqual(findMyWay.find('GET', '/foo/value.png').handler, paramHandler1)
  deepEqual(findMyWay.find('GET', '/foo/value.png.png').handler, paramHandler2)
})

Deno.test('node with longer static suffix should have higher priority', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  const paramHandler1 = () => {}
  const paramHandler2 = () => {}

  findMyWay.on('GET', '/foo/:bar.png.png', paramHandler2)
  findMyWay.on('GET', '/foo/:bar.png', paramHandler1)

  deepEqual(findMyWay.find('GET', '/foo/value.png').handler, paramHandler1)
  deepEqual(findMyWay.find('GET', '/foo/value.png.png').handler, paramHandler2)
})

Deno.test('should set up regexp node and node with static ending', async () => {
  // t.plan()

  const regexHandler = () => {}
  const multiParamHandler = () => {}

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/foo/:bar(123)', regexHandler)
  findMyWay.on('GET', '/foo/:bar(123).jpeg', multiParamHandler)

  deepEqual(findMyWay.find('GET', '/foo/123.jpeg').handler, multiParamHandler)
  deepEqual(findMyWay.find('GET', '/foo/123').handler, regexHandler)
})
