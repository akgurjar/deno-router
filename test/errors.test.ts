import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';


import Router from '../mod.ts';
import type { Handler, HTTPMethod } from "../index.d.ts";

Deno.test('Method should be a string', () => {
  const router = Router();
  assertThrows(
    () => router.on(0 as unknown as HTTPMethod, "/test", () => {}),
    Error,
    "Method should be a string",
  );
})

Deno.test('Method should be a string [ignoreTrailingSlash=true]', () =>   {
  const router = Router({ ignoreTrailingSlash: true })
  assertThrows(
    () => router.on(0 as unknown as HTTPMethod, "/test", () => {}),
    Error,
    "Method should be a string",
  );
})

Deno.test('Method should be a string [ignoreDuplicateSlashes=true]', () => {
  const router = Router({ ignoreDuplicateSlashes: true })

  assertThrows(
    () => router.on(0 as unknown as HTTPMethod, "/test", () => {}),
    Error,
    "Method should be a string",
  );
})

Deno.test('Method should be a string (array)', () => {
  const router = Router()

  assertThrows(
    () => router.on(['GET', 0] as unknown as HTTPMethod[], '/test', () => {}),
    Error,
    "Method should be a string",
  );
})

Deno.test('Method should be a string (array) [ignoreTrailingSlash=true]', () => {
  const router = Router({ ignoreTrailingSlash: true })

  assertThrows(
    () => router.on(['GET', 0] as unknown as HTTPMethod[], '/test', () => {}),
    Error,
    "Method should be a string",
  );
})  

Deno.test('Method should be a string (array) [ignoreDuplicateSlashes=true]', () => {
  const router = Router({ ignoreDuplicateSlashes: true })

  assertThrows(
    () => router.on(['GET', 0] as unknown as HTTPMethod[], '/test', () => {}),
    Error,
    "Method should be a string",
  );
})

Deno.test('Path should be a string', () => {
  const router = Router()

  assertThrows(
    () => router.on('GET', 0 as unknown as string, () => {}),
    Error,
    "Path should be a string",
  );
})

Deno.test('Path should be a string [ignoreTrailingSlash=true]', () => {
  const router = Router({ ignoreTrailingSlash: true })

  assertThrows(
    () => router.on('GET', 0 as unknown as string, () => {}),
    Error,
    "Path should be a string",
  );
})

Deno.test('Path should be a string [ignoreDuplicateSlashes=true]', () => {
  const router = Router({ ignoreDuplicateSlashes: true })

  assertThrows(
    () => router.on('GET', 0 as unknown as string, () => {}),
    Error,
    "Path should be a string",
  );
})

Deno.test('The path could not be empty', () => {
  const router = Router()

  assertThrows(
    () => router.on('GET', '', () => {}),
    Error,
    "The path could not be empty",
  );
})

Deno.test('The path could not be empty [ignoreTrailingSlash=true]', () => {
  const router = Router({ ignoreTrailingSlash: true })

  assertThrows(
    () => router.on('GET', '', () => {}),
    Error,
    "The path could not be empty",
  );
})

Deno.test('The path could not be empty [ignoreDuplicateSlashes=true]', () => {
  const router = Router({ ignoreDuplicateSlashes: true })

  assertThrows(
    () => router.on('GET', '', () => {}),
    Error,
    "The path could not be empty",
  );
})

Deno.test('The first character of a path should be `/` or `*`', () => {
  const router = Router()

  assertThrows(
    () => router.on('GET', 'a', () => {}),
    Error,
    "The first character of a path should be `/` or `*`",
  );
})

Deno.test('The first character of a path should be `/` or `*` [ignoreTrailingSlash=true]', () => {
  const router = Router({ ignoreTrailingSlash: true })

  assertThrows(
    () => router.on('GET', 'a', () => {}),
    Error,
    "The first character of a path should be `/` or `*`",
  );
})

Deno.test('The first character of a path should be `/` or `*` [ignoreDuplicateSlashes=true]', () => {
  const router = Router({ ignoreDuplicateSlashes: true })

  assertThrows(
    () => router.on('GET', 'a', () => {}),
    Error,
    "The first character of a path should be `/` or `*`",
  );
})

Deno.test('Handler should be a function', () => {
  const router = Router()

  assertThrows(
    () => router.on('GET', '/test', 0 as any),
    Error,
    "Handler should be a function",
  );
})

Deno.test('Method is not an http method.', () => {
  const router = Router()

  assertThrows(
    () => router.on('GETT' as unknown as HTTPMethod, '/test', () => {}),
    Error,
    "Method 'GETT' is not an http method.",
  );
})

Deno.test('Method is not an http method. (array)', () => {
  const router = Router()

  assertThrows(
    () => router.on(['POST', 'GETT' as unknown as HTTPMethod], '/test', () => {}),
    Error,
    "Method 'GETT' is not an http method.",
  );
})

