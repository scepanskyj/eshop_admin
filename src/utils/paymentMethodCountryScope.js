/**
 * Scope payment method codes to gateways available for a tenant (country).
 */

import { mapClauseLeaves } from '@/utils/conditionClause';

/**
 * @param {string} tenantCode
 * @param {Array<{ code?: string, countries?: string[] }>} gateways
 * @returns {Set<string>}
 */
export function gatewayCodesForTenant(tenantCode, gateways) {
  if (!tenantCode || !Array.isArray(gateways)) return new Set();
  return new Set(
    gateways
      .filter(g => g && (g.countries || []).includes(tenantCode))
      .map(g => g.code)
      .filter(Boolean)
  );
}

/**
 * Keep only payment method codes that exist for this country.
 * @param {string[]|undefined|null} paymentMethods
 * @param {string} tenantCode
 * @param {Array} gateways
 * @returns {string[]}
 */
export function scopedPaymentMethods(paymentMethods, tenantCode, gateways) {
  if (!Array.isArray(paymentMethods)) return [];
  const valid = gatewayCodesForTenant(tenantCode, gateways);
  return paymentMethods.filter(code => valid.has(code));
}

/**
 * Filter SELECTED_PAYMENT_METHOD condition values to valid codes for the tenant.
 */
export function normalizeRuleGroupsForCountry(groups, tenantCode, gateways) {
  if (!Array.isArray(groups)) return [];
  const valid = gatewayCodesForTenant(tenantCode, gateways);
  return groups.map(g => ({
    ...g,
    conditions: (g.conditions || []).map(c => {
      if (c.type !== 'SELECTED_PAYMENT_METHOD') return c;
      const v = c.value;
      if (!Array.isArray(v)) return c;
      return { ...c, value: v.filter(code => valid.has(code)) };
    })
  }));
}

/**
 * Same scoping for nested condition clauses (SELECTED_PAYMENT_METHOD only).
 */
export function normalizeConditionRootForCountry(conditionRoot, tenantCode, gateways) {
  if (!conditionRoot || !Array.isArray(conditionRoot.parts)) {
    return conditionRoot;
  }
  const valid = gatewayCodesForTenant(tenantCode, gateways);
  const mapLeaf = (c) => {
    if (c.type !== 'SELECTED_PAYMENT_METHOD' || !Array.isArray(c.value)) return c;
    return { ...c, value: c.value.filter((code) => valid.has(code)) };
  };
  return mapClauseLeaves(conditionRoot, mapLeaf);
}
