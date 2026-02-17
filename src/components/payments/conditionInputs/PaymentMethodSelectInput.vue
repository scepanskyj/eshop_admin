<template>
  <select
    :value="value"
    @change="handleChange"
    class="native-select"
  >
    <option value="">{{ placeholder }}</option>
    <option
      v-for="method in paymentMethods"
      :key="method.value"
      :value="method.value"
    >
      {{ method.text }}
    </option>
  </select>
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
  },
  methods: {
    handleChange(event) {
      const val = event.target.value;
      this.$emit('input', val || null);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.native-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.native-select:hover {
  border-color: rgba(0, 0, 0, 0.6);
}

.native-select:focus {
  outline: none;
  border-color: tokens.$color-green;
  border-width: 2px;
  padding: 7px 11px;
}

.native-select option {
  padding: 6px;
  font-size: 13px;
}
</style>
