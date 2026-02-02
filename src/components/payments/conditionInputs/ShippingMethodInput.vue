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
  name: 'ShippingMethodInput',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select shipping methods'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.SHIPPING_METHOD;
    }
  }
};
</script>
