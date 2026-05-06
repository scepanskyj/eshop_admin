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
        item-type="type"
        density="compact"
        variant="outlined"
        hide-details="auto"
        placeholder="Select condition type"
        class="condition-type-autocomplete"
      >
        <template #item="{ props, item }">
          <v-list-item
            v-if="item.raw.type === 'subheader'"
            v-bind="{ ...props, title: null }"
            disabled
            class="condition-type-header"
            style="font-weight: 600; text-transform: small-caps;"
          >
            <span class="condition-type-header-text">{{ item.raw.label }}</span>
          </v-list-item>
          <v-list-item v-else v-bind="{ ...props, title: null }">
            <v-list-item-title>{{ item.raw.label }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-autocomplete>
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
    <IconButton
      @click="$emit('remove')"
      class="remove-btn"
    >
      <v-icon color="red">mdi-trash-can-outline</v-icon>
    </IconButton>
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
import SkuListInput from './conditionInputs/SkuListInput.vue';
import Label from '@/components/common/Label.vue';
import IconButton from '@/components/common/IconButton.vue';

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
  PaymentMethodSelectInput,
  SkuListInput
};

export default {
  name: 'ConditionRow',
  components: {
    Label,
    IconButton,
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
    PaymentMethodSelectInput,
    SkuListInput
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
        props.placeholder = 'Add SKUs (Enter or comma). Suggestions as you type.';
        props.operator = this.condition.operator || '';
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
        updated.value =
          updated.type === 'SELECTED_PAYMENT_METHOD' || updated.type === 'PRODUCT_SKU' ? [] : null;
      } else if (field === 'operator') {
        // Reset value when operator changes; equals_zero requires value 0 for save validation
        if (this.condition.type === 'SELECTED_PAYMENT_METHOD') {
          updated.value = [];
        } else {
          updated.value = value === 'equals_zero' ? 0 : null;
        }
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
  gap: 8px;
  margin-bottom: 0;
}

.condition-field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.condition-value {
  flex: 1.5;
}

.remove-btn {
  margin-top: 24px;
  flex-shrink: 0;
}

.condition-type-header {
  pointer-events: none;
  opacity: 1;
}

.condition-type-header-text {
  display: block;
  flex: 1 1 100%;
  font-weight: 800;
  text-transform: small-caps;
  min-width: 0;
}

/* Single-select: no checkboxes in dropdown list */
.condition-type-autocomplete :deep(.v-list-item__prepend .v-selection-control),
.condition-type-autocomplete :deep(.v-list-item .v-selection-control) {
  display: none;
}
</style>

