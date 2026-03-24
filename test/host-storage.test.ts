// @ts-nocheck
const acceptHostStrategy = await import('../lib/strategies/accept-host.ts')

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';

Deno.test('can get hosts by exact matches', async () => {
  const storage = acceptHostStrategy.storage()
  deepEqual(storage.get('fastify.io'), undefined)
  storage.set('fastify.io', true)
  deepEqual(storage.get('fastify.io'), true)
})

Deno.test('can get hosts by regexp matches', async () => {
  const storage = acceptHostStrategy.storage()
  deepEqual(storage.get('fastify.io'), undefined)
  storage.set(/.+fastify\.io/, true)
  deepEqual(storage.get('foo.fastify.io'), true)
  deepEqual(storage.get('bar.fastify.io'), true)
})

Deno.test('exact host matches take precendence over regexp matches', async () => {
  const storage = acceptHostStrategy.storage()
  storage.set(/.+fastify\.io/, 'wildcard')
  storage.set('auth.fastify.io', 'exact')
  deepEqual(storage.get('foo.fastify.io'), 'wildcard')
  deepEqual(storage.get('bar.fastify.io'), 'wildcard')
  deepEqual(storage.get('auth.fastify.io'), 'exact')
})
