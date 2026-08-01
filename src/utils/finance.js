export function calculateFinanceMetrics(input) {
  const grossRevenue = Number(input.revenue || 0);
  const totalSales = grossRevenue;
  const totalPurchaseCost = Number(input.purchaseCost || 0);
  const totalExpenses = Number(input.expenses || 0);
  const taxCollected = Number(input.taxCollected || 0);
  const discountGiven = Number(input.discountGiven || 0);
  const shippingCharges = Number(input.shippingCharges || 0);
  const refundAmount = Number(input.refundAmount || 0);

  const netRevenue = Number((totalSales - discountGiven - refundAmount + taxCollected - shippingCharges).toFixed(2));
  const grossProfit = Number((totalSales - totalPurchaseCost).toFixed(2));
  const netProfit = Number((grossProfit - totalExpenses).toFixed(2));
  const loss = netProfit < 0 ? Number((-netProfit).toFixed(2)) : 0;

  return {
    grossRevenue,
    totalSales,
    totalPurchaseCost,
    totalExpenses,
    taxCollected,
    discountGiven,
    shippingCharges,
    refundAmount,
    netRevenue,
    grossProfit,
    netProfit,
    loss
  };
}
