// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('sanitizeUrlPath should decode reserved characters inside params and strip querystring', async () => {
  // t.plan()

  const url = '/%65ncod%65d?foo=bar'
  const sanitized = FindMyWay.sanitizeUrlPath(url)

  deepEqual(sanitized, '/encoded')
})

Deno.test('sanitizeUrlPath should decode non-reserved characters but keep reserved encoded when not in params', async () => {
  // t.plan()

  const url = '/hello/%20world?foo=bar'
  const sanitized = FindMyWay.sanitizeUrlPath(url)

  deepEqual(sanitized, '/hello/ world')
})

Deno.test('sanitizeUrlPath should treat semicolon as queryparameter delimiter when enabled', async () => {
  // t.plan()

  const url = '/hello/%23world;foo=bar'

  const sanitizedWithDelimiter = FindMyWay.sanitizeUrlPath(url, true)
  deepEqual(sanitizedWithDelimiter, '/hello/#world')

  const sanitizedWithoutDelimiter = FindMyWay.sanitizeUrlPath(url, false)
  deepEqual(sanitizedWithoutDelimiter, '/hello/#world;foo=bar')
})

Deno.test('sanitizeUrlPath trigger an error if the url is invalid', async () => {
  // t.plan()

  const url = '/Hello%3xWorld/world'
  assertThrows(() => {
    FindMyWay.sanitizeUrlPath(url)
  }, 'URIError: URI malformed')
})
