import { assert, fail } from "@std/assert";
import Router from "../mod.ts";

Deno.test("case insensitive static routes of level 1", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/woo", () => {});
  await router.lookup(new Request("http://example.com/WOO"));
});

Deno.test("case insensitive static routes of level 2", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/foo/woo", () => {});
  await router.lookup(new Request("http://example.com/FoO/WOO"));
});

Deno.test("case insensitive static routes of level 3", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/foo/bar/woo", () => {});
  await router.lookup(new Request("http://example.com/Foo/bAR/WoO"));
});

Deno.test("parametric case insensitive", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/foo/:param", (ctx) => {
    assert(ctx.params.param === "bAR");
  });
  await router.lookup(new Request("http://example.com/Foo/bAR"));
});

Deno.test("parametric case insensitive with a static part", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/foo/my-:param", (ctx) => {
    assert(ctx.params.param === "bAR");
  });
  await router.lookup(new Request("http://example.com//Foo/MY-bAR"));
});

Deno.test("parametric case insensitive with capital letter", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/foo/:Param", (ctx) => {
    assert(ctx.params.Param === "bAR");
  });
  await router.lookup(new Request("http://example.com/Foo/bAR"));
});

Deno.test(
  "case insensitive with capital letter in static path with param",
  async () => {
    const router = new Router({
      caseSensitive: false,
      defaultRoute: () => {
        fail("The default route should not have been executed");
      },
    });
    router.on("GET", "/Foo/bar/:param", (ctx) => {
      assert(ctx.params.param === "baZ");
    });
    await router.lookup(new Request("http://example.com/foo/bar/baZ"));
  },
);

Deno.test(
  "case insensitive with multiple paths containing capital letter in static path with param",
  async () => {
    /*
     * This is a reproduction of the issue documented at
     * https://github.com/delvedor/find-my-way/issues/96.
     */
    const router = new Router({
      caseSensitive: false,
      defaultRoute: () => {
        fail("The default route should not have been executed");
      },
    });
    router.on("GET", "/Foo/bar/:param", (ctx) => {
      assert(ctx.params.param === "baZ");
    });
    router.on("GET", "/Foo/baz/:param", (ctx) => {
      assert(ctx.params.param === "baR");
    });
    await Promise.all([
      router.lookup(new Request("http://example.com/foo/bar/baZ")),
      router.lookup(new Request("http://example.com/foo/baz/baR")),
    ]);
  },
);

Deno.test(
  "case insensitive with multiple mixed-case params within same slash couple",
  async () => {
    const router = new Router({
      caseSensitive: false,
      defaultRoute: () => {
        fail("The default route should not have been executed");
      },
    });
    router.on("GET", "/foo/:param1-:param2", (ctx) => {
      assert(ctx.params.param1 === "My");
      assert(ctx.params.param2 === "bAR");
    });
    await router.lookup(new Request("http://example.com/FOO/My-bAR"));
  },
);

Deno.test("case insensitive with multiple mixed-case params", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/foo/:param1/:param2", (ctx) => {
    assert(ctx.params.param1 === "My");
    assert(ctx.params.param2 === "bAR");
  });
  await router.lookup(new Request("http://example.com/FOO/My/bAR"));
});

Deno.test("case insensitive with wildcard", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("GET", "/foo/*", (ctx) => {
    assert(ctx.params["*"] === "baR");
  });
  await router.lookup(new Request("http://example.com/FOO/baR"));
});

Deno.test("parametric case insensitive with multiple routes", async () => {
  const router = new Router({
    caseSensitive: false,
    defaultRoute: () => {
      fail("The default route should not have been executed");
    },
  });
  router.on("POST", "/foo/:param/Static/:userId/Save", (ctx) => {
    assert(ctx.params.param === "bAR");
    assert(ctx.params.userId === "one");
  });
  router.on("POST", "/foo/:param/Static/:userId/Update", (ctx) => {
    assert(ctx.params.param === "Bar");
    assert(ctx.params.userId === "two");
  });
  router.on("POST", "/foo/:param/Static/:userId/CANCEL", (ctx) => {
    assert(ctx.params.param === "bAR");
    assert(ctx.params.userId === "THREE");
  });
  await Promise.all([
    router.lookup(
      new Request("http://example.com/foo/bAR/static/one/SAVE", {
        method: "POST",
      }),
    ),
    router.lookup(
      new Request("http://example.com/fOO/Bar/Static/two/update", {
        method: "POST",
      }),
    ),
    router.lookup(
      new Request("http://example.com/Foo/bAR/STATIC/THREE/cAnCeL", {
        method: "POST",
      }),
    ),
  ]);
});
