// @ts-nocheck
import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';
const proxyquire = await import('proxyquire')
import HandlerStorage from '../lib/handler-storage.ts';
const Constrainer = await import('../lib/constrainer.ts').then(m => m.default)
const { safeDecodeURIComponent } = await import('../lib/url-sanitizer.ts')
const acceptVersionStrategy = await import('../lib/strategies/accept-version.ts').then(m => m.default)
const httpMethodStrategy = await import('../lib/strategies/http-method.ts')

Deno.test('FULL_PATH_REGEXP and OPTIONAL_PARAM_REGEXP should be considered safe', async () => {
  // t.plan()

  t.assert.doesNotThrow(() => await import('..'))
})

Deno.test('should throw an error for unsafe FULL_PATH_REGEXP', async () => {
  // t.plan()

  assertThrows(() => proxyquire('..', {
    'safe-regex2': () => false
  }), new Error('the FULL_PATH_REGEXP is not safe, update this module'))
})

Deno.test('Should throw an error for unsafe OPTIONAL_PARAM_REGEXP', async () => {
  // t.plan()

  let callCount = 0
  assertThrows(() => proxyquire('..', {
    'safe-regex2': () => {
      return ++callCount < 2
    }
  }), new Error('the OPTIONAL_PARAM_REGEXP is not safe, update this module'))
})

Deno.test('double colon does not define parametric node', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/::id', () => {})
  const route1 = findMyWay.findRoute('GET', '/::id')
  t.assert.deepStrictEqual(route1.params, [])

  findMyWay.on('GET', '/:foo(\\d+)::bar', () => {})
  const route2 = findMyWay.findRoute('GET', '/:foo(\\d+)::bar')
  t.assert.deepStrictEqual(route2.params, ['foo'])
})

Deno.test('case insensitive static routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    caseSensitive: false
  })

  findMyWay.on('GET', '/foo', () => {})
  findMyWay.on('GET', '/foo/bar', () => {})
  findMyWay.on('GET', '/foo/bar/baz', () => {})

  assert(findMyWay.findRoute('GET', '/FoO'))
  assert(findMyWay.findRoute('GET', '/FOo/Bar'))
  assert(findMyWay.findRoute('GET', '/fOo/Bar/bAZ'))
})

Deno.test('wildcard must be the last character in the route', async () => {
  // t.plan()

  const expectedError = new Error('Wildcard must be the last character in the route')

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '*', () => {})
  assertThrows(() => findMyWay.findRoute('GET', '*1'), expectedError)
  assertThrows(() => findMyWay.findRoute('GET', '*/'), expectedError)
  assertThrows(() => findMyWay.findRoute('GET', '*?'), expectedError)
})

Deno.test('does not find the route if maxParamLength is exceeded', async () => {
  // t.plan()
  const findMyWay = FindMyWay({
    maxParamLength: 2
  })

  findMyWay.on('GET', '/:id(\\d+)', () => {})

  deepEqual(findMyWay.find('GET', '/123'), null)
  assert(findMyWay.find('GET', '/12'))
})

Deno.test('Should check if a regex is safe to use', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  // we must pass a safe regex to register the route
  // findRoute will still throws the expected assertion error if we try to access it with unsafe reggex
  findMyWay.on('GET', '/test/:id(\\d+)', () => {})

  const unSafeRegex = /(x+x+)+y/
  assertThrows(() => findMyWay.findRoute('GET', `/test/:id(${unSafeRegex.toString()})`), {
    message: "The regex '(/(x+x+)+y/)' is not safe!"
  })
})

Deno.test('Disable safe regex check', async () => {
  // t.plan()

  const findMyWay = FindMyWay({ allowUnsafeRegex: true })

  const unSafeRegex = /(x+x+)+y/
  findMyWay.on('GET', `/test2/:id(${unSafeRegex.toString()})`, () => {})
  t.assert.doesNotThrow(() => findMyWay.findRoute('GET', `/test2/:id(${unSafeRegex.toString()})`))
})

Deno.test('throws error if no strategy registered for constraint key', async () => {
  // t.plan()

  const constrainer = new Constrainer()
  const error = new Error('No strategy registered for constraint key invalid-constraint')
  assertThrows(() => constrainer.newStoreForConstraint('invalid-constraint'), error)
  assertThrows(() => constrainer.validateConstraints({ 'invalid-constraint': 'foo' }), error)
})

Deno.test('throws error if pass an undefined constraint value', async () => {
  // t.plan()

  const constrainer = new Constrainer()
  const error = new Error('Can\'t pass an undefined constraint value, must pass null or no key at all')
  assertThrows(() => constrainer.validateConstraints({ key: undefined }), error)
})

Deno.test('Constrainer.noteUsage', async () => {
  // t.plan()

  const constrainer = new Constrainer()
  deepEqual(constrainer.strategiesInUse.size, 0)

  constrainer.noteUsage()
  deepEqual(constrainer.strategiesInUse.size, 0)

  constrainer.noteUsage({ host: 'fastify.io' })
  deepEqual(constrainer.strategiesInUse.size, 1)
})

Deno.test('Cannot derive constraints without active strategies.', async () => {
  // t.plan()

  const constrainer = new Constrainer()
  const before = constrainer.deriveSyncConstraints
  constrainer._buildDeriveConstraints()
  deepEqual(constrainer.deriveSyncConstraints, before)
})

Deno.test('getMatchingHandler should return null if not compiled', async () => {
  // t.plan()

  const handlerStorage = new HandlerStorage()
  deepEqual(handlerStorage.getMatchingHandler({ foo: 'bar' }), null)
})

Deno.test('safeDecodeURIComponent should replace %3x to null for every x that is not a valid lowchar', async () => {
  // t.plan()

  deepEqual(safeDecodeURIComponent('Hello%3xWorld'), 'HellonullWorld')
})

Deno.test('SemVerStore version should be a string', async () => {
  // t.plan()

  const Storage = acceptVersionStrategy.storage

  assertThrows(() => new Storage().set(1), new TypeError('Version should be a string'))
})

Deno.test('SemVerStore.maxMajor should increase automatically', async () => {
  // t.plan()

  const Storage = acceptVersionStrategy.storage
  const storage = new Storage()

  deepEqual(storage.maxMajor, 0)

  storage.set('2')
  deepEqual(storage.maxMajor, 2)

  storage.set('1')
  deepEqual(storage.maxMajor, 2)
})

Deno.test('SemVerStore.maxPatches should increase automatically', async () => {
  // t.plan()

  const Storage = acceptVersionStrategy.storage
  const storage = new Storage()

  storage.set('2.0.0')
  deepEqual(storage.maxPatches, { '2.0': 0 })

  storage.set('2.0.2')
  deepEqual(storage.maxPatches, { '2.0': 2 })

  storage.set('2.0.1')
  deepEqual(storage.maxPatches, { '2.0': 2 })
})

Deno.test('Major version must be a numeric value', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  assertThrows(() => findMyWay.on('GET', '/test', { constraints: { version: 'x' } }, () => {}),
    new TypeError('Major version must be a numeric value'))
})

Deno.test('httpMethodStrategy storage handles set and get operations correctly', async () => {
  // t.plan()

  const storage = httpMethodStrategy.storage()

  deepEqual(storage.get('foo'), null)

  storage.set('foo', { bar: 'baz' })
  t.assert.deepStrictEqual(storage.get('foo'), { bar: 'baz' })
})

Deno.test('if buildPrettyMeta argument is undefined, will return an object', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  deepEqual(findMyWay.buildPrettyMeta(), {})
})
