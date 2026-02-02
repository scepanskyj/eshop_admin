<template>
  <v-select
    :value="value"
    @input="$emit('input', $event)"
    :items="options"
    item-value="value"
    item-text="label"
    outlined
    hide-details="auto"
    :placeholder="placeholder"
  />
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
