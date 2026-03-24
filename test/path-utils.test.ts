// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('removeDuplicateSlashes should return the same path when there are no duplicate slashes', async () => {
  // t.plan()

  const path = '/hello/world'
  deepEqual(FindMyWay.removeDuplicateSlashes(path), '/hello/world')
})

Deno.test('removeDuplicateSlashes should collapse duplicate slash groups across the full path', async () => {
  // t.plan()

  const path = '/hello//world///foo////bar'
  deepEqual(FindMyWay.removeDuplicateSlashes(path), '/hello/world/foo/bar')
})

Deno.test('removeDuplicateSlashes should normalize a path made only of slashes', async () => {
  // t.plan()

  const path = '////'
  deepEqual(FindMyWay.removeDuplicateSlashes(path), '/')
})

Deno.test('removeDuplicateSlashes should keep encoded slashes untouched', async () => {
  // t.plan()

  const path = '/a/%2F//b'
  deepEqual(FindMyWay.removeDuplicateSlashes(path), '/a/%2F/b')
})

Deno.test('trimLastSlash should remove one trailing slash from non-root paths', async () => {
  // t.plan()

  const path = '/hello/'
  deepEqual(FindMyWay.trimLastSlash(path), '/hello')
})

Deno.test('trimLastSlash should leave root path untouched', async () => {
  // t.plan()

  const path = '/'
  deepEqual(FindMyWay.trimLastSlash(path), '/')
})

Deno.test('trimLastSlash should leave paths without trailing slash untouched', async () => {
  // t.plan()

  const path = '/hello/world'
  deepEqual(FindMyWay.trimLastSlash(path), '/hello/world')
})

Deno.test('trimLastSlash should remove only one trailing slash', async () => {
  // t.plan()

  const path = '/hello///'
  deepEqual(FindMyWay.trimLastSlash(path), '/hello//')
})

Deno.test('removeDuplicateSlashes then trimLastSlash should match router path normalization order', async () => {
  // t.plan()

  const path = '//a//b//c//'
  const normalized = FindMyWay.trimLastSlash(FindMyWay.removeDuplicateSlashes(path))
  deepEqual(normalized, '/a/b/c')
})
