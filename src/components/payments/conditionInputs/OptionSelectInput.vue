<template>
  <v-autocomplete
    :value="value"
    @input="$emit('input', $event)"
    :items="options"
    item-value="value"
    item-text="label"
    dense
    outlined
    hide-details="auto"
    :placeholder="placeholder"
    clearable
  />
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
    }
  }
};
</script>
