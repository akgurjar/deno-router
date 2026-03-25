
import { assertEquals, assertStrictEquals } from '@std/assert';

import Router from '../mod.ts';

function equalRouters (router1: Router, router2: Router) {
  assertStrictEquals(router1.config, router2.config);
  assertStrictEquals(router1.routes, router2.routes);
  assertStrictEquals(JSON.stringify(router1.trees), JSON.stringify(router2.trees));

  assertStrictEquals(
    router1.constrainer.strategies,
    router2.constrainer.strategies,
  );
  // assertStrictEquals(
  //   router1.constrainer.strategiesInUse,
  //   router2.constrainer.strategiesInUse
  // )
  // assertStrictEquals(
  //   router1.constrainer.asyncStrategiesInUse,
  //   router2.constrainer.asyncStrategiesInUse
  // )
}

Deno.test('hasRoute returns false if there is no routes', () => {

  const router = new Router();
  const routerClone = structuredClone(router);

  const hasRoute = router.hasRoute('GET', '/example')
  assertEquals(hasRoute, false)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns true for a static route', () => {

  const router = new Router();
  router.on('GET', '/example', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/example')
  assertEquals(hasRoute, true)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns false for a static route', () => {

  const router = new Router();
  router.on('GET', '/example', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/example1')
  assertEquals(hasRoute, false)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns true for a parametric route', () => {

  const router = new Router();
  router.on('GET', '/:param', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/:param')
  assertEquals(hasRoute, true)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns false for a parametric route', () => {

  const router = new Router();
  router.on('GET', '/foo/:param', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/bar/:param')
  assertEquals(hasRoute, false)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns true for a parametric route with static suffix', () => {

  const router = new Router();
  router.on('GET', '/:param-static', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/:param-static')
  assertEquals(hasRoute, true)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns false for a parametric route with static suffix', () => {

  const router = new Router();
  router.on('GET', '/:param-static1', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/:param-static2')
  assertEquals(hasRoute, false)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns true even if a param name different', () => {

  const router = new Router();
  router.on('GET', '/:param1', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/:param2')
  assertEquals(hasRoute, true)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns true for a multi-parametric route', () => {

  const router = new Router();
  router.on('GET', '/:param1-:param2', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/:param1-:param2')
  assertEquals(hasRoute, true)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns false for a multi-parametric route', () => {

  const router = new Router();
  router.on('GET', '/foo/:param1-:param2/bar1', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/foo/:param1-:param2/bar2')
  assertEquals(hasRoute, false)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns true for a regexp route',  () => {

  const router = new Router();
  router.on('GET', '/:param(^\\d+$)', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/:param(^\\d+$)')
  assertEquals(hasRoute, true)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns false for a regexp route', () => {

  const router = new Router();
  router.on('GET', '/:file(^\\S+).png', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/:file(^\\D+).png')
  assertEquals(hasRoute, false)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns true for a wildcard route', () => {

  const router = new Router();
  router.on('GET', '/example/*', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/example/*')
  assertEquals(hasRoute, true)

  equalRouters(router, routerClone)
})

Deno.test('hasRoute returns false for a wildcard route', () => {

  const router = new Router();
  router.on('GET', '/foo1/*', () => {});

  const routerClone = structuredClone(router)

  const hasRoute = router.hasRoute('GET', '/foo2/*')
  assertEquals(hasRoute, false)

  equalRouters(router, routerClone)
})
