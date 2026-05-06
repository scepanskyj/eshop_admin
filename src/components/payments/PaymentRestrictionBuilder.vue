<template>
  <div class="payment-restriction-builder">
    <ConditionClauseEditor
      :model-value="rootClause"
      :depth="0"
      @update:model-value="onRootUpdate"
    />
    <p v-if="rootClause.parts.length === 0" class="empty-hint">
      Add a condition or a group. Use the chips between items to switch between <strong>AND</strong> and <strong>OR</strong>.
    </p>
  </div>
</template>

<script>
import ConditionClauseEditor from './ConditionClauseEditor.vue';
import { createClause, isClauseNode } from '@/utils/conditionClause';

export default {
  name: 'PaymentRestrictionBuilder',
  components: {
    ConditionClauseEditor
  },
  props: {
    modelValue: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue'],
  computed: {
    rootClause() {
      if (this.modelValue && isClauseNode(this.modelValue)) {
        return this.modelValue;
      }
      return createClause();
    }
  },
  methods: {
    onRootUpdate(next) {
      this.$emit('update:modelValue', next);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.payment-restriction-builder {
  width: 100%;
}

.empty-hint {
  font: tokens.$text-p2;
  color: tokens.$color-text-secondary;
  margin: tokens.$space-md 0 0;
  line-height: 1.5;
}
</style>
