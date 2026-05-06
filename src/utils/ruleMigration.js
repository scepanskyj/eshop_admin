/**
 * Migration utilities for converting old rule format to new group-based format
 */

import { createConditionGroup, createCondition } from './paymentRestrictionTypes';
import { ensureConditionRoot, isClauseNode, mapClauseLeaves } from './conditionClause';

function finalizeRuleWithConditionRoot(rule) {
  const next = normalizeProductSkuValues({ ...rule });
  ensureConditionRoot(next);
  const normalized = normalizeProductSkuValues(next);
  delete normalized.groups;
  return normalized;
}

/**
 * Normalize PRODUCT_SKU condition values to string[] (legacy single string / CSV).
 */
export function normalizeProductSkuValues(rule) {
  if (!rule) return rule;

  const mapSku = (c) => {
    if (c.type !== 'PRODUCT_SKU') return c;
    let v = c.value;
    if (typeof v === 'string') {
      v = v.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
    } else if (v == null || v === '') {
      v = [];
    } else if (!Array.isArray(v)) {
      v = [String(v)];
    }
    return { ...c, value: v };
  };

  if (isClauseNode(rule.conditionRoot)) {
    return {
      ...rule,
      conditionRoot: mapClauseLeaves(rule.conditionRoot, mapSku)
    };
  }

  if (rule.groups && Array.isArray(rule.groups)) {
    return {
      ...rule,
      groups: rule.groups.map((g) => ({
        ...g,
        conditions: (g.conditions || []).map(mapSku)
      }))
    };
  }

  return rule;
}

/**
 * Migrate a single rule from old format to new format
 * Old format: { conditions: { operator: 'AND'|'OR', conditions: [...] } }
 * Stored shape: { conditionRoot: { parts, joins } }
 */
export function migrateRule(rule) {
  if (rule == null || typeof rule !== 'object') {
    return rule;
  }

  if (isClauseNode(rule.conditionRoot)) {
    const next = normalizeProductSkuValues({ ...rule });
    delete next.groups;
    return next;
  }

  if (rule.groups && Array.isArray(rule.groups)) {
    return finalizeRuleWithConditionRoot(rule);
  }

  // If no conditions, create empty rule with one empty group
  if (!rule.conditions || !rule.conditions.conditions || !rule.conditions.conditions.length) {
    return finalizeRuleWithConditionRoot({
      ...rule,
      groups: [createConditionGroup()]
    });
  }

  const oldConditions = rule.conditions.conditions || [];
  const operator = rule.conditions.operator || 'AND';

  // If AND operator, put all conditions in one group
  if (operator === 'AND') {
    const migratedConditions = oldConditions.map((oldCond, idx) => {
      const conditionType = mapOldFieldToNewType(oldCond.field);
      const newOperator = mapOldOperatorToNew(oldCond.comparator, conditionType, oldCond.value);
      // Convert value to array if operator is 'includes' or 'excludes'
      let value = oldCond.value;
      if ((newOperator === 'includes' || newOperator === 'excludes') && !Array.isArray(value)) {
        value = value ? [value] : [];
      }
      return {
        ...createCondition(conditionType),
        operator: newOperator,
        value: value
      };
    });
    
    return finalizeRuleWithConditionRoot({
      ...rule,
      groups: [{
        ...createConditionGroup(),
        conditions: migratedConditions
      }]
    });
  }

  // If OR operator, create one group per condition
  const migratedGroups = oldConditions.map((oldCond) => {
    const conditionType = mapOldFieldToNewType(oldCond.field);
    const newOperator = mapOldOperatorToNew(oldCond.comparator, conditionType, oldCond.value);
    // Convert value to array if operator is 'includes' or 'excludes'
    let value = oldCond.value;
    if ((newOperator === 'includes' || newOperator === 'excludes') && !Array.isArray(value)) {
      value = value ? [value] : [];
    }
    return {
      ...createConditionGroup(),
      conditions: [{
        ...createCondition(conditionType),
        operator: newOperator,
        value: value
      }]
    };
  });

  return finalizeRuleWithConditionRoot({
    ...rule,
    groups: migratedGroups
  });
}

/**
 * Map old field names to new condition types.
 * paymentMethod must map to SELECTED_PAYMENT_METHOD; falling back to PAYMENT_AMOUNT
 * would silently change rule meaning and apply/skip restrictions incorrectly.
 */
