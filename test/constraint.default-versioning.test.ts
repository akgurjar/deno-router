// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';
const noop = () => { }

Deno.test('A route could support multiple versions (find) / 1', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', { constraints: { version: '1.2.3' } }, noop)
  findMyWay.on('GET', '/', { constraints: { version: '3.2.0' } }, noop)

  assert(findMyWay.find('GET', '/', { version: '1.x' }))
  assert(findMyWay.find('GET', '/', { version: '1.2.3' }))
  assert(findMyWay.find('GET', '/', { version: '3.x' }))
  assert(findMyWay.find('GET', '/', { version: '3.2.0' }))
  assert(!findMyWay.find('GET', '/', { version: '2.x' }))
  assert(!findMyWay.find('GET', '/', { version: '2.3.4' }))
  assert(!findMyWay.find('GET', '/', { version: '3.2.1' }))
})

Deno.test('A route could support multiple versions (find) / 2', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', { constraints: { version: '1.2.3' } }, noop)
  findMyWay.on('GET', '/test', { constraints: { version: '3.2.0' } }, noop)

  assert(findMyWay.find('GET', '/test', { version: '1.x' }))
  assert(findMyWay.find('GET', '/test', { version: '1.2.3' }))
  assert(findMyWay.find('GET', '/test', { version: '3.x' }))
  assert(findMyWay.find('GET', '/test', { version: '3.2.0' }))
  assert(!findMyWay.find('GET', '/test', { version: '2.x' }))
  assert(!findMyWay.find('GET', '/test', { version: '2.3.4' }))
  assert(!findMyWay.find('GET', '/test', { version: '3.2.1' }))
})

Deno.test('A route could support multiple versions (find) / 3', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/:id/hello', { constraints: { version: '1.2.3' } }, noop)
  findMyWay.on('GET', '/test/:id/hello', { constraints: { version: '3.2.0' } }, noop)
  findMyWay.on('GET', '/test/name/hello', { constraints: { version: '4.0.0' } }, noop)

  assert(findMyWay.find('GET', '/test/1234/hello', { version: '1.x' }))
  assert(findMyWay.find('GET', '/test/1234/hello', { version: '1.2.3' }))
  assert(findMyWay.find('GET', '/test/1234/hello', { version: '3.x' }))
  assert(findMyWay.find('GET', '/test/1234/hello', { version: '3.2.0' }))
  assert(findMyWay.find('GET', '/test/name/hello', { version: '4.x' }))
  assert(findMyWay.find('GET', '/test/name/hello', { version: '3.x' }))
  assert(!findMyWay.find('GET', '/test/1234/hello', { version: '2.x' }))
  assert(!findMyWay.find('GET', '/test/1234/hello', { version: '2.3.4' }))
  assert(!findMyWay.find('GET', '/test/1234/hello', { version: '3.2.1' }))
  assert(!findMyWay.find('GET', '/test/1234/hello', { version: '4.x' }))
})

