<template>
  <v-select
    :value="value"
    @input="$emit('input', $event)"
    :items="options"
    item-value="value"
    item-text="label"
    multiple
    chips
    small-chips
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
    placeholder: {
      type: String,
      default: 'Select product types'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.PRODUCT_TYPE;
    }
  }
};
</script>
