<template>
  <v-autocomplete
    :value="value"
    @input="$emit('input', $event)"
    :items="options"
    item-value="value"
    item-text="label"
    multiple
    chips
    small-chips
    dense
    outlined
    hide-details="auto"
    :placeholder="placeholder"
  />
</template>

<script>
import { OPTIONS_BY_TYPE } from '@/utils/conditionConfig';

export default {
  name: 'ProductTypeInput',
  props: {
    value: {
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
