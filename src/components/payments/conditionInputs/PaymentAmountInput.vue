<template>
  <div>
    <v-text-field
      v-if="operator === 'between'"
      :value="value && value.min"
      @input="updateBetweenValue('min', $event)"
      type="number"
      outlined
      hide-details="auto"
      placeholder="Min amount"
      class="mb-2"
    />
    <v-text-field
      v-if="operator === 'between'"
      :value="value && value.max"
      @input="updateBetweenValue('max', $event)"
      type="number"
      outlined
      hide-details="auto"
      placeholder="Max amount"
    />
    <v-text-field
      v-else-if="operator === 'equals_zero'"
      :value="0"
      disabled
      outlined
      hide-details="auto"
      placeholder="0"
    />
    <v-text-field
      v-else
      :value="value"
      @input="$emit('input', $event ? parseFloat($event) : null)"
      type="number"
      outlined
      hide-details="auto"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
export default {
  name: 'PaymentAmountInput',
  props: {
    value: {
      type: [Number, Object],
      default: null
    },
    operator: {
      type: String,
      default: 'is'
    },
    placeholder: {
      type: String,
      default: 'Enter amount'
    }
  },
  methods: {
    updateBetweenValue(key, val) {
      const newValue = {
        ...(this.value || {}),
        [key]: val ? parseFloat(val) : null
      };
      this.$emit('input', newValue);
    }
  }
};
</script>
