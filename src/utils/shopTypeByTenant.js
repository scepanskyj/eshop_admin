/**
 * Shop type field visibility and options per tenant (country code).
 * RO: 1P, OTC — PL: 1P, 2P, 2P+ — CZ/SK: 1P, 3P — others: hidden in UI.
 */

const RO = [
  { value: '1P', title: '1P' },
  { value: 'OTC', title: 'OTC' }
];

const PL = [
  { value: '1P', title: '1P' },
  { value: '2P', title: '2P' },
  { value: '2P+', title: '2P+' }
];

const CZ_SK = [
  { value: '1P', title: '1P' },
  { value: '3P', title: '3P' }
];

export function showShopTypeForTenant(tenantCode) {
  return tenantCode === 'RO' || tenantCode === 'PL' || tenantCode === 'CZ' || tenantCode === 'SK';
}

/**
 * @param {string} tenantCode
 * @returns {{ value: string, title: string }[]}
 */
export function shopTypeOptionsForTenant(tenantCode) {
  if (tenantCode === 'RO') return RO;
  if (tenantCode === 'PL') return PL;
  if (tenantCode === 'CZ' || tenantCode === 'SK') return CZ_SK;
  return [];
}

export function defaultShopTypeForTenant(tenantCode) {
  const opts = shopTypeOptionsForTenant(tenantCode);
  return opts.length ? opts[0].value : null;
}