Deno.test('A route could support multiple versions (find) / 4', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test/*', { constraints: { version: '1.2.3' } }, noop)
  findMyWay.on('GET', '/test/hello', { constraints: { version: '3.2.0' } }, noop)

  assert(findMyWay.find('GET', '/test/1234/hello', { version: '1.x' }))
  assert(findMyWay.find('GET', '/test/1234/hello', { version: '1.2.3' }))
  assert(findMyWay.find('GET', '/test/hello', { version: '3.x' }))
  assert(findMyWay.find('GET', '/test/hello', { version: '3.2.0' }))
  assert(!findMyWay.find('GET', '/test/1234/hello', { version: '3.2.0' }))
  assert(!findMyWay.find('GET', '/test/1234/hello', { version: '3.x' }))
  assert(!findMyWay.find('GET', '/test/1234/hello', { version: '2.x' }))
  assert(!findMyWay.find('GET', '/test/hello', { version: '2.x' }))
})

Deno.test('A route could support multiple versions (find) / 5', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', { constraints: { version: '1.2.3' } }, () => false)
  findMyWay.on('GET', '/', { constraints: { version: '3.2.0' } }, () => true)

  assert(findMyWay.find('GET', '/', { version: '*' }).handler())
})

Deno.test('Find with a version but without versioned routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', noop)

  assert(!findMyWay.find('GET', '/', { version: '1.x' }))
})

Deno.test('A route could support multiple versions (lookup)', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      const versions = ['2.x', '2.3.4', '3.2.1']
      assert(versions.indexOf(req.headers['accept-version']) > -1)
    }
  })

  findMyWay.on('GET', '/', { constraints: { version: '1.2.3' } }, (req, res) => {
    const versions = ['1.x', '1.2.3']
    assert(versions.indexOf(req.headers['accept-version']) > -1)
  })

  findMyWay.on('GET', '/', { constraints: { version: '3.2.0' } }, (req, res) => {
    const versions = ['3.x', '3.2.0']
    assert(versions.indexOf(req.headers['accept-version']) > -1)
  })

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '1.x' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '1.2.3' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '3.x' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '3.2.0' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '2.x' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '2.3.4' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '3.2.1' }
  }, null)
})

Deno.test('It should always choose the highest version of a route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', { constraints: { version: '2.3.0' } }, (req, res) => {
    fail('We should not be here')
  })

  findMyWay.on('GET', '/', { constraints: { version: '2.4.0' } }, (req, res) => {
    assert('Yeah!')
  })

  findMyWay.on('GET', '/', { constraints: { version: '3.3.0' } }, (req, res) => {
    assert('Yeah!')
  })

  findMyWay.on('GET', '/', { constraints: { version: '3.2.0' } }, (req, res) => {
    fail('We should not be here')
  })

  findMyWay.on('GET', '/', { constraints: { version: '3.2.2' } }, (req, res) => {
    fail('We should not be here')
  })

  findMyWay.on('GET', '/', { constraints: { version: '4.4.0' } }, (req, res) => {
    fail('We should not be here')
  })

  findMyWay.on('GET', '/', { constraints: { version: '4.3.2' } }, (req, res) => {
    assert('Yeah!')
  })

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '2.x' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '3.x' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '4.3.x' }
  }, null)
})

Deno.test('Declare the same route with and without version', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', noop)
  findMyWay.on('GET', '/', { constraints: { version: '1.2.0' } }, noop)

  assert(findMyWay.find('GET', '/', { version: '1.x' }))
  assert(findMyWay.find('GET', '/', {}))
})

Deno.test('It should throw if you declare multiple times the same route', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/', { constraints: { version: '1.2.3' } }, noop)

  try {
    findMyWay.on('GET', '/', { constraints: { version: '1.2.3' } }, noop)
    fail('It should throw')
  } catch (err) {
    deepEqual(err.message, 'Method \'GET\' already declared for route \'/\' with constraints \'{"version":"1.2.3"}\'')
  }
})

Deno.test('Versioning won\'t work if there are no versioned routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      fail('We should not be here')
    }
  })

  findMyWay.on('GET', '/', (req, res) => {
    assert('Yeah!')
  })

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '2.x' }
  }, null)

  findMyWay.lookup({
    method: 'GET',
    url: '/'
  }, null)
})

Deno.test('Unversioned routes aren\'t triggered when unknown versions are requested', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      assert('We should be here')
    }
  })

  findMyWay.on('GET', '/', (req, res) => {
    fail('unversioned route shouldnt be hit!')
  })
  findMyWay.on('GET', '/', { constraints: { version: '1.0.0' } }, (req, res) => {
    fail('versioned route shouldnt be hit for wrong version!')
  })

  findMyWay.lookup({
    method: 'GET',
    url: '/',
    headers: { 'accept-version': '2.x' }
  }, null)
})
