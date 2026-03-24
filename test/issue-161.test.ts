// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('Falling back for node\'s parametric brother without ignoreTrailingSlash', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/static/param1', () => {})
  findMyWay.on('GET', '/static/param2', () => {})
  findMyWay.on('GET', '/static/:paramA/next', () => {})

  deepEqual(findMyWay.find('GET', '/static/param1').params, {})
  deepEqual(findMyWay.find('GET', '/static/param2').params, {})
  deepEqual(findMyWay.find('GET', '/static/paramOther/next').params, { paramA: 'paramOther' })
  deepEqual(findMyWay.find('GET', '/static/param1/next').params, { paramA: 'param1' })
})

Deno.test('Falling back for node\'s parametric brother with ignoreTrailingSlash', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: true,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/static/param1', () => {})
  findMyWay.on('GET', '/static/param2', () => {})
  findMyWay.on('GET', '/static/:paramA/next', () => {})

  deepEqual(findMyWay.find('GET', '/static/param1').params, {})
  deepEqual(findMyWay.find('GET', '/static/param2').params, {})
  deepEqual(findMyWay.find('GET', '/static/paramOther/next').params, { paramA: 'paramOther' })
  deepEqual(findMyWay.find('GET', '/static/param1/next').params, { paramA: 'param1' })
})

Deno.test('Falling back for node\'s parametric brother without ignoreTrailingSlash', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: false,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/static/param1', () => {})
  findMyWay.on('GET', '/static/param2', () => {})
  findMyWay.on('GET', '/static/:paramA/next', () => {})

  findMyWay.on('GET', '/static/param1/next/param3', () => {})
  findMyWay.on('GET', '/static/param1/next/param4', () => {})
  findMyWay.on('GET', '/static/:paramA/next/:paramB/other', () => {})

  deepEqual(findMyWay.find('GET', '/static/param1/next/param3').params, {})
  deepEqual(findMyWay.find('GET', '/static/param1/next/param4').params, {})
  deepEqual(findMyWay.find('GET', '/static/paramOther/next/paramOther2/other').params, { paramA: 'paramOther', paramB: 'paramOther2' })
  deepEqual(findMyWay.find('GET', '/static/param1/next/param3/other').params, { paramA: 'param1', paramB: 'param3' })
})

Deno.test('Falling back for node\'s parametric brother with ignoreTrailingSlash', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: true,
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.on('GET', '/static/param1', () => {})
  findMyWay.on('GET', '/static/param2', () => {})
  findMyWay.on('GET', '/static/:paramA/next', () => {})

  findMyWay.on('GET', '/static/param1/next/param3', () => {})
  findMyWay.on('GET', '/static/param1/next/param4', () => {})
  findMyWay.on('GET', '/static/:paramA/next/:paramB/other', () => {})

  deepEqual(findMyWay.find('GET', '/static/param1/next/param3').params, {})
  deepEqual(findMyWay.find('GET', '/static/param1/next/param4').params, {})
  deepEqual(findMyWay.find('GET', '/static/paramOther/next/paramOther2/other').params, { paramA: 'paramOther', paramB: 'paramOther2' })
  deepEqual(findMyWay.find('GET', '/static/param1/next/param3/other').params, { paramA: 'param1', paramB: 'param3' })
})
