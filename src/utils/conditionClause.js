/**
 * Condition clause tree: flat mix of conditions and nested groups with per-gap AND/OR.
 * Shape: { id, parts: (Condition | Clause)[], joins: ('AND'|'OR')[] }
 * joins[i] combines parts[i] and parts[i + 1].
 */

import { generateId } from '@/utils/paymentRestrictionTypes';

/** @param {unknown} part */
export function isClauseNode(part) {
  return part != null && typeof part === 'object' && Array.isArray(part.parts);
}

export function createClause() {
  return {
    id: generateId(),
    parts: [],
    joins: []
  };
}

/**
 * Migrate legacy OR-of-AND-groups shape to a single root clause.
 * @param {Array<{ conditions?: unknown[] }>|undefined|null} groups
 */
export function legacyGroupsToConditionRoot(groups) {
  const root = createClause();
  if (!Array.isArray(groups)) return root;

  for (const g of groups) {
    const conditions = (g && g.conditions) || [];
    if (!conditions.length) continue;

    let part;
    if (conditions.length === 1) {
      part = { ...conditions[0] };
    } else {
      part = createClause();
      part.parts = conditions.map((c) => ({ ...c }));
      part.joins = Array(conditions.length - 1).fill('AND');
    }

    if (root.parts.length > 0) {
      root.joins.push('OR');
    }
    root.parts.push(part);
  }

  return root;
}

/**
 * @param {Record<string, unknown>} rule
 */
export function ensureConditionRoot(rule) {
  if (!rule || typeof rule !== 'object') return rule;
  if (isClauseNode(rule.conditionRoot)) return rule;
  rule.conditionRoot = legacyGroupsToConditionRoot(rule.groups);
  return rule;
}

function isCompleteCondition(cond) {
  if (!cond || typeof cond !== 'object') return false;
  if (!cond.type || !cond.operator) return false;
  if (cond.operator === 'equals_zero') return true;
  const v = cond.value;
  if (v === null || v === undefined || v === '') return false;
  if (Array.isArray(v) && v.length === 0) return false;
  return true;
}

/** @param {ReturnType<createClause>} clause */
export function clauseHasAnyComplete(clause) {
  if (!clause || !Array.isArray(clause.parts)) return false;
  for (const p of clause.parts) {
    if (isClauseNode(p)) {
      if (clauseHasAnyComplete(p)) return true;
    } else if (isCompleteCondition(p)) return true;
  }
  return false;
}

/**
 * @param {ReturnType<createClause>} clause
 * @param {(c: object) => object} mapLeaf
 */
export function mapClauseLeaves(clause, mapLeaf) {
  return {
    ...clause,
    parts: clause.parts.map((p) => {
      if (isClauseNode(p)) return mapClauseLeaves(p, mapLeaf);
      return mapLeaf(p);
    })
  };
}
