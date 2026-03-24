// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import http from 'node:http';
import FindMyWay from '../index.ts';

test('basic router with http server', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end(JSON.stringify({ hello: 'world' }))
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const res = await fetch(`http://localhost:${server.address().port}/test`)

    deepEqual(res.status, 200)
    deepEqual(await res.json(), { hello: 'world' })
    done()
  })
})

test('router with params with http server', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test/:id', (req, res, params) => {
    assert(req)
    assert(res)
    deepEqual(params.id, 'hello')
    res.end(JSON.stringify({ hello: 'world' }))
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const res = await fetch(`http://localhost:${server.address().port}/test/hello`)

    deepEqual(res.status, 200)
    deepEqual(await res.json(), { hello: 'world' })
    done()
  })
})

test('default route', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay({
    defaultRoute: (req, res) => {
      res.statusCode = 404
      res.end()
    }
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const res = await fetch(`http://localhost:${server.address().port}`)
    deepEqual(res.status, 404)
    done()
  })
})

test('automatic default route', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay()

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const res = await fetch(`http://localhost:${server.address().port}`)
    deepEqual(res.status, 404)
    done()
  })
})

test('maps two routes when trailing slash should be trimmed', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: true
  })

  findMyWay.on('GET', '/test/', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('test')
  })

  findMyWay.on('GET', '/othertest', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('othertest')
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const baseURL = 'http://localhost:' + server.address().port

    let res = await fetch(`${baseURL}/test/`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}/test`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}/othertest`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'othertest')

    res = await fetch(`${baseURL}/othertest/`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'othertest')

    done()
  })
})

test('does not trim trailing slash when ignoreTrailingSlash is false', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: false
  })

  findMyWay.on('GET', '/test/', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('test')
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const baseURL = 'http://localhost:' + server.address().port

    let res = await fetch(`${baseURL}/test/`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}/test`)
    deepEqual(res.status, 404)

    done()
  })
})

test('does not map // when ignoreTrailingSlash is true', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreTrailingSlash: false
  })

  findMyWay.on('GET', '/', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('test')
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const baseURL = 'http://localhost:' + server.address().port

    let res = await fetch(`${baseURL}/`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}//`)
    deepEqual(res.status, 404)

    done()
  })
})

test('maps two routes when duplicate slashes should be trimmed', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreDuplicateSlashes: true
  })

  findMyWay.on('GET', '//test', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('test')
  })

  findMyWay.on('GET', '/othertest', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('othertest')
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const baseURL = 'http://localhost:' + server.address().port

    let res = await fetch(`${baseURL}//test`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}/test`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}/othertest`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'othertest')

    res = await fetch(`${baseURL}//othertest`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'othertest')

    done()
  })
})

test('does not trim duplicate slashes when ignoreDuplicateSlashes is false', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreDuplicateSlashes: false
  })

  findMyWay.on('GET', '//test', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('test')
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const baseURL = 'http://localhost:' + server.address().port

    let res = await fetch(`${baseURL}//test`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}/test`)
    deepEqual(res.status, 404)

    done()
  })
})

test('does map // when ignoreDuplicateSlashes is true', (t, done) => {
  // t.plan()
  const findMyWay = FindMyWay({
    ignoreDuplicateSlashes: true
  })

  findMyWay.on('GET', '/', (req, res, params) => {
    assert(req)
    assert(res)
    assert(params)
    res.end('test')
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    const baseURL = 'http://localhost:' + server.address().port

    let res = await fetch(`${baseURL}/`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    res = await fetch(`${baseURL}//`)
    deepEqual(res.status, 200)
    deepEqual(await res.text(), 'test')

    done()
  })
})

test('versioned routes', (t, done) => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', { constraints: { version: '1.2.3' } }, (req, res, params) => {
    res.end('ok')
  })

  const server = http.createServer((req, res) => {
    findMyWay.lookup(req, res)
  })

  server.listen(0, async err => {
    assert(!err)
    server.unref()

    let res = await fetch(`http://localhost:${server.address().port}/test`, {
      headers: { 'Accept-Version': '1.2.3' }
    })

    deepEqual(res.status, 200)

    res = await fetch(`http://localhost:${server.address().port}/test`, {
      headers: { 'Accept-Version': '2.x' }
    })

    deepEqual(res.status, 404)

    done()
  })
})
