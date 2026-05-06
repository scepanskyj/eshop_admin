/**
 * Type definitions for Payment Restriction Rules
 */

/**
 * @typedef {Object} Condition
 * @property {string} id - Unique identifier for the condition
 * @property {ConditionType} type - Type of condition
 * @property {string} operator - Operator for the condition (filtered by type)
 * @property {any} value - Value for the condition (typed per condition type)
 */

/**
 * @typedef {Object} ConditionGroup
 * @property {string} id - Unique identifier for the group
 * @property {Condition[]} conditions - Conditions in this group (combined with AND)
 */

/**
 * @typedef {Object} PaymentRestrictionRule
 * @property {string} id - Unique identifier for the rule
 * @property {string} name - Name of the rule
 * @property {string[]} targetPaymentMethods - Payment method codes to restrict
 * @property {ConditionGroup[]} groups - Condition groups (combined with OR)
 * @property {boolean} active - Whether the rule is active
 * @property {string} [storeView] - Store view filter
 * @property {string} [shopType] - Shop type filter
 * @property {string[]} [targetShopTypes] - Target shop types
 * @property {string} [description] - Rule description
 * @property {boolean} [showWhenApplied] - Show when applied
 * @property {string} [reason] - Reason for restriction
 * @property {string} [updatedBy] - Who updated the rule
 * @property {string} [updatedAt] - Last update timestamp
 */

/**
 * Generate a unique ID for conditions and groups
 */
export function generateId() {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create a new empty condition
 * @param {ConditionType} [type] - Optional condition type
 * @returns {Condition}
 */
export function createCondition(type = null) {
  return {
    id: generateId(),
    type: type || '',
    operator: '',
    value: null
  };
}

/**
 * Create a new empty condition group
 * @returns {ConditionGroup}
 */
export function createConditionGroup() {
  return {
    id: generateId(),
    conditions: []
  };
}

/**
 * Create a new empty rule
 * @returns {PaymentRestrictionRule}
 */
export function createEmptyRule() {
  return {
    id: generateId(),
    name: '',
    targetPaymentMethods: [],
    conditionRoot: {
      id: generateId(),
      parts: [],
      joins: []
    },
    active: true
  };
}
