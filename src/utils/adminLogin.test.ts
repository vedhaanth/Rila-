import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAdminLogin } from './adminLogin';

test('single admin credentials route to the primary dashboard', () => {
  assert.equal(resolveAdminLogin('admin@smartretail.com', 'admin123'), 'admin1');
});

test('legacy admin credentials still map to their respective dashboards', () => {
  assert.equal(resolveAdminLogin('admin1@smartretail.com', 'admin123'), 'admin1');
  assert.equal(resolveAdminLogin('admin2@smartretail.com', 'admin123'), 'admin2');
});

test('non-admin credentials do not activate the admin portal', () => {
  assert.equal(resolveAdminLogin('customer@example.com', 'password123'), null);
});
