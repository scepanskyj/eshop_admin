/**
 * Migration utilities for converting old rule format to new group-based format
 */

import { createConditionGroup, createCondition } from './paymentRestrictionTypes';

/**
 * Migrate a single rule from old format to new format
 * Old format: { conditions: { operator: 'AND'|'OR', conditions: [...] } }
 * New format: { groups: [{ id, conditions: [...] }] }
 */
export function migrateRule(rule) {
  // If rule already has groups, assume it's already migrated
  if (rule.groups && Array.isArray(rule.groups)) {
    return rule;
  }

  // If no conditions, create empty rule with one empty group
  if (!rule.conditions || !rule.conditions.conditions || !rule.conditions.conditions.length) {
    return {
      ...rule,
      groups: [createConditionGroup()]
    };
  }

  const oldConditions = rule.conditions.conditions || [];
  const operator = rule.conditions.operator || 'AND';

  // Convert old condition format to new format
  const newConditions = oldConditions.map(oldCond => {
    // Map old field names to new condition types if needed
    const typeMapping = {
      'country': 'MARKET',
      'cartTotal': 'PAYMENT_AMOUNT',
      'customerSegment': 'CUSTOMER_TYPE',
      'paymentMethod': null // This doesn't map directly
    };

    let conditionType = oldCond.field;
    if (typeMapping[oldCond.field]) {
      conditionType = typeMapping[oldCond.field];
    }

    // Map old comparators to new operators
    const operatorMapping = {
      '=': 'is',
      '!=': 'is_not',
      '>': 'above',
      '<': 'under',
      'in': 'includes',
      'not in': 'excludes'
    };

    let operator = oldCond.comparator;
    if (operatorMapping[oldCond.comparator]) {
      operator = operatorMapping[oldCond.comparator];
    }

    return createCondition(conditionType || '');
  });

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
    
    return {
      ...rule,
      groups: [{
        ...createConditionGroup(),
        conditions: migratedConditions
      }]
    };
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
  
  return {
    ...rule,
    groups: migratedGroups
  };
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
 * Migrate all rules in an array
 */
export function migrateRules(rules) {
  if (!Array.isArray(rules)) {
    return [];
  }
  return rules.map(rule => migrateRule(rule));
}
