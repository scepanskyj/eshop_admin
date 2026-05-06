<template>
  <div class="payment-restriction-preview">
    <p class="preview-sentence">
      <span class="preview-text preview-text--first">Restrict</span>
      <span class="preview-methods">{{ formattedMethods }}</span>
      <span class="preview-text">when</span>
      <span class="preview-conditions" v-html="conditionSummaryHtml"></span>
    </p>
  </div>
</template>

<script>
import store from '@/store/paymentsStore';
import { getConditionTypeLabel, getOperatorLabel, getOptionsForType } from '@/utils/conditionConfig';
import { isClauseNode, legacyGroupsToConditionRoot } from '@/utils/conditionClause';

function clauseToPlainSummary(clause, formatLeaf) {
  if (!clause || !Array.isArray(clause.parts) || clause.parts.length === 0) {
    return '';
  }
  const chunks = [];
  for (let i = 0; i < clause.parts.length; i++) {
    const p = clause.parts[i];
    let text = '';
    if (isClauseNode(p)) {
      const inner = clauseToPlainSummary(p, formatLeaf);
      if (inner) text = `(${inner})`;
    } else {
      text = formatLeaf(p);
    }
    if (!text) continue;
    if (chunks.length === 0) {
      chunks.push(text);
    } else {
      chunks.push(clause.joins[i - 1] || 'AND', text);
    }
  }
  return chunks.join(' ');
}

export default {
  name: 'PaymentRestrictionPreview',
  props: {
    paymentMethods: {
      type: Array,
      default: () => []
    },
    /** Preferred: tree `{ id, parts, joins }` */
    conditionRoot: {
      type: Object,
      default: null
    },
    /** Legacy: OR-of-groups; used when conditionRoot is absent */
    groups: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    formattedMethods() {
      if (!this.paymentMethods || !this.paymentMethods.length) return '—';
      const titles = this.paymentMethods.map(code => {
        const gateway = store.state.gateways.find(g => g.code === code);
        return gateway ? gateway.title : code;
      });
      if (titles.length === 1) return titles[0];
      return titles.join(', ');
    },
    effectiveRoot() {
      if (this.conditionRoot && Array.isArray(this.conditionRoot.parts)) {
        return this.conditionRoot;
      }
      return legacyGroupsToConditionRoot(this.groups);
    },
    conditionSummary() {
      const raw = clauseToPlainSummary(this.effectiveRoot, (c) => this.formatConditionPhrase(c));
      return raw.trim() || '—';
    },
    conditionSummaryHtml() {
      const raw = this.conditionSummary;
      if (!raw || raw === '—') return raw;
      return raw
        .replace(/ AND /g, ' <strong class="preview-operator">AND</strong> ')
        .replace(/ OR /g, ' <strong class="preview-operator">OR</strong> ');
    }
  },
  methods: {
    conditionCompleteForPreview(cond) {
      if (!cond.type || !cond.operator) return false;
      if (cond.operator === 'equals_zero') return true;
      const v = cond.value;
      if (v === null || v === undefined || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    },
    formatConditionPhrase(cond) {
      if (!this.conditionCompleteForPreview(cond)) return '';
      const typeLabel = getConditionTypeLabel(cond.type);
      const operatorLabel = getOperatorLabel(cond.type, cond.operator);
      const valueLabel = this.formatConditionValue(cond.type, cond.value);
      return `${typeLabel} ${operatorLabel} ${valueLabel}`;
    },
    formatConditionValue(conditionType, value) {
      if (value === null || value === undefined || value === '') return '';

      if (conditionType === 'SELECTED_PAYMENT_METHOD') {
        if (Array.isArray(value)) {
          return value.map(code => {
            const gateway = store.state.gateways.find(g => g.code === code);
            return gateway ? gateway.title : String(code);
          }).join(', ');
        }
        const gateway = store.state.gateways.find(g => g.code === value);
        return gateway ? gateway.title : String(value);
      }

      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        if (value.min !== undefined && value.max !== undefined) {
          return `${value.min} - ${value.max}`;
        }
        return '';
      }

      const options = getOptionsForType(conditionType);
      const optionMap = {};
      if (options && Array.isArray(options)) {
        options.forEach(opt => { optionMap[opt.value] = opt.label; });
      }

      if (Array.isArray(value)) {
        return value.map(v => {
          if (typeof v === 'boolean') return v ? 'Yes' : 'No';
          return optionMap[v] || String(v);
        }).join(', ');
      }

      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      return optionMap[value] || String(value);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.payment-restriction-preview {
  padding: tokens.$space-md;
  background-color: tokens.$color-surface-muted;
  border-radius: 8px;
  border: 1px solid tokens.$color-border-subtle;
}

.preview-sentence {
  font: tokens.$text-p1;
  color: tokens.$color-text-secondary;
  margin: 0;
  line-height: 1.5;
}

.preview-text {
  color: tokens.$color-text-secondary;
  margin: 0 4px;

  &--first {
    margin-left: 0;
  }
}

.preview-methods {
  font-weight: 600;
  color: tokens.$color-green-600;
  margin: 0 4px;
}

.preview-conditions {
  color: tokens.$color-text-primary;
  margin-left: 4px;

  :deep(.preview-operator) {
    font-weight: 700;
    color: tokens.$color-text-primary;
  }
}
</style>
