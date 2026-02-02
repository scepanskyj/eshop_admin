<template>
  <div class="multi-select-wrapper">
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

.multi-select-wrapper {
  width: 100%;
}

.native-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  font-size: 13px;
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
  padding: 7px 11px;
}

.native-select option {
  padding: 6px;
  font-size: 13px;
}

.native-select-multiple {
  min-height: 100px;
  padding: 6px;
}

.selected-values {
  margin-top: 6px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
