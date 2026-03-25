
import { assertEquals } from '@std/assert';
import Router from '../mod.ts';

Deno.test('full-url', () => {
  const router = new Router({
    defaultRoute: (_ctx) => {
      return new Response('Not Found', { status: 404 });
    }
  })

  router.on('GET', '/a', (_ctx) => {
    return new Response('{"message":"hello world"}')
  })

  router.on('GET', '/a/:id', (_ctx) => {
    return new Response('{"message":"hello world"}')
  })

  assertEquals(router.find('GET', 'http://localhost/a', { host: 'localhost' }), router.find('GET', '/a', { host: 'localhost' }))
  assertEquals(router.find('GET', 'http://localhost:8080/a', { host: 'localhost' }), router.find('GET', '/a', { host: 'localhost' }))
  assertEquals(router.find('GET', 'http://123.123.123.123/a', {}), router.find('GET', '/a', {}))
  assertEquals(router.find('GET', 'https://localhost/a', { host: 'localhost' }), router.find('GET', '/a', { host: 'localhost' }))

  assertEquals(router.find('GET', 'http://localhost/a/100', { host: 'localhost' }), router.find('GET', '/a/100', { host: 'localhost' }))
  assertEquals(router.find('GET', 'http://localhost:8080/a/100', { host: 'localhost' }), router.find('GET', '/a/100', { host: 'localhost' }))
  assertEquals(router.find('GET', 'http://123.123.123.123/a/100', {}), router.find('GET', '/a/100', {}))
  assertEquals(router.find('GET', 'https://localhost/a/100', { host: 'localhost' }), router.find('GET', '/a/100', { host: 'localhost' }))
})
