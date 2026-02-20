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
  name: 'CustomerTypeInput',
  props: {
    modelValue: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Select customer type'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.CUSTOMER_TYPE;
    }
  }
};
</script>
