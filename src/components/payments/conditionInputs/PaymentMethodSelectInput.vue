<template>
  <v-autocomplete
    :value="value"
    @input="$emit('input', $event)"
    :items="paymentMethods"
    item-value="value"
    item-text="text"
    dense
    outlined
    hide-details="auto"
    :placeholder="placeholder"
    clearable
  />
</template>

<script>
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';

export default {
  name: 'PaymentMethodSelectInput',
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: 'Select payment method'
    }
  },
  computed: {
    paymentMethods() {
      const currentTenant = tenantStore.state.current;
      return (store.state.gateways || [])
        .filter(g => g && (g.countries || []).includes(currentTenant))
        .map(g => ({ text: g.title || g.code, value: g.code }));
    }
  }
};
</script>
