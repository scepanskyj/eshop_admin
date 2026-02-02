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
  name: 'MarketInput',
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Select market'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.MARKET;
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
