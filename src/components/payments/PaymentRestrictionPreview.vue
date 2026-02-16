<template>
  <div class="payment-restriction-preview">
    <p class="preview-sentence">
      <span class="preview-text">Restrict</span>
      <span class="preview-methods">{{ formattedMethods }}</span>
      <span class="preview-text">when</span>
      <span class="preview-conditions">{{ conditionSummary }}</span>
    </p>
  </div>
</template>

<script>
import store from '@/store/paymentsStore';
import { getConditionTypeLabel, getOperatorLabel, getOptionsForType } from '@/utils/conditionConfig';

export default {
  name: 'PaymentRestrictionPreview',
  props: {
    paymentMethods: {
      type: Array,
      default: () => []
    },
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
    conditionSummary() {
      const groups = (this.groups || []).filter(g => g.conditions && g.conditions.length > 0);
      if (groups.length === 0) return '—';

      const groupSummaries = groups.map(group => {
        const conditionParts = group.conditions
          .filter(c => c.type && c.operator && c.value !== null && c.value !== undefined && c.value !== '')
          .map(cond => {
            const typeLabel = getConditionTypeLabel(cond.type);
            const operatorLabel = getOperatorLabel(cond.type, cond.operator);
            const valueLabel = this.formatConditionValue(cond.type, cond.value);
            return `${typeLabel} ${operatorLabel} ${valueLabel}`;
          });
        return conditionParts.join(' AND ');
      });

      return groupSummaries.join(' OR ') || '—';
    }
  },
  methods: {
    formatConditionValue(conditionType, value) {
      if (value === null || value === undefined || value === '') return '';

      if (conditionType === 'SELECTED_PAYMENT_METHOD') {
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
  padding: tokens.$space-md tokens.$space-lg;
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
}

.preview-methods {
  font-weight: 600;
  color: tokens.$color-green-600;
  margin: 0 4px;
}

.preview-conditions {
  color: tokens.$color-text-primary;
  margin-left: 4px;
}
</style>
