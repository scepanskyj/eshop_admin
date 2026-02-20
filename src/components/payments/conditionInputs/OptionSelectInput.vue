<template>
  <v-autocomplete
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :items="options"
    item-value="value"
    item-title="label"
    density="compact"
    variant="outlined"
    hide-details="auto"
    :placeholder="placeholder"
  />
</template>

<script>
import { OPTIONS_BY_TYPE } from '@/utils/conditionConfig';

export default {
  name: 'OptionSelectInput',
  props: {
    modelValue: {
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
