<template>
  <select
    :value="stringValue"
    @change="handleChange"
    class="native-select"
  >
    <option value="">{{ placeholder }}</option>
    <option
      v-for="opt in options"
      :key="String(opt.value)"
      :value="String(opt.value)"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<script>
import { OPTIONS_BY_TYPE } from '@/utils/conditionConfig';

export default {
  name: 'OptionSelectInput',
  props: {
    value: {
      type: [Boolean, String, Number],
      default: null
    },
    optionKey: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Select option'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE[this.optionKey] || [];
    },
    stringValue() {
      if (this.value === null || this.value === undefined) return '';
      if (this.value === true) return 'true';
      if (this.value === false) return 'false';
      return String(this.value);
    }
  },
  methods: {
    handleChange(event) {
      const val = event.target.value;
      if (val === '') {
        this.$emit('input', null);
      } else if (val === 'true') {
        this.$emit('input', true);
      } else if (val === 'false') {
        this.$emit('input', false);
      } else {
        const opt = this.options.find(o => String(o.value) === val);
        this.$emit('input', opt ? opt.value : val);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

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
</style>
