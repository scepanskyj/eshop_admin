/**
 * Configuration for condition types, operators, and value options
 */

export const CONDITION_TYPES = [
  { value: 'SHIPPING_METHOD', label: 'Shipping method' },
  { value: 'GIFT_CARD_APPLIED', label: 'Gift Card applied' },
  { value: 'PAYMENT_AMOUNT', label: 'Payment amount' },
  { value: 'PRODUCT_TYPE', label: 'Product type' },
  { value: 'ORDER_TYPE', label: 'Order type' },
  { value: 'CUSTOMER_TYPE', label: 'Customer type' },
  { value: 'MARKET', label: 'Market' },
  { value: 'PROMOTION_APPLIED', label: 'Promotion applied' },
  { value: 'PRODUCT_FLAGS_COMBINATION', label: 'Product flags combination' }
];

export const OPERATORS_BY_TYPE = {
  SHIPPING_METHOD: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'includes', label: 'includes' }
  ],
  GIFT_CARD_APPLIED: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  PAYMENT_AMOUNT: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
    { value: 'equals_zero', label: '= 0' },
    { value: 'above', label: 'above' },
    { value: 'under', label: 'under' },
    { value: 'between', label: 'between' }
  ],
  PRODUCT_TYPE: [
    { value: 'includes', label: 'includes' },
    { value: 'excludes', label: 'excludes' }
  ],
  ORDER_TYPE: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  CUSTOMER_TYPE: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  MARKET: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  PROMOTION_APPLIED: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  PRODUCT_FLAGS_COMBINATION: [
    { value: 'includes', label: 'includes' },
    { value: 'excludes', label: 'excludes' }
  ]
};

export const VALUE_INPUTS_BY_TYPE = {
  SHIPPING_METHOD: 'ShippingMethodInput',
  GIFT_CARD_APPLIED: 'GiftCardInput',
  PAYMENT_AMOUNT: 'PaymentAmountInput',
  PRODUCT_TYPE: 'ProductTypeInput',
  ORDER_TYPE: 'OrderTypeInput',
  CUSTOMER_TYPE: 'CustomerTypeInput',
  MARKET: 'MarketInput',
  PROMOTION_APPLIED: 'PromotionInput',
  PRODUCT_FLAGS_COMBINATION: 'ProductFlagsInput'
};

export const OPTIONS_BY_TYPE = {
  SHIPPING_METHOD: [
    { value: 'click_collect', label: 'Click & Collect' },
    { value: 'courier', label: 'Courier' },
    { value: 'dobirka', label: 'Dobírka' },
    { value: 'zasilkovna', label: 'Zásilkovna' },
    { value: 'post', label: 'Post' },
    { value: 'express', label: 'Express' }
  ],
  GIFT_CARD_APPLIED: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ],
  PRODUCT_TYPE: [
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'otc', label: 'OTC' },
    { value: 'cbd', label: 'CBD' },
    { value: 'viagra', label: 'Viagra' },
    { value: 'hazardous', label: 'Hazardous' },
    { value: 'only_benefity', label: 'Only Benefity' },
    { value: 'rx', label: 'Rx' }
  ],
  ORDER_TYPE: [
    { value: 'reservation', label: 'Reservation' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'crossborder', label: 'Crossborder' },
    { value: 'marketplace_mix', label: 'MarketplaceMix' },
    { value: 'standard', label: 'Standard' }
  ],
  CUSTOMER_TYPE: [
    { value: 'guest', label: 'Guest' },
    { value: 'logged_in', label: 'Logged-in' }
  ],
  MARKET: [
    { value: 'CZ', label: 'Czechia (CZ)' },
    { value: 'SK', label: 'Slovakia (SK)' },
    { value: 'PL', label: 'Poland (PL)' },
    { value: 'IT', label: 'Italy (IT)' },
    { value: 'RO', label: 'Romania (RO)' },
    { value: 'RS', label: 'Serbia (RS)' },
    { value: 'AT', label: 'Austria (AT)' },
    { value: 'DE', label: 'Germany (DE)' },
    { value: 'HU', label: 'Hungary (HU)' },
    { value: 'GB', label: 'United Kingdom (GB)' },
    { value: 'US', label: 'United States (US)' }
  ],
  PROMOTION_APPLIED: [
    { value: 'voucher_applied', label: 'Voucher applied' },
    { value: 'gift_card_applied', label: 'Gift Card applied' },
    { value: '100_percent_coupon', label: '100% coupon' },
    { value: 'cashback', label: 'Cashback' },
    { value: 'free_shipping', label: 'Free shipping' }
  ],
  PRODUCT_FLAGS_COMBINATION: [
    { value: 'rx', label: 'Rx' },
    { value: 'otc', label: 'OTC' },
    { value: 'hazardous', label: 'Hazardous' },
    { value: 'cbd', label: 'CBD' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'controlled', label: 'Controlled' }
  ]
};

/**
 * Get operators for a condition type
 */
export function getOperatorsForType(type) {
  return OPERATORS_BY_TYPE[type] || [];
}

/**
 * Get value input component name for a condition type
 */
export function getValueInputForType(type) {
  return VALUE_INPUTS_BY_TYPE[type] || null;
}

/**
 * Get options for a condition type
 */
export function getOptionsForType(type) {
  return OPTIONS_BY_TYPE[type] || [];
}

/**
 * Get condition type label
 */
export function getConditionTypeLabel(type) {
  const found = CONDITION_TYPES.find(t => t.value === type);
  return found ? found.label : type;
}

/**
 * Get operator label
 */
export function getOperatorLabel(type, operator) {
  const operators = getOperatorsForType(type);
  const found = operators.find(op => op.value === operator);
  return found ? found.label : operator;
}
