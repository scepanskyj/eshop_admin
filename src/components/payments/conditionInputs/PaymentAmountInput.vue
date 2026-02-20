<template>
  <div>
    <v-text-field
      v-if="operator === 'between'"
      :model-value="modelValue && modelValue.min"
      @update:model-value="updateBetweenValue('min', $event)"
      type="number"
      density="compact"
      variant="outlined"
      hide-details="auto"
      placeholder="Min amount"
      class="mb-2"
    />
    <v-text-field
      v-if="operator === 'between'"
      :model-value="modelValue && modelValue.max"
      @update:model-value="updateBetweenValue('max', $event)"
      type="number"
      density="compact"
      variant="outlined"
      hide-details="auto"
      placeholder="Max amount"
    />
    <v-text-field
      v-else-if="operator === 'equals_zero'"
      :model-value="0"
      disabled
      density="compact"
      variant="outlined"
      hide-details="auto"
      placeholder="0"
    />
    <v-text-field
      v-else
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event ? parseFloat($event) : null)"
      type="number"
      density="compact"
      variant="outlined"
      hide-details="auto"
      :placeholder="placeholder"
    />
  </div>
</template>

<script>
export default {
  name: 'PaymentAmountInput',
  props: {
    modelValue: {
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
        ...(this.modelValue || {}),
        [key]: val ? parseFloat(val) : null
      };
      this.$emit('update:modelValue', newValue);
    }
  }
};
</script>
