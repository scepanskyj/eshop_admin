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
  name: 'PromotionInput',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select promotions'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.PROMOTION_APPLIED;
    }
  }
};
</script>
