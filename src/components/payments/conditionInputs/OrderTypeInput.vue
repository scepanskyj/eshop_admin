<template>
  <select
    :value="value"
    @change="$emit('input', $event.target.value === '' ? null : $event.target.value)"
    class="native-select"
  >
    <option value="">{{ placeholder }}</option>
    <option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<script>
import { OPTIONS_BY_TYPE } from '@/utils/conditionConfig';

export default {
  name: 'OrderTypeInput',
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Select order type'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.ORDER_TYPE;
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
</style>
