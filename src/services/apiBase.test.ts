import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBase } from './apiBase.ts';

test('uses the Render backend for Vercel-hosted frontends', () => {
  const base = resolveApiBase({ hostname: 'relish-mart-erp.vercel.app', origin: 'https://relish-mart-erp.vercel.app' }, '', '', '');
  assert.equal(base, 'https://rila.onrender.com/api');
});

test('uses the same-origin /api base for non-Vercel hosts', () => {
  const base = resolveApiBase({ hostname: 'example.com', origin: 'https://example.com' }, '', '', '');
  assert.equal(base, 'https://example.com/api');
});

test('prefers explicit Vite API URL overrides', () => {
  const base = resolveApiBase({ hostname: 'example.com', origin: 'https://example.com' }, '', 'https://api.example.com', '');
  assert.equal(base, 'https://api.example.com');
});
