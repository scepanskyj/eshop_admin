/**
 * Map country codes to their default currencies
 */
export const COUNTRY_CURRENCIES = {
  IT: 'EUR',
  SK: 'EUR',
  CZ: 'CZK',
  RO: 'RON',
  PL: 'PLN',
  AT: 'EUR',
  DE: 'EUR',
  GB: 'GBP',
  HU: 'HUF',
  US: 'USD',
  GLO: 'EUR' // Default for global
};

/**
 * Get currency for a country code
 */
export function getCurrencyForCountry(countryCode) {
  return COUNTRY_CURRENCIES[countryCode] || 'EUR';
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies() {
  return Array.from(new Set(Object.values(COUNTRY_CURRENCIES))).sort();
}

