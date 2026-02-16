<template>
  <div class="condition-row">
    <div class="condition-field">
      <div class="control-label">Condition Type</div>
      <select
        :value="condition.type"
        @change="updateCondition('type', $event.target.value)"
        class="native-select"
      >
        <option value="">Select condition type</option>
        <optgroup
          v-for="group in conditionTypeGroups"
          :key="group.id"
          :label="group.label"
        >
          <option
            v-for="type in group.types"
            :key="type.value"
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </optgroup>
      </select>
    </div>
    <div class="condition-field" v-if="condition.type">
      <div class="control-label">Operator</div>
      <select
        :value="condition.operator"
        @change="updateCondition('operator', $event.target.value)"
        class="native-select"
      >
        <option value="">Select operator</option>
        <option
          v-for="op in availableOperators"
          :key="op.value"
          :value="op.value"
        >
          {{ op.label }}
        </option>
      </select>
    </div>
    <div class="condition-field condition-value" v-if="condition.type && condition.operator">
      <div class="control-label">Value</div>
      <component
        :is="valueInputComponent"
        :value="condition.value"
        :operator="condition.operator"
        v-bind="valueInputProps"
        @input="updateCondition('value', $event)"
      />
    </div>
    <v-btn
      icon
      @click="$emit('remove')"
      class="remove-btn"
    >
      <v-icon color="red">mdi-close</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { getConditionTypesByCategory, getOperatorsForType, getValueInputForType } from '@/utils/conditionConfig';
import ShippingMethodInput from './conditionInputs/ShippingMethodInput.vue';
import GiftCardInput from './conditionInputs/GiftCardInput.vue';
import PaymentAmountInput from './conditionInputs/PaymentAmountInput.vue';
import ProductTypeInput from './conditionInputs/ProductTypeInput.vue';
import OrderTypeInput from './conditionInputs/OrderTypeInput.vue';
import CustomerTypeInput from './conditionInputs/CustomerTypeInput.vue';
import MarketInput from './conditionInputs/MarketInput.vue';
import PromotionInput from './conditionInputs/PromotionInput.vue';
import ProductFlagsInput from './conditionInputs/ProductFlagsInput.vue';
import OptionSelectInput from './conditionInputs/OptionSelectInput.vue';
import TextInput from './conditionInputs/TextInput.vue';
import PaymentMethodSelectInput from './conditionInputs/PaymentMethodSelectInput.vue';

const COMPONENT_MAP = {
  ShippingMethodInput,
  GiftCardInput,
  PaymentAmountInput,
  ProductTypeInput,
  OrderTypeInput,
  CustomerTypeInput,
  MarketInput,
  PromotionInput,
  ProductFlagsInput,
  OptionSelectInput,
  TextInput,
  PaymentMethodSelectInput
};

export default {
  name: 'ConditionRow',
  components: {
    ShippingMethodInput,
    GiftCardInput,
    PaymentAmountInput,
    ProductTypeInput,
    OrderTypeInput,
    CustomerTypeInput,
    MarketInput,
    PromotionInput,
    ProductFlagsInput,
    OptionSelectInput,
    TextInput,
    PaymentMethodSelectInput
  },
  props: {
    condition: {
      type: Object,
      required: true
    }
  },
  computed: {
    conditionTypeGroups() {
      return getConditionTypesByCategory();
    },
    availableOperators() {
      if (!this.condition.type) return [];
      return getOperatorsForType(this.condition.type);
    },
    valueInputComponent() {
      if (!this.condition.type) return null;
      const componentName = getValueInputForType(this.condition.type);
      return componentName ? COMPONENT_MAP[componentName] : null;
    },
    valueInputProps() {
      const props = { placeholder: 'Select option' };
      if (this.condition.type === 'PRODUCT_SKU') {
        props.placeholder = 'Enter SKU';
      }
      const needsOptionKey = ['ORDER_FLOW', 'CUSTOMER_BLACKLIST', 'FEATURE_FLAG', 'PRODUCT_TYPE', 'PRODUCT_CATEGORY'];
      if (needsOptionKey.includes(this.condition.type)) {
        props.optionKey = this.condition.type;
      }
      return props;
    }
  },
  methods: {
    updateCondition(field, value) {
      const updated = { ...this.condition };
      updated[field] = value;
      
      // Reset dependent fields when type or operator changes
      if (field === 'type') {
        updated.operator = '';
        updated.value = null;
      } else if (field === 'operator') {
        // Reset value when operator changes (especially for between operator)
        updated.value = null;
      }
      
      this.$emit('update', updated);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.condition-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.condition-field {
  flex: 1;
  min-width: 0;
}

.condition-value {
  flex: 1.5;
}

.control-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 6px;
}

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

.remove-btn {
  margin-top: 28px;
  flex-shrink: 0;
}
</style>
