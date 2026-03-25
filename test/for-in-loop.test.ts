
import Router from '../mod.ts';

// Something could extend the Array prototype
(Array.prototype as any).test = null;

Deno.test('for-in-loop', () => {
  new Router();
});

Deno.test('ignore inherited constraint keys', () => {
  const router = new Router();
  const constraints = Object.create({ tap: true });

  router.on('GET', '/test', { constraints }, () => {});
});
