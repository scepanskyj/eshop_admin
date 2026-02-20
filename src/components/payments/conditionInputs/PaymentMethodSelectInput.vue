<template>
  <v-autocomplete
    :model-value="normalizedValue"
    @update:model-value="onInput"
    :items="paymentMethods"
    item-value="value"
    item-title="text"
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
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';

export default {
  name: 'PaymentMethodSelectInput',
  props: {
    modelValue: {
      type: [String, Array],
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Select payment methods'
    }
  },
  computed: {
    normalizedValue() {
      const v = this.modelValue;
      if (Array.isArray(v)) return v;
      if (v === null || v === undefined || v === '') return [];
      return [v];
    },
    paymentMethods() {
      const currentTenant = tenantStore.state.current;
      return (store.state.gateways || [])
        .filter(g => g && (g.countries || []).includes(currentTenant))
        .map(g => ({ text: g.title || g.code, value: g.code }));
    }
  },
  methods: {
    onInput(val) {
      this.$emit('update:modelValue', Array.isArray(val) ? val : (val ? [val] : []));
    }
  }
};
</script>
