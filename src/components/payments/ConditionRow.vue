<template>
  <div class="condition-row">
    <div class="condition-field">
      <Label>Condition Type</Label>
      <v-autocomplete
        :model-value="condition.type"
        @update:model-value="updateCondition('type', $event)"
        :items="conditionTypeItems"
        item-value="value"
        item-title="label"
        density="compact"
        variant="outlined"
        hide-details="auto"
        placeholder="Select condition type"
        clearable
      />
    </div>
    <div class="condition-field" v-if="condition.type">
      <Label>Operator</Label>
      <v-autocomplete
        :model-value="condition.operator"
        @update:model-value="updateCondition('operator', $event)"
        :items="availableOperators"
        item-value="value"
        item-title="label"
        density="compact"
        variant="outlined"
        hide-details="auto"
        placeholder="Select operator"
        clearable
      />
    </div>
    <div class="condition-field condition-value" v-if="condition.type && condition.operator">
      <Label>Value</Label>
      <component
        :is="valueInputComponent"
        :model-value="condition.value"
        :operator="condition.operator"
        v-bind="valueInputProps"
        @update:model-value="updateCondition('value', $event)"
      />
    </div>
    <v-btn
      icon
      @click="$emit('remove')"
      class="remove-btn"
    >
      <v-icon color="red">mdi-trash-can-outline</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { getConditionTypesForAutocomplete, getOperatorsForType, getValueInputForType } from '@/utils/conditionConfig';
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
import Label from '@/components/common/Label.vue';

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
    Label,
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
  emits: ['update', 'remove'],
  computed: {
    conditionTypeItems() {
      return getConditionTypesForAutocomplete();
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
        // Reset value when operator changes; equals_zero requires value 0 for save validation
        updated.value = value === 'equals_zero' ? 0 : null;
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
  margin-bottom: tokens.$space-sm;
}

.condition-field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.condition-value {
  flex: 1.5;
}

.remove-btn {
  margin-top: 28px;
  flex-shrink: 0;
}
</style>
