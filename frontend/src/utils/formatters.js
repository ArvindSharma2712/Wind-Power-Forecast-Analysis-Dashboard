/**
 * Formatting utilities for Wind Power generation and error metrics
 */

/**
 * Formats a power number in Megawatts (MW)
 * @param {number|null} value 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatMW(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats an integer or whole number with standard UK thousands separators
 */
export function formatInteger(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats signed error with explicit '+' or '-' sign
 * @param {number|null} value 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatSignedError(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  const prefix = value > 0 ? '+' : '';
  return prefix + formatMW(value, decimals);
}

/**
 * Formats percentage
 * @param {number|null} value 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(decimals)}%`;
}

/**
 * Returns a human-friendly settlement period label
 * e.g., SP 29 (14:00 - 14:30)
 */
export function formatSettlementPeriod(period) {
  if (!period || period < 1 || period > 50) return `SP ${period || '—'}`;
  const startMinutes = (period - 1) * 30;
  const endMinutes = period * 30;
  
  const startH = Math.floor(startMinutes / 60).toString().padStart(2, '0');
  const startM = (startMinutes % 60).toString().padStart(2, '0');
  const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0');
  const endM = (endMinutes % 60).toString().padStart(2, '0');

  return `SP ${period} (${startH}:${startM}–${endH}:${endM})`;
}
