import type { Method } from "@std/http/unstable-method";
import Router from "./mod.ts";

const router = new Router();

router.on("GET" as Method, "/test", (ctx) => {
  console.log(ctx);
  return new Response("hello world");
});

router.on("GET" as Method, "/test/:id/greet", { auth: true }, (ctx) => {
  console.log(ctx);
  return ctx.json({ hello: ctx.params.id });
});

const server = Deno.serve({ port: 3000 }, async (req) => {
  const res = await router.lookup(req);
  return res ?? new Response("Not Found", { status: 204 });
});

await server.finished;
console.log("Closing Server");
