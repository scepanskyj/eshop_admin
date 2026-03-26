<template>
  <v-combobox
    :model-value="normalized"
    class="sku-list-input"
    :items="mergedItems"
    multiple
    chips
    closable-chips
    density="compact"
    variant="outlined"
    hide-details="auto"
    :placeholder="placeholder"
    @update:model-value="onUpdate"
  />
</template>

<script>
import { SKU_SUGGESTIONS } from '@/mock/skuSuggestions.mock.js';

function toStringArray(val) {
  if (Array.isArray(val)) {
    return val.map((v) => (typeof v === 'object' && v !== null ? v.value ?? v.title : v)).map(String).map((s) => s.trim()).filter(Boolean);
  }
  if (typeof val === 'string' && val) {
    return val.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export default {
  name: 'SkuListInput',
  props: {
    modelValue: {
      type: [Array, String],
      default: () => []
    },
    operator: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Add SKUs (Enter or comma). Suggestions appear as you type.'
    }
  },
  computed: {
    normalized() {
      return toStringArray(this.modelValue);
    },
    mergedItems() {
      return [...new Set([...this.normalized, ...SKU_SUGGESTIONS])].sort((a, b) => a.localeCompare(b));
    },
    isEquals() {
      return this.operator === 'equals';
    }
  },
  methods: {
    onUpdate(val) {
      let next = toStringArray(val);
      next = [...new Set(next)];
      if (this.isEquals && next.length > 1) {
        next = [next[0]];
      }
      this.$emit('update:modelValue', next.length ? next : []);
    }
  }
};
</script>

<style lang="scss" scoped>
.sku-list-input {
  width: 100%;
}
</style>
