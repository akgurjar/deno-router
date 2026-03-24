// @ts-nocheck
// 'use strict'

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import { deepEqual } from 'node:assert';
import FindMyWay from '../index.ts';

Deno.test('pretty print - empty tree', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  const tree = findMyWay.prettyPrint()

  const expected = '(empty tree)'
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - static routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test/hello', () => {})
  findMyWay.on('GET', '/hello/world', () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    ├── test (GET)
    │   └── /hello (GET)
    └── hello/world (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - parametric routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test/:hello', () => {})
  findMyWay.on('GET', '/hello/:world', () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    ├── test (GET)
    │   └── /
    │       └── :hello (GET)
    └── hello/
        └── :world (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - parametric routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/static', () => {})
  findMyWay.on('GET', '/static/:param/suffix1', () => {})
  findMyWay.on('GET', '/static/:param(123)/suffix2', () => {})
  findMyWay.on('GET', '/static/:param(123).end/suffix3', () => {})
  findMyWay.on('GET', '/static/:param1(123).:param2(456)/suffix4', () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    └── static (GET)
        └── /
            ├── :param(123).end
            │   └── /suffix3 (GET)
            ├── :param(123)
            │   └── /suffix2 (GET)
            ├── :param1(123).:param2(456)
            │   └── /suffix4 (GET)
            └── :param
                └── /suffix1 (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - parametric routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/static', () => {})
  findMyWay.on('GET', '/static/:param/suffix1', () => {})
  findMyWay.on('GET', '/static/:param(123)/suffix2', () => {})
  findMyWay.on('GET', '/static/:param(123).end/suffix3', () => {})
  findMyWay.on('GET', '/static/:param1(123).:param2(456)/suffix4', () => {})

  const tree = findMyWay.prettyPrint({ commonPrefix: false })
  const expected = `\
└── /static (GET)
    ├── /:param(123).end/suffix3 (GET)
    ├── /:param(123)/suffix2 (GET)
    ├── /:param1(123).:param2(456)/suffix4 (GET)
    └── /:param/suffix1 (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - mixed parametric routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test/:hello', () => {})
  findMyWay.on('POST', '/test/:hello', () => {})
  findMyWay.on('GET', '/test/:hello/world', () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    └── test (GET)
        └── /
            └── :hello (GET, POST)
                └── /world (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - wildcard routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test/*', () => {})
  findMyWay.on('GET', '/hello/*', () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    ├── test (GET)
    │   └── /
    │       └── * (GET)
    └── hello/
        └── * (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - parametric routes with same parent and followed by a static route which has the same prefix with the former routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test/hello/:id', () => {})
  findMyWay.on('POST', '/test/hello/:id', () => {})
  findMyWay.on('GET', '/test/helloworld', () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    └── test (GET)
        └── /hello
            ├── /
            │   └── :id (GET, POST)
            └── world (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - constrained parametric routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test', { constraints: { host: 'auth.fastify.io' } }, () => {})
  findMyWay.on('GET', '/test/:hello', () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '1.1.2' } }, () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '2.0.0' } }, () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    └── test (GET)
        test (GET) {"host":"auth.fastify.io"}
        └── /
            └── :hello (GET)
                :hello (GET) {"version":"1.1.2"}
                :hello (GET) {"version":"2.0.0"}
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - multiple parameters are drawn appropriately', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  // routes with a nested parameter (i.e. no handler for the /:param) were breaking the display
  findMyWay.on('GET', '/test/:hello/there/:ladies', () => {})
  findMyWay.on('GET', '/test/:hello/there/:ladies/and/:gents', () => {})
  findMyWay.on('GET', '/test/are/:you/:ready/to/:rock', () => {})

  const tree = findMyWay.prettyPrint({ commonPrefix: false })
  const expected = `\
└── /test (GET)
    ├── /are/:you/:ready/to/:rock (GET)
    └── /:hello/there/:ladies (GET)
        └── /and/:gents (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print - multiple parameters are drawn appropriately', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.on('GET', '/test', () => {})
  // routes with a nested parameter (i.e. no handler for the /:param) were breaking the display
  findMyWay.on('GET', '/test/:hello/there/:ladies', () => {})
  findMyWay.on('GET', '/test/:hello/there/:ladies/and/:gents', () => {})
  findMyWay.on('GET', '/test/are/:you/:ready/to/:rock', () => {})

  const tree = findMyWay.prettyPrint({ commonPrefix: false })
  const expected = `\
└── /test (GET)
    ├── /are/:you/:ready/to/:rock (GET)
    └── /:hello/there/:ladies (GET)
        └── /and/:gents (GET)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})

Deno.test('pretty print commonPrefix - use routes array to draw flattened routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test/hello', () => {})
  findMyWay.on('GET', '/testing', () => {})
  findMyWay.on('GET', '/testing/:param', () => {})
  findMyWay.on('PUT', '/update', () => {})

  const radixTree = findMyWay.prettyPrint({ commonPrefix: true })
  const arrayTree = findMyWay.prettyPrint({ commonPrefix: false })

  const radixExpected = `\
└── /
    ├── test (GET)
    │   ├── /hello (GET)
    │   └── ing (GET)
    │       └── /
    │           └── :param (GET)
    └── update (PUT)
`

  const arrayExpected = `\
├── /test (GET)
│   ├── /hello (GET)
│   └── ing (GET)
│       └── /:param (GET)
└── /update (PUT)
`

  deepEqual(typeof radixTree, 'string')
  deepEqual(radixTree, radixExpected)

  deepEqual(typeof arrayTree, 'string')
  deepEqual(arrayTree, arrayExpected)
})

Deno.test('pretty print commonPrefix - handle wildcard root', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('OPTIONS', '*', () => {})
  findMyWay.on('GET', '/test/hello', () => {})
  findMyWay.on('GET', '/testing', () => {})
  findMyWay.on('GET', '/testing/:param', () => {})
  findMyWay.on('PUT', '/update', () => {})

  const arrayTree = findMyWay.prettyPrint({ commonPrefix: false })
  const arrayExpected = `\
├── /test/hello (GET)
├── /testing (GET)
│   └── /:param (GET)
├── /update (PUT)
└── * (OPTIONS)
`
  deepEqual(typeof arrayTree, 'string')
  deepEqual(arrayTree, arrayExpected)
})

Deno.test('pretty print commonPrefix - handle wildcard root', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '*', () => {})
  findMyWay.on('GET', '/test/hello', () => {})
  findMyWay.on('GET', '/testing', () => {})
  findMyWay.on('GET', '/testing/:param', () => {})
  findMyWay.on('PUT', '/update', () => {})

  const radixTree = findMyWay.prettyPrint()
  const radixExpected = `\
└── (empty root node)
    ├── /
    │   ├── test
    │   │   ├── /hello (GET)
    │   │   └── ing (GET)
    │   │       └── /
    │   │           └── :param (GET)
    │   └── update (PUT)
    └── * (GET)
`
  deepEqual(typeof radixTree, 'string')
  deepEqual(radixTree, radixExpected)
})

Deno.test('pretty print commonPrefix - handle constrained routes', async () => {
  // t.plan()

  const findMyWay = FindMyWay()

  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test', { constraints: { host: 'auth.fastify.io' } }, () => {})
  findMyWay.on('GET', '/test/:hello', () => {})
  findMyWay.on('PUT', '/test/:hello', () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '1.1.2' } }, () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '2.0.0' } }, () => {})

  const arrayTree = findMyWay.prettyPrint({ commonPrefix: false })
  const arrayExpected = `\
└── /test (GET)
    /test (GET) {"host":"auth.fastify.io"}
    └── /:hello (GET, PUT)
        /:hello (GET) {"version":"1.1.2"}
        /:hello (GET) {"version":"2.0.0"}
`
  deepEqual(typeof arrayTree, 'string')
  deepEqual(arrayTree, arrayExpected)
})

Deno.test('pretty print commonPrefix - handle method constraint', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.addConstraintStrategy({
    name: 'method',
    storage: function () {
      const handlers = {}
      return {
        get: (type) => { return handlers[type] || null },
        set: (type, store) => { handlers[type] = store }
      }
    },
    deriveConstraint: (req) => req.headers['x-method'],
    mustMatchWhenDerived: true
  })

  findMyWay.on('GET', '/test', () => {})
  findMyWay.on('GET', '/test', { constraints: { method: 'foo' } }, () => {})
  findMyWay.on('GET', '/test/:hello', () => {})
  findMyWay.on('PUT', '/test/:hello', () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { method: 'bar' } }, () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { method: 'baz' } }, () => {})

  const arrayTree = findMyWay.prettyPrint({
    commonPrefix: false,
    methodConstraintName: 'methodOverride'
  })

  const arrayExpected = `\
└── /test (GET)
    /test (GET) {"method":"foo"}
    └── /:hello (GET, PUT)
        /:hello (GET) {"method":"bar"}
        /:hello (GET) {"method":"baz"}
`
  deepEqual(typeof arrayTree, 'string')
  deepEqual(arrayTree, arrayExpected)
})

Deno.test('pretty print includeMeta - commonPrefix: true', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  const namedFunction = () => {}
  const store = {
    onRequest: [() => {}, namedFunction],
    onTimeout: [() => {}],
    genericMeta: 'meta',
    mixedMeta: ['mixed items', { an: 'object' }],
    objectMeta: { one: '1', two: 2 },
    functionMeta: namedFunction
  }

  store[Symbol('symbolKey')] = Symbol('symbolValue')

  findMyWay.on('GET', '/test', () => {}, store)
  findMyWay.on('GET', '/test', { constraints: { host: 'auth.fastify.io' } }, () => {}, store)
  findMyWay.on('GET', '/testing/:hello', () => {}, store)
  findMyWay.on('PUT', '/tested/:hello', () => {}, store)
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '1.1.2' } }, () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '2.0.0' } }, () => {})

  const radixTree = findMyWay.prettyPrint({ commonPrefix: true, includeMeta: true })
  const radixTreeExpected = `\
└── /
    └── test (GET)
        • (onRequest) ["anonymous()","namedFunction()"]
        • (onTimeout) ["anonymous()"]
        • (genericMeta) "meta"
        • (mixedMeta) ["mixed items",{"an":"object"}]
        • (objectMeta) {"one":"1","two":2}
        • (functionMeta) "namedFunction()"
        • (Symbol(symbolKey)) "Symbol(symbolValue)"
        test (GET) {"host":"auth.fastify.io"}
        • (onRequest) ["anonymous()","namedFunction()"]
        • (onTimeout) ["anonymous()"]
        • (genericMeta) "meta"
        • (mixedMeta) ["mixed items",{"an":"object"}]
        • (objectMeta) {"one":"1","two":2}
        • (functionMeta) "namedFunction()"
        • (Symbol(symbolKey)) "Symbol(symbolValue)"
        ├── ing/
        │   └── :hello (GET)
        │       • (onRequest) ["anonymous()","namedFunction()"]
        │       • (onTimeout) ["anonymous()"]
        │       • (genericMeta) "meta"
        │       • (mixedMeta) ["mixed items",{"an":"object"}]
        │       • (objectMeta) {"one":"1","two":2}
        │       • (functionMeta) "namedFunction()"
        │       • (Symbol(symbolKey)) "Symbol(symbolValue)"
        ├── ed/
        │   └── :hello (PUT)
        │       • (onRequest) ["anonymous()","namedFunction()"]
        │       • (onTimeout) ["anonymous()"]
        │       • (genericMeta) "meta"
        │       • (mixedMeta) ["mixed items",{"an":"object"}]
        │       • (objectMeta) {"one":"1","two":2}
        │       • (functionMeta) "namedFunction()"
        │       • (Symbol(symbolKey)) "Symbol(symbolValue)"
        └── /
            └── :hello (GET) {"version":"1.1.2"}
                :hello (GET) {"version":"2.0.0"}
`
  const radixTreeSpecific = findMyWay.prettyPrint({ commonPrefix: true, includeMeta: ['onTimeout', 'objectMeta', 'nonExistent'] })
  const radixTreeSpecificExpected = `\
└── /
    └── test (GET)
        • (onTimeout) ["anonymous()"]
        • (objectMeta) {"one":"1","two":2}
        test (GET) {"host":"auth.fastify.io"}
        • (onTimeout) ["anonymous()"]
        • (objectMeta) {"one":"1","two":2}
        ├── ing/
        │   └── :hello (GET)
        │       • (onTimeout) ["anonymous()"]
        │       • (objectMeta) {"one":"1","two":2}
        ├── ed/
        │   └── :hello (PUT)
        │       • (onTimeout) ["anonymous()"]
        │       • (objectMeta) {"one":"1","two":2}
        └── /
            └── :hello (GET) {"version":"1.1.2"}
                :hello (GET) {"version":"2.0.0"}
`
  const radixTreeNoMeta = findMyWay.prettyPrint({ commonPrefix: true, includeMeta: false })
  const radixTreeNoMetaExpected = `\
└── /
    └── test (GET)
        test (GET) {"host":"auth.fastify.io"}
        ├── ing/
        │   └── :hello (GET)
        ├── ed/
        │   └── :hello (PUT)
        └── /
            └── :hello (GET) {"version":"1.1.2"}
                :hello (GET) {"version":"2.0.0"}
`
  deepEqual(typeof radixTree, 'string')
  deepEqual(radixTree, radixTreeExpected)

  deepEqual(typeof radixTreeSpecific, 'string')
  deepEqual(radixTreeSpecific, radixTreeSpecificExpected)

  deepEqual(typeof radixTreeNoMeta, 'string')
  deepEqual(radixTreeNoMeta, radixTreeNoMetaExpected)
})

Deno.test('pretty print includeMeta - commonPrefix: false', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  const namedFunction = () => {}
  const store = {
    onRequest: [() => {}, namedFunction],
    onTimeout: [() => {}],
    onError: null,
    onRegister: undefined,
    genericMeta: 'meta',
    mixedMeta: ['mixed items', { an: 'object' }],
    objectMeta: { one: '1', two: 2 },
    functionMeta: namedFunction
  }

  store[Symbol('symbolKey')] = Symbol('symbolValue')

  findMyWay.on('GET', '/test', () => {}, store)
  findMyWay.on('GET', '/test', { constraints: { host: 'auth.fastify.io' } }, () => {}, store)
  findMyWay.on('GET', '/testing/:hello', () => {}, store)
  findMyWay.on('PUT', '/tested/:hello', () => {}, store)
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '1.1.2' } }, () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '2.0.0' } }, () => {})

  const arrayTree = findMyWay.prettyPrint({ commonPrefix: false, includeMeta: true })
  const arrayExpected = `\
└── /test (GET)
    • (onRequest) ["anonymous()","namedFunction()"]
    • (onTimeout) ["anonymous()"]
    • (genericMeta) "meta"
    • (mixedMeta) ["mixed items",{"an":"object"}]
    • (objectMeta) {"one":"1","two":2}
    • (functionMeta) "namedFunction()"
    • (Symbol(symbolKey)) "Symbol(symbolValue)"
    /test (GET) {"host":"auth.fastify.io"}
    • (onRequest) ["anonymous()","namedFunction()"]
    • (onTimeout) ["anonymous()"]
    • (genericMeta) "meta"
    • (mixedMeta) ["mixed items",{"an":"object"}]
    • (objectMeta) {"one":"1","two":2}
    • (functionMeta) "namedFunction()"
    • (Symbol(symbolKey)) "Symbol(symbolValue)"
    ├── ing/:hello (GET)
    │   • (onRequest) ["anonymous()","namedFunction()"]
    │   • (onTimeout) ["anonymous()"]
    │   • (genericMeta) "meta"
    │   • (mixedMeta) ["mixed items",{"an":"object"}]
    │   • (objectMeta) {"one":"1","two":2}
    │   • (functionMeta) "namedFunction()"
    │   • (Symbol(symbolKey)) "Symbol(symbolValue)"
    ├── ed/:hello (PUT)
    │   • (onRequest) ["anonymous()","namedFunction()"]
    │   • (onTimeout) ["anonymous()"]
    │   • (genericMeta) "meta"
    │   • (mixedMeta) ["mixed items",{"an":"object"}]
    │   • (objectMeta) {"one":"1","two":2}
    │   • (functionMeta) "namedFunction()"
    │   • (Symbol(symbolKey)) "Symbol(symbolValue)"
    └── /:hello (GET) {"version":"1.1.2"}
        /:hello (GET) {"version":"2.0.0"}
`
  const arraySpecific = findMyWay.prettyPrint({ commonPrefix: false, includeMeta: ['onRequest', 'mixedMeta', 'nonExistent'] })
  const arraySpecificExpected = `\
└── /test (GET)
    • (onRequest) ["anonymous()","namedFunction()"]
    • (mixedMeta) ["mixed items",{"an":"object"}]
    /test (GET) {"host":"auth.fastify.io"}
    • (onRequest) ["anonymous()","namedFunction()"]
    • (mixedMeta) ["mixed items",{"an":"object"}]
    ├── ing/:hello (GET)
    │   • (onRequest) ["anonymous()","namedFunction()"]
    │   • (mixedMeta) ["mixed items",{"an":"object"}]
    ├── ed/:hello (PUT)
    │   • (onRequest) ["anonymous()","namedFunction()"]
    │   • (mixedMeta) ["mixed items",{"an":"object"}]
    └── /:hello (GET) {"version":"1.1.2"}
        /:hello (GET) {"version":"2.0.0"}
`
  const arrayNoMeta = findMyWay.prettyPrint({ commonPrefix: false, includeMeta: false })
  const arrayNoMetaExpected = `\
└── /test (GET)
    /test (GET) {"host":"auth.fastify.io"}
    ├── ing/:hello (GET)
    ├── ed/:hello (PUT)
    └── /:hello (GET) {"version":"1.1.2"}
        /:hello (GET) {"version":"2.0.0"}
`

  deepEqual(typeof arrayTree, 'string')
  deepEqual(arrayTree, arrayExpected)

  deepEqual(typeof arraySpecific, 'string')
  deepEqual(arraySpecific, arraySpecificExpected)

  deepEqual(typeof arrayNoMeta, 'string')
  deepEqual(arrayNoMeta, arrayNoMetaExpected)
})

Deno.test('pretty print includeMeta - buildPrettyMeta function', async () => {
  // t.plan()

  const findMyWay = FindMyWay({
    buildPrettyMeta: route => {
      return { metaKey: route.method === 'PUT' ? 'Hide PUT route path' : route.path }
    }
  })
  const namedFunction = () => {}
  const store = {
    onRequest: [() => {}, namedFunction],
    onTimeout: [() => {}],
    genericMeta: 'meta',
    mixedMeta: ['mixed items', { an: 'object' }],
    objectMeta: { one: '1', two: 2 },
    functionMeta: namedFunction
  }

  store[Symbol('symbolKey')] = Symbol('symbolValue')

  findMyWay.on('GET', '/test', () => {}, store)
  findMyWay.on('GET', '/test', { constraints: { host: 'auth.fastify.io' } }, () => {}, store)
  findMyWay.on('GET', '/test/:hello', () => {}, store)
  findMyWay.on('PUT', '/test/:hello', () => {}, store)
  findMyWay.on('POST', '/test/:hello', () => {}, store)
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '1.1.2' } }, () => {})
  findMyWay.on('GET', '/test/:hello', { constraints: { version: '2.0.0' } }, () => {})

  const arrayTree = findMyWay.prettyPrint({ commonPrefix: false, includeMeta: true })
  const arrayExpected = `\
└── /test (GET)
    • (metaKey) "/test"
    /test (GET) {"host":"auth.fastify.io"}
    • (metaKey) "/test"
    └── /:hello (GET, POST)
        • (metaKey) "/test/:hello"
        /:hello (PUT)
        • (metaKey) "Hide PUT route path"
        /:hello (GET) {"version":"1.1.2"}
        • (metaKey) "/test/:hello"
        /:hello (GET) {"version":"2.0.0"}
        • (metaKey) "/test/:hello"
`
  const radixTree = findMyWay.prettyPrint({ includeMeta: true })
  const radixExpected = `\
└── /
    └── test (GET)
        • (metaKey) "/test"
        test (GET) {"host":"auth.fastify.io"}
        • (metaKey) "/test"
        └── /
            └── :hello (GET, POST)
                • (metaKey) "/test/:hello"
                :hello (PUT)
                • (metaKey) "Hide PUT route path"
                :hello (GET) {"version":"1.1.2"}
                • (metaKey) "/test/:hello"
                :hello (GET) {"version":"2.0.0"}
                • (metaKey) "/test/:hello"
`
  deepEqual(typeof arrayTree, 'string')
  deepEqual(arrayTree, arrayExpected)

  deepEqual(typeof radixTree, 'string')
  deepEqual(radixTree, radixExpected)
})

Deno.test('pretty print - print all methods', async () => {
  // t.plan()

  const findMyWay = FindMyWay()
  findMyWay.all('/test', () => {})

  const tree = findMyWay.prettyPrint()
  const expected = `\
└── /
    └── test (ACL, BIND, CHECKOUT, CONNECT, COPY, DELETE, GET, HEAD, LINK, LOCK, \
M-SEARCH, MERGE, MKACTIVITY, MKCALENDAR, MKCOL, MOVE, NOTIFY, OPTIONS, PATCH, \
POST, PROPFIND, PROPPATCH, PURGE, PUT, QUERY, REBIND, REPORT, SEARCH, SOURCE, \
SUBSCRIBE, TRACE, UNBIND, UNLINK, UNLOCK, UNSUBSCRIBE)
`
  deepEqual(typeof tree, 'string')
  deepEqual(tree, expected)
})
