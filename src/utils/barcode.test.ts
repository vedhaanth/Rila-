import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBarcode, findProductByBarcode } from './barcode';

test('normalizes scan codes by removing spaces and case', () => {
  assert.equal(normalizeBarcode('0 696168 522623'), '0696168522623');
});

test('matches a product by barcode even when scanned code contains spaces', () => {
  const product = {
    product_id: 'PROD-9001',
    product_name: 'Rila Coco Treat',
    barcode: '0696168522623',
    stock: 20
  };

  assert.equal(findProductByBarcode([product as any], '0 696168 522623'), product);
  assert.equal(findProductByBarcode([product as any], 'PROD-9001'), product);
});

test('ignores already selected products so they do not reappear in the scan list', () => {
  const product = {
    product_id: 'PROD-9001',
    product_name: 'Rila Coco Treat',
    barcode: '0696168522623',
    stock: 20
  };

  assert.equal(findProductByBarcode([product as any], '0 696168 522623', ['PROD-9001']), undefined);
  assert.equal(findProductByBarcode([product as any], 'PROD-9001', ['PROD-9001']), undefined);
});
