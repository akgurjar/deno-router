// @ts-nocheck
import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
// 'use strict'

import httpMethods from '../lib/http-methods.ts';

import FindMyWay from '../index.ts';

Deno.test('should support shorthand', async () => {
  for (const i in httpMethods) {
    const m = httpMethods[i]
    const methodName = m.toLowerCase()

    Deno.test('`.' + methodName + '`', async () => {
      // t.plan()
      const findMyWay = FindMyWay()

      findMyWay[methodName]('/test', () => {
        assert('inside the handler')
      })

      findMyWay.lookup({ method: m, url: '/test', headers: {} }, null)
    })
  }
})

Deno.test('should support `.all` shorthand', async () => {
  // t.plan()
  const findMyWay = FindMyWay()

  findMyWay.all('/test', () => {
    assert('inside the handler')
  })

  findMyWay.lookup({ method: 'GET', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'DELETE', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'HEAD', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'PATCH', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'POST', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'PUT', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'OPTIONS', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'TRACE', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'CONNECT', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'COPY', url: '/test', headers: {} }, null)
  findMyWay.lookup({ method: 'SUBSCRIBE', url: '/test', headers: {} }, null)
})
