<template>
  <div class="payment-restriction-builder">
    <ConditionClauseEditor
      :model-value="rootClause"
      :depth="0"
      @update:model-value="onRootUpdate"
    />
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
.payment-restriction-builder {
  width: 100%;
}
</style>
