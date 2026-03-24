// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('If the prefixLen is higher than the pathLen we should not save the wildcard child', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.get('/static/*', () => {})

  deepEqual(findMyWay.find('GET', '/static/').params, { '*': '' })
  deepEqual(findMyWay.find('GET', '/static/hello').params, { '*': 'hello' })
  deepEqual(findMyWay.find('GET', '/static'), null)
})

Deno.test('If the prefixLen is higher than the pathLen we should not save the wildcard child (mixed routes)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.get('/static/*', () => {})
  findMyWay.get('/simple', () => {})
  findMyWay.get('/simple/:bar', () => {})
  findMyWay.get('/hello', () => {})

  deepEqual(findMyWay.find('GET', '/static/').params, { '*': '' })
  deepEqual(findMyWay.find('GET', '/static/hello').params, { '*': 'hello' })
  deepEqual(findMyWay.find('GET', '/static'), null)
})

Deno.test('If the prefixLen is higher than the pathLen we should not save the wildcard child (with a root wildcard)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.get('*', () => {})
  findMyWay.get('/static/*', () => {})
  findMyWay.get('/simple', () => {})
  findMyWay.get('/simple/:bar', () => {})
  findMyWay.get('/hello', () => {})

  deepEqual(findMyWay.find('GET', '/static/').params, { '*': '' })
  deepEqual(findMyWay.find('GET', '/static/hello').params, { '*': 'hello' })
  deepEqual(findMyWay.find('GET', '/static').params, { '*': '/static' })
})

Deno.test('If the prefixLen is higher than the pathLen we should not save the wildcard child (404)', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('Should not be defaultRoute')
    }
  })

  findMyWay.get('/static/*', () => {})
  findMyWay.get('/simple', () => {})
  findMyWay.get('/simple/:bar', () => {})
  findMyWay.get('/hello', () => {})

  deepEqual(findMyWay.find('GET', '/stati'), null)
  deepEqual(findMyWay.find('GET', '/staticc'), null)
  deepEqual(findMyWay.find('GET', '/stati/hello'), null)
  deepEqual(findMyWay.find('GET', '/staticc/hello'), null)
})
