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
  name: 'ProductFlagsInput',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select product flags'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.PRODUCT_FLAGS_COMBINATION;
    }
  }
};
</script>