function mapOldFieldToNewType(oldField) {
  const mapping = {
    'country': 'MARKET',
    'cartTotal': 'PAYMENT_AMOUNT',
    'customerSegment': 'CUSTOMER_TYPE',
    'paymentMethod': 'SELECTED_PAYMENT_METHOD'
  };
  return mapping[oldField] || 'PAYMENT_AMOUNT';
}

/**
 * Map old operators to new operators based on condition type
 */
function mapOldOperatorToNew(oldOperator, conditionType, value) {
  const operatorMapping = {
    '=': 'is',
    '!=': 'is_not',
    '>': 'above',
    '<': 'under',
    'in': 'includes',
    'not in': 'excludes'
  };

  // Special handling for payment amount = 0
  if (conditionType === 'PAYMENT_AMOUNT' && oldOperator === '=' && (value === 0 || value === '0')) {
    return 'equals_zero';
  }

  return operatorMapping[oldOperator] || oldOperator || 'is';
}

/**
 * Legacy demo codes from old seed data → real gateway codes in paymentMethods.seed.js
 * so rules match storefront methods per country (restriction preview / disabled styling).
 */
const LEGACY_PAYMENT_METHOD_ALIASES = {
  paypal: ['it_paypal', 'sk_vub', 'cz_card', 'ro_card', 'pl_card_blik', 'rs_card'],
  cod: ['it_cod', 'sk_cod', 'cz_cod', 'ro_cod', 'pl_cod', 'rs_cod'],
  bank: ['sk_bank']
};

function expandPaymentMethodCodeList(codes) {
  if (!Array.isArray(codes)) return [];
  const out = [];
  const seen = new Set();
  for (const code of codes) {
    if (code == null || code === '') continue;
    const aliases = LEGACY_PAYMENT_METHOD_ALIASES[code];
    if (aliases) {
      for (const a of aliases) {
        if (!seen.has(a)) {
          seen.add(a);
          out.push(a);
        }
      }
    } else if (!seen.has(code)) {
      seen.add(code);
      out.push(code);
    }
  }
  return out;
}

/**
 * Expand legacy payment method codes on a rule (top-level + SELECTED_PAYMENT_METHOD conditions).
 */
export function expandLegacyPaymentMethodCodes(rule) {
  if (!rule || typeof rule !== 'object') return rule;
  const next = { ...rule };
  if (Array.isArray(next.paymentMethods)) {
    next.paymentMethods = expandPaymentMethodCodeList(next.paymentMethods);
  }
  if (Array.isArray(next.groups)) {
    next.groups = next.groups.map((g) => ({
      ...g,
      conditions: (g.conditions || []).map((c) => {
        if (c.type !== 'SELECTED_PAYMENT_METHOD' || !Array.isArray(c.value)) return c;
        return { ...c, value: expandPaymentMethodCodeList(c.value) };
      })
    }));
  }
  if (isClauseNode(next.conditionRoot)) {
    next.conditionRoot = mapClauseLeaves(next.conditionRoot, (c) => {
      if (c.type !== 'SELECTED_PAYMENT_METHOD' || !Array.isArray(c.value)) return c;
      return { ...c, value: expandPaymentMethodCodeList(c.value) };
    });
  }
  return next;
}

/**
 * Ensure each rule has sortOrder (evaluation / display order in admin).
 * Backend contract for storefront evaluation is TBD — see RESTRICTION_SORT_ORDER_NOTE in PaymentRestrictions.vue.
 */
function assignSortOrderIfMissing(rules) {
  if (!Array.isArray(rules) || !rules.length) return rules;
  const allHave = rules.every((r) => r.sortOrder != null && r.sortOrder !== '');
  if (allHave) {
    return rules.map((r) => ({ ...r, sortOrder: Number(r.sortOrder) }));
  }
  const sorted = [...rules].sort(
    (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0)
  );
  return sorted.map((r, i) => ({
    ...r,
    sortOrder: r.sortOrder != null ? Number(r.sortOrder) : i
  }));
}

/**
 * Migrate all rules in an array
 */
export function migrateRules(rules) {
  if (!Array.isArray(rules)) {
    return [];
  }
  return assignSortOrderIfMissing(
    rules.map((rule) => expandLegacyPaymentMethodCodes(migrateRule(rule)))
  );
}
