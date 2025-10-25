/**
 * Formats crypto amounts with appropriate decimal places
 *
 * @param amount - Amount to format (string or number)
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted crypto amount
 *
 * @example
 * formatCryptoAmount("0.00245678") // "0.0025"
 * formatCryptoAmount(1.23456789, 8) // "1.23456789"
 */
export function formatCryptoAmount(
  amount: string | number,
  decimals: number = 4
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return "0." + "0".repeat(decimals);
  }

  return num.toFixed(decimals);
}

/**
 * Formats USD amounts with 2 decimal places and $ symbol
 *
 * @param amount - Amount to format (string or number)
 * @returns Formatted USD string
 *
 * @example
 * formatUSD("145.8") // "$145.80"
 * formatUSD(50) // "$50.00"
 */
export function formatUSD(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return "$0.00";
  }

  return `$${num.toFixed(2)}`;
}

/**
 * Formats large numbers with commas for readability
 *
 * @param amount - Amount to format
 * @returns Formatted number with commas
 *
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
