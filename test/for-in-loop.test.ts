// @ts-nocheck
// 'use strict'

/* eslint no-extend-native: off */

import { assert, assertEquals, assertThrows, assertMatch, assertNotEquals, fail } from '@std/assert';
import FindMyWay from '../index.ts';

// Something could extend the Array prototype
Array.prototype.test = null;

Deno.test('for-in-loop', async () => {
  FindMyWay();
});

Deno.test('ignore inherited constraint keys', async () => {
  const findMyWay = FindMyWay();
  const constraints = Object.create({ tap: true });

  findMyWay.on('GET', '/test', { constraints }, () => {});
});
