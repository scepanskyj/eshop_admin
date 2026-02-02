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
  name: 'GiftCardInput',
  props: {
    value: {
      type: [Boolean, String, Number],
      default: null
    },
    placeholder: {
      type: String,
      default: 'Select option'
    }
  },
  computed: {
    options() {
      return OPTIONS_BY_TYPE.GIFT_CARD_APPLIED;
    }
  }
};
</script>