Deno.test('The default route must be a function', () => {
  assertThrows(
    () => Router({
      defaultRoute: '/404' as unknown as Handler<'http1'>
    }),
    Error,
    "The default route must be a function",
  );
})

Deno.test('Method already declared', async () => {
  // t.plan()
  const router = Router()

  router.on('GET', '/test', () => {})
  try {
    router.on('GET', '/test', () => {})
    fail('method already declared')
  } catch (e) {
    assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
  }
})

Deno.test('Method already declared if * is used', async () => {
  // t.plan()
  const router = Router()

  router.on('GET', '/*', () => {})
  try {
    router.on('GET', '*', () => {})
    fail('should throw error')
  } catch (e) {
    assertEquals(e.message, 'Method \'GET\' already declared for route \'/*\' with constraints \'{}\'')
  }
})

Deno.test('Method already declared if /* is used', async () => {
  // t.plan()
  const router = Router()

  router.on('GET', '*', () => {})
  try {
    router.on('GET', '/*', () => {})
    fail('should throw error')
  } catch (e) {
    assertEquals(e.message, 'Method \'GET\' already declared for route \'/*\' with constraints \'{}\'')
  }
})

Deno.test('Method already declared [ignoreTrailingSlash=true]', async () => {
  Deno.test('without trailing slash', async () => {
    // t.plan()
    const router = Router({ ignoreTrailingSlash: true })

    router.on('GET', '/test', () => {})

    try {
      router.on('GET', '/test', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '/test/', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }
  })

  Deno.test('with trailing slash', async () => {
    // t.plan()
    const router = Router({ ignoreTrailingSlash: true })

    router.on('GET', '/test/', () => {})

    try {
      router.on('GET', '/test', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '/test/', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }
  })
})

Deno.test('Method already declared [ignoreDuplicateSlashes=true]', async () => {
  Deno.test('without duplicate slashes', async () => {
    // t.plan()
    const router = Router({ ignoreDuplicateSlashes: true })

    router.on('GET', '/test', () => {})

    try {
      router.on('GET', '/test', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '//test', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }
  })

  Deno.test('with duplicate slashes', async () => {
    // t.plan()
    const router = Router({ ignoreDuplicateSlashes: true })

    router.on('GET', '//test', () => {})

    try {
      router.on('GET', '/test', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '//test', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{}\'')
    }
  })
})

Deno.test('Method already declared nested route', async () => {
  // t.plan()
  const router = Router()

  router.on('GET', '/test', () => {})
  router.on('GET', '/test/hello', () => {})
  router.on('GET', '/test/world', () => {})

  try {
    router.on('GET', '/test/hello', () => {})
    fail('method already delcared in nested route')
  } catch (e) {
    assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
  }
})

Deno.test('Method already declared nested route [ignoreTrailingSlash=true]', async () => {
  Deno.test('without trailing slash', async () => {
    // t.plan()
    const router = Router({ ignoreTrailingSlash: true })

    router.on('GET', '/test', () => {})
    router.on('GET', '/test/hello', () => {})
    router.on('GET', '/test/world', () => {})

    try {
      router.on('GET', '/test/hello', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '/test/hello/', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }
  })

  Deno.test('Method already declared with constraints', async () => {
    // t.plan()
    const router = Router()

    router.on('GET', '/test', { constraints: { host: 'fastify.io' } }, () => {})
    try {
      router.on('GET', '/test', { constraints: { host: 'fastify.io' } }, () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test\' with constraints \'{"host":"fastify.io"}\'')
    }
  })

  Deno.test('with trailing slash', async () => {
    // t.plan()
    const router = Router({ ignoreTrailingSlash: true })

    router.on('GET', '/test/', () => {})
    router.on('GET', '/test/hello/', () => {})
    router.on('GET', '/test/world/', () => {})

    try {
      router.on('GET', '/test/hello', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '/test/hello/', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }
  })
})

Deno.test('Method already declared nested route [ignoreDuplicateSlashes=true]', async () => {
  Deno.test('without duplicate slashes', async () => {
    // t.plan()
    const router = Router({ ignoreDuplicateSlashes: true })

    router.on('GET', '/test', () => {})
    router.on('GET', '/test/hello', () => {})
    router.on('GET', '/test/world', () => {})

    try {
      router.on('GET', '/test/hello', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '/test//hello', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }
  })

  Deno.test('with duplicate slashes', async () => {
    // t.plan()
    const router = Router({ ignoreDuplicateSlashes: true })

    router.on('GET', '/test/', () => {})
    router.on('GET', '/test//hello', () => {})
    router.on('GET', '/test//world', () => {})

    try {
      router.on('GET', '/test/hello', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }

    try {
      router.on('GET', '/test//hello', () => {})
      fail('method already declared')
    } catch (e) {
      assertEquals(e.message, 'Method \'GET\' already declared for route \'/test/hello\' with constraints \'{}\'')
    }
  })
})
