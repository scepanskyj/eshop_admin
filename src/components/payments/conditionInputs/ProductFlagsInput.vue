<template>
  <select
    :value="value"
    @change="handleMultiSelectChange"
    multiple
    class="native-select native-select-multiple"
    :size="Math.min(options.length + 1, 6)"
  >
    <option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      :selected="value && value.includes(opt.value)"
    >
      {{ opt.label }}
    </option>
  </select>
  <div v-if="value && value.length > 0" class="selected-values">
    Selected: {{ selectedLabels.join(', ') }}
  </div>
</template>

<script>
import { OPTIONS_BY_TYPE } from '@/utils/conditionConfig';

export default {
  name: 'ProductFlagsInput',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select product flags'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.PRODUCT_FLAGS_COMBINATION;
    },
    selectedLabels() {
      if (!this.value || !Array.isArray(this.value)) return [];
      return this.value.map(val => {
        const opt = this.options.find(o => o.value === val);
        return opt ? opt.label : val;
      });
    }
  },
  methods: {
    handleMultiSelectChange(event) {
      const selected = Array.from(event.target.selectedOptions).map(opt => opt.value);
      this.$emit('input', selected);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.native-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.native-select:hover {
  border-color: rgba(0, 0, 0, 0.6);
}

.native-select:focus {
  outline: none;
  border-color: tokens.$color-green;
  border-width: 2px;
  padding: 11px 15px;
}

.native-select option {
  padding: 8px;
}

.native-select-multiple {
  min-height: 120px;
  padding: 8px;
}

.selected-values {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
