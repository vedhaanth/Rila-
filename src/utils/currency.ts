/**
 * Format number as Indian Rupees with proper Indian numbering system
 * Examples: ₹1,234 | ₹12,34,567 | ₹1,23,45,678
 */
export const formatINR = (amount: number, decimals: number = 0): string => {
  const num = Math.abs(amount);
  const isNegative = amount < 0;

  if (decimals > 0) {
    return `${isNegative ? '-' : ''}₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  return `${isNegative ? '-' : ''}₹${Math.round(num).toLocaleString('en-IN')}`;
};

/**
 * Convert to Indian numbering: 1000000 => "10 Lakh"
 */
export const formatINRCompact = (amount: number): string => {
  const num = Math.abs(amount);
  const isNegative = amount < 0;
  const sign = isNegative ? '-' : '';

  if (num >= 10000000) {
    return `${sign}₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `${sign}₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `${sign}₹${(num / 1000).toFixed(2)}K`;
  }
  return `${sign}₹${num.toFixed(0)}`;
};
