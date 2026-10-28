/**
 * Date and time utilities for UK electricity market intervals
 * Standard settlement periods are 30 minutes (48 periods per standard day).
 * UK Timezone: Europe/London (GMT in January).
 */

/**
 * Formats a Date object or ISO string to UK display format (GMT/BST aware)
 * e.g. "15 Jan 2026, 14:30 GMT"
 */
export function formatUKDateTime(dateInput, includeZone = true) {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Invalid date';

  const day = date.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year}, ${hours}:${minutes}${includeZone ? ' GMT' : ''}`;
}

/**
 * Formats date to "YYYY-MM-DD"
 */
export function formatISODate(dateInput) {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats date to readable short date e.g. "15 Jan"
 */
export function formatShortDate(dateInput) {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Formats time only e.g. "14:30"
 */
export function formatTimeOnly(dateInput) {
  if (!dateInput) return '—';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '—';
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Calculates lead time difference in hours between publication and delivery
 */
export function getLeadTimeHours(publicationTime, deliveryTime) {
  if (!publicationTime || !deliveryTime) return null;
  const pub = new Date(publicationTime).getTime();
  const del = new Date(deliveryTime).getTime();
  const diffHours = (del - pub) / (1000 * 60 * 60);
  return Math.round(diffHours * 10) / 10;
}

/**
 * Converts a 30-minute interval offset from 00:00 to Settlement Period (1-48)
 */
export function getSettlementPeriod(dateInput) {
  if (!dateInput) return 1;
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return Math.floor(totalMinutes / 30) + 1;
}
