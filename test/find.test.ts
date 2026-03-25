
import { assert } from '@std/assert';
import Router from '../mod.ts';

Deno.test('find calls can pass no constraints', () => {
  const router = new Router()

  router.on('GET', '/a', () => {})
  router.on('GET', '/a/b', () => {})

  assert(router.find('GET', '/a'))
  assert(router.find('GET', '/a/b'))
  assert(!router.find('GET', '/a/b/c'))
})
