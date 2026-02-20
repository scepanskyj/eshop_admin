<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="options"
    item-value="value"
    item-title="label"
    multiple
    chips
    small-chips
    density="compact"
    variant="outlined"
    hide-details="auto"
    :placeholder="placeholder"
  />
</template>

<script>
import { OPTIONS_BY_TYPE } from '@/utils/conditionConfig';

export default {
  name: 'ProductTypeInput',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    optionKey: {
      type: String,
      default: 'PRODUCT_TYPE'
    },
    placeholder: {
      type: String,
      default: 'Select product types'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE[this.optionKey] || OPTIONS_BY_TYPE.PRODUCT_TYPE;
    }
  }
};
</script>
