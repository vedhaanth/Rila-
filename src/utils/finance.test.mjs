import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinanceMetrics } from './finance.js';

test('calculates profit and loss metrics from live business data', () => {
  const result = calculateFinanceMetrics({
    revenue: 15000,
    purchaseCost: 6000,
    expenses: 3200,
    taxCollected: 1800,
    discountGiven: 500,
    shippingCharges: 300,
    refundAmount: 200
  });

  assert.equal(result.grossProfit, 9000);
  assert.equal(result.netProfit, 5800);
  assert.equal(result.loss, 0);
  assert.equal(result.netRevenue, 15800);
});

test('returns loss when expenses exceed gross profit', () => {
  const result = calculateFinanceMetrics({
    revenue: 4000,
    purchaseCost: 3000,
    expenses: 2000,
    taxCollected: 0,
    discountGiven: 0,
    shippingCharges: 0,
    refundAmount: 0
  });

  assert.equal(result.grossProfit, 1000);
  assert.equal(result.netProfit, -1000);
  assert.equal(result.loss, 1000);
});
