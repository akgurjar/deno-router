// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('path params match', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ ignoreTrailingSlash: true, ignoreDuplicateSlashes: true })

  const b1Path = function b1StaticPath () {}
  const b2Path = function b2StaticPath () {}
  const cPath = function cStaticPath () {}
  const paramPath = function parameterPath () {}

  findMyWay.on('GET', '/ab1', b1Path)
  findMyWay.on('GET', '/ab2', b2Path)
  findMyWay.on('GET', '/ac', cPath)
  findMyWay.on('GET', '/:pam', paramPath)

  deepEqual(findMyWay.find('GET', '/ab1').handler, b1Path)
  deepEqual(findMyWay.find('GET', '/ab1/').handler, b1Path)
  deepEqual(findMyWay.find('GET', '//ab1').handler, b1Path)
  deepEqual(findMyWay.find('GET', '//ab1//').handler, b1Path)
  deepEqual(findMyWay.find('GET', '/ab2').handler, b2Path)
  deepEqual(findMyWay.find('GET', '/ab2/').handler, b2Path)
  deepEqual(findMyWay.find('GET', '//ab2').handler, b2Path)
  deepEqual(findMyWay.find('GET', '//ab2//').handler, b2Path)
  deepEqual(findMyWay.find('GET', '/ac').handler, cPath)
  deepEqual(findMyWay.find('GET', '/ac/').handler, cPath)
  deepEqual(findMyWay.find('GET', '//ac').handler, cPath)
  deepEqual(findMyWay.find('GET', '//ac//').handler, cPath)
  deepEqual(findMyWay.find('GET', '/foo').handler, paramPath)
  deepEqual(findMyWay.find('GET', '/foo/').handler, paramPath)
  deepEqual(findMyWay.find('GET', '//foo').handler, paramPath)
  deepEqual(findMyWay.find('GET', '//foo//').handler, paramPath)

  const noTrailingSlashRet = findMyWay.find('GET', '/abcdef')
  deepEqual(noTrailingSlashRet.handler, paramPath)
  deepEqual(noTrailingSlashRet.params, { pam: 'abcdef' })

  const trailingSlashRet = findMyWay.find('GET', '/abcdef/')
  deepEqual(trailingSlashRet.handler, paramPath)
  deepEqual(trailingSlashRet.params, { pam: 'abcdef' })

  const noDuplicateSlashRet = findMyWay.find('GET', '/abcdef')
  deepEqual(noDuplicateSlashRet.handler, paramPath)
  deepEqual(noDuplicateSlashRet.params, { pam: 'abcdef' })

  const duplicateSlashRet = findMyWay.find('GET', '//abcdef')
  deepEqual(duplicateSlashRet.handler, paramPath)
  deepEqual(duplicateSlashRet.params, { pam: 'abcdef' })
})
