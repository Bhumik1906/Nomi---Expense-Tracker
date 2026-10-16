import { Currency, CURRENCIES } from './types';

/**
 * Converts major currency unit string or number (e.g., 100.50) into integer minor units (10050).
 * Prevents floating point issues (e.g. 100.50 * 100 = 10049.999999999999).
 */
export function toMinorUnits(amount: number | string, currency: Currency = 'INR'): number {
  const decimals = CURRENCIES[currency]?.decimals ?? 2;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  
  if (decimals === 0) {
    return Math.round(num);
  }
  
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor);
}

/**
 * Converts integer minor units (10050) back to major float units (100.50).
 */
export function toMajorUnits(minorAmount: number, currency: Currency = 'INR'): number {
  const decimals = CURRENCIES[currency]?.decimals ?? 2;
  if (decimals === 0) return minorAmount;
  const factor = Math.pow(10, decimals);
  return minorAmount / factor;
}

/**
 * Formats integer minor units for display (e.g., 10050 -> "₹100.50").
 */
export function formatMoney(
  minorAmount: number,
  currency: Currency = 'INR',
  showSymbol: boolean = true
): string {
  const config = CURRENCIES[currency] || CURRENCIES.INR;
  const major = toMajorUnits(Math.abs(minorAmount), currency);
  
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(major);

  const prefix = minorAmount < 0 ? '-' : '';
  const symbolStr = showSymbol ? config.symbol : '';

  return `${prefix}${symbolStr}${formattedNumber}`;
}

/**
 * Helper to get symbol for currency.
 */
export function getCurrencySymbol(currency: Currency = 'INR'): string {
  return CURRENCIES[currency]?.symbol ?? '₹';
}
