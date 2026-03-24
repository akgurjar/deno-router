// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('issue-240: .find matching', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ ignoreDuplicateSlashes: true })

  const fixedPath = function staticPath () {}
  const varPath = function parameterPath () {}
  findMyWay.on('GET', '/a/b', fixedPath)
  findMyWay.on('GET', '/a/:pam/c', varPath)

  deepEqual(findMyWay.find('GET', '/a/b').handler, fixedPath)
  deepEqual(findMyWay.find('GET', '/a//b').handler, fixedPath)
  deepEqual(findMyWay.find('GET', '/a/b/c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a//b/c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a///b/c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a//b//c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a///b///c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a/foo/c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a//foo/c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a///foo/c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a//foo//c').handler, varPath)
  deepEqual(findMyWay.find('GET', '/a///foo///c').handler, varPath)
  assert(!findMyWay.find('GET', '/a/c'))
  assert(!findMyWay.find('GET', '/a//c'))
})
