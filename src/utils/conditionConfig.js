/**
 * Configuration for condition types, operators, and value options
 */

export const CONDITION_TYPE_CATEGORIES = [
  { id: 'order', label: 'Order' },
  { id: 'payment', label: 'Payment' },
  { id: 'product', label: 'Product' },
  { id: 'shipping', label: 'Shipping & Delivery' },
  { id: 'customer', label: 'Customer' },
  { id: 'cart', label: 'Cart & Promotions' },
  { id: 'system', label: 'System' }
];

export const CONDITION_TYPES = [
  { value: 'ORDER_TYPE', label: 'Order type', category: 'order' },
  { value: 'ORDER_FLOW', label: 'Order flow', category: 'order' },
  { value: 'PAYMENT_AMOUNT', label: 'Payment amount', category: 'payment' },
  { value: 'SELECTED_PAYMENT_METHOD', label: 'Selected payment method', category: 'payment' },
  { value: 'PRODUCT_TYPE', label: 'Product type', category: 'product' },
  { value: 'PRODUCT_SKU', label: 'Product SKU', category: 'product' },
  { value: 'PRODUCT_FLAGS_COMBINATION', label: 'Product flags', category: 'product' },
  { value: 'PRODUCT_CATEGORY', label: 'Product category/attribute', category: 'product' },
  { value: 'SHIPPING_METHOD', label: 'Shipping method', category: 'shipping' },
  { value: 'CUSTOMER_TYPE', label: 'Customer type', category: 'customer' },
  { value: 'CUSTOMER_BLACKLIST', label: 'Customer blacklist', category: 'customer' },
  { value: 'GIFT_CARD_APPLIED', label: 'Gift card applied', category: 'cart' },
  { value: 'PROMOTION_APPLIED', label: 'Promotion applied', category: 'cart' },
  { value: 'MARKET', label: 'Country / Market', category: 'system' },
  { value: 'FEATURE_FLAG', label: 'Feature flag', category: 'system' }
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
  ],
  ORDER_FLOW: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  PRODUCT_SKU: [
    { value: 'includes', label: 'includes' },
    { value: 'excludes', label: 'excludes' },
    { value: 'equals', label: 'equals' }
  ],
  PRODUCT_CATEGORY: [
    { value: 'includes', label: 'includes' },
    { value: 'excludes', label: 'excludes' }
  ],
  CUSTOMER_BLACKLIST: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  SELECTED_PAYMENT_METHOD: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ],
  FEATURE_FLAG: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' }
  ]
};

export const VALUE_INPUTS_BY_TYPE = {
  SHIPPING_METHOD: 'ShippingMethodInput',
  GIFT_CARD_APPLIED: 'GiftCardInput',
  PAYMENT_AMOUNT: 'PaymentAmountInput',
  PRODUCT_TYPE: 'ProductTypeInput',
  ORDER_TYPE: 'OrderTypeInput',
  ORDER_FLOW: 'OptionSelectInput',
  CUSTOMER_TYPE: 'CustomerTypeInput',
  MARKET: 'MarketInput',
  PROMOTION_APPLIED: 'PromotionInput',
  PRODUCT_FLAGS_COMBINATION: 'ProductFlagsInput',
  PRODUCT_SKU: 'TextInput',
  PRODUCT_CATEGORY: 'ProductTypeInput',
  CUSTOMER_BLACKLIST: 'OptionSelectInput',
  SELECTED_PAYMENT_METHOD: 'PaymentMethodSelectInput',
  FEATURE_FLAG: 'OptionSelectInput'
};

export const OPTIONS_BY_TYPE = {
  SHIPPING_METHOD: [
    { value: 'click_collect', label: 'Click & Collect' },
    { value: 'courier', label: 'Courier' },
    { value: 'dobirka', label: 'Dobírka' },
    { value: 'zasilkovna', label: 'Zásilkovna' },
    { value: 'post', label: 'Post' },
    { value: 'express', label: 'Express' },
    { value: 'home_delivery_pharmacy', label: 'Home Delivery via Pharmacy / HD' },
    { value: 'box_pickup', label: 'BOX / pickup locker' },
    { value: 'babybox', label: 'Babybox' },
    { value: 'express_pharmacy', label: 'Express delivery to pharmacy / MaxDrive / Innoship' },
    { value: 'pickup_point', label: 'Pickup point' },
    { value: 'quick_commerce', label: 'Quick commerce' }
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
    { value: 'rx', label: 'Rx' },
    { value: 'gift_voucher', label: 'Gift voucher' },
    { value: 'marketplace_2p', label: 'Marketplace 2P+' }
  ],
  ORDER_TYPE: [
    { value: 'reservation', label: 'Reservation' },
    { value: 'reservation_pharmacy', label: 'Reservation in pharmacy (one common map)' },
    { value: 'pickup_reservation_pharmacy', label: 'Pickup reservation at pharmacy' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'marketplace_mix', label: 'MarketplaceMix (1P + marketplace)' },
    { value: 'marketplace_present', label: 'Marketplace present' },
    { value: 'crossborder', label: 'Crossborder' },
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
    { value: 'controlled', label: 'Controlled' },
    { value: 'excluded_from_cc', label: 'Excluded from C&C' }
  ],
  ORDER_FLOW: [
    { value: 'pay_in_pharmacy', label: 'Pay in pharmacy' },
    { value: 'standard', label: 'Standard checkout' }
  ],
  PRODUCT_CATEGORY: [
    { value: 'cbd', label: 'CBD' },
    { value: 'viagra', label: 'Viagra' },
    { value: 'otc', label: 'OTC' },
    { value: 'rx', label: 'Rx' }
  ],
  CUSTOMER_BLACKLIST: [
    { value: true, label: 'In blacklist' },
    { value: false, label: 'Not in blacklist' }
  ],
  FEATURE_FLAG: [
    { value: 'hotfix_enabled', label: 'HOTFIX enabled' }
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

/**
 * Get condition types grouped by category for optgroup display
 */
export function getConditionTypesByCategory() {
  return CONDITION_TYPE_CATEGORIES.map(cat => ({
    ...cat,
    types: CONDITION_TYPES.filter(t => t.category === cat.id)
  })).filter(g => g.types.length > 0);
}

/**
 * Get all condition types as flat list for autocomplete
 */
export function getConditionTypesFlat() {
  return CONDITION_TYPES.map(t => ({ value: t.value, label: t.label }));
}

/**
 * Get condition types for autocomplete with category headers (Product, Order, etc.)
 * Returns flat list: subheader items use type: 'subheader' for Vuetify's native subheader slot (no duplication).
 */
export function getConditionTypesForAutocomplete() {
  const result = [];
  for (const cat of CONDITION_TYPE_CATEGORIES) {
    const types = CONDITION_TYPES.filter(t => t.category === cat.id);
    if (types.length === 0) continue;
    result.push({ type: 'subheader', label: cat.label });
    result.push(...types.map(t => ({ value: t.value, label: t.label })));
  }
  return result;
}
