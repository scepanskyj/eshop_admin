/**
 * Example rule presets per country - based on current Magento restrictions
 * Gateway codes match paymentMethods.seed.js per country
 */
import { createCondition, createConditionGroup } from '@/utils/paymentRestrictionTypes';

function buildPreset({ name, description, paymentMethods, groups }) {
  return {
    name,
    description,
    paymentMethods,
    groups: groups.map(g => ({
      ...createConditionGroup(),
      conditions: g.conditions.map(c => ({
        ...createCondition(c.type),
        operator: c.operator,
        value: c.value
      }))
    }))
  };
}

/** Romania (RO) presets */
const RO_PRESETS = [
  buildPreset({
    name: 'COD not allowed when cart has OTC',
    description: 'If product type is OTC, then block cash on delivery',
    paymentMethods: ['ro_cod'],
    groups: [{
      conditions: [
        { ...createCondition('PRODUCT_TYPE'), operator: 'includes', value: ['otc'] }
      ]
    }]
  }),
  buildPreset({
    name: 'COD max order value 1600 RON',
    description: 'If order total is above 1600 RON, then block cash on delivery',
    paymentMethods: ['ro_cod'],
    groups: [{
      conditions: [
        { ...createCondition('PAYMENT_AMOUNT'), operator: 'above', value: 1600 }
      ]
    }]
  }),
  buildPreset({
    name: 'Pay in pharmacy only for pharmacy delivery (HD)',
    description: 'If shipping type is not Home Delivery via Pharmacy, then block pay in pharmacy',
    paymentMethods: ['ro_pharmacy'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'is_not', value: 'home_delivery_pharmacy' }
      ]
    }]
  }),
  buildPreset({
    name: 'No COD for Click & Collect',
    description: 'If shipping method is Click & Collect, then block cash on delivery',
    paymentMethods: ['ro_cod'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['click_collect'] }
      ]
    }]
  }),
  buildPreset({
    name: 'No card payment for reservations',
    description: 'If order type is Reservation, then block card payment',
    paymentMethods: ['ro_card'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'reservation' }
      ]
    }]
  }),
  buildPreset({
    name: 'No COD for courier reservations',
    description: 'If order type is Reservation and delivery is Courier, then block COD',
    paymentMethods: ['ro_cod'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'reservation' },
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['courier'] }
      ]
    }]
  }),
  buildPreset({
    name: 'Pay in pharmacy only for C&C when value above 50',
    description: 'Block pay in pharmacy when shipping is not C&C or order is under 50 RON',
    paymentMethods: ['ro_pharmacy'],
    groups: [
      { conditions: [{ ...createCondition('SHIPPING_METHOD'), operator: 'is_not', value: 'click_collect' }] },
      { conditions: [{ ...createCondition('PAYMENT_AMOUNT'), operator: 'under', value: 50 }] }
    ]
  })
];

/** Czechia (CZ) presets */
const CZ_PRESETS = [
  buildPreset({
    name: 'All online methods disabled for Click & Collect',
    description: 'If shipping method is Click & Collect, block online payments and COD',
    paymentMethods: ['cz_pluxee', 'cz_cod', 'cz_benefit', 'cz_card', 'cz_edenred_account', 'cz_edenred_card'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['click_collect'] }
      ]
    }]
  }),
  buildPreset({
    name: 'Pay in pharmacy shown only for C&C',
    description: 'If shipping method is not Click & Collect, then block pay in pharmacy',
    paymentMethods: ['cz_pharmacy'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'is_not', value: 'click_collect' }
      ]
    }]
  }),
  buildPreset({
    name: 'COD disabled for BOX pickup',
    description: 'If shipping method is BOX / pickup locker, then block COD',
    paymentMethods: ['cz_cod'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['box_pickup'] }
      ]
    }]
  }),
  buildPreset({
    name: 'C&C restricted for discontinued/blocked products',
    description: 'If shipping is Click & Collect and cart has product flag excluded from C&C',
    paymentMethods: ['cz_pharmacy'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['click_collect'] },
        { ...createCondition('PRODUCT_FLAGS_COMBINATION'), operator: 'includes', value: ['excluded_from_cc'] }
      ]
    }]
  }),
  buildPreset({
    name: 'Benefit/Edenred not allowed to buy gift voucher',
    description: 'If product type is Gift voucher, block benefit methods',
    paymentMethods: ['cz_card', 'cz_benefit', 'cz_pharmacy', 'cz_cod', 'cz_edenred_account', 'cz_edenred_card', 'cz_pluxee'],
    groups: [{
      conditions: [
        { ...createCondition('PRODUCT_TYPE'), operator: 'includes', value: ['gift_voucher'] }
      ]
    }]
  }),
  buildPreset({
    name: 'Benefit/Edenred not allowed when order total = 0',
    description: 'If order total is 0 (doplatek 0 Kč), block benefit methods',
    paymentMethods: ['cz_card', 'cz_benefit', 'cz_pharmacy', 'cz_cod', 'cz_pluxee', 'cz_edenred_account', 'cz_edenred_card'],
    groups: [{
      conditions: [
        { ...createCondition('PAYMENT_AMOUNT'), operator: 'equals_zero', value: 0 }
      ]
    }]
  })
];

/** Slovakia (SK) presets */
const SK_PRESETS = [
  buildPreset({
    name: 'Block Pay in Pharmacy above 200 €',
    description: 'If order total is above 200 EUR, then block pay in pharmacy',
    paymentMethods: ['sk_pharmacy'],
    groups: [{
      conditions: [
        { ...createCondition('PAYMENT_AMOUNT'), operator: 'above', value: 200 }
      ]
    }]
  }),
  buildPreset({
    name: 'Block COD above 200 €',
    description: 'If order total is above 200 EUR, then block COD',
    paymentMethods: ['sk_cod'],
    groups: [{
      conditions: [
        { ...createCondition('PAYMENT_AMOUNT'), operator: 'above', value: 200 }
      ]
    }]
  }),
  buildPreset({
    name: 'No bank transfer for pharmacy reservation',
    description: 'If order type is Reservation in pharmacy, then block bank transfer',
    paymentMethods: ['sk_bank'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'reservation_pharmacy' }
      ]
    }]
  }),
  buildPreset({
    name: 'No Benefit Plus for reservation',
    description: 'If order type = Reservation in pharmacy, then block Benefit Plus',
    paymentMethods: ['sk_benefit'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'reservation_pharmacy' }
      ]
    }]
  }),
  buildPreset({
    name: 'No online card payments for pickup reservation',
    description: 'If order type is Pickup reservation at pharmacy, block card payments',
    paymentMethods: ['sk_card_apple_google', 'sk_vub', 'sk_sporopay'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'pickup_reservation_pharmacy' }
      ]
    }]
  }),
  buildPreset({
    name: 'Marketplace mixed basket: disable selected gateways',
    description: 'If marketplace order is mixed (1P + marketplace), block selected gateways',
    paymentMethods: ['sk_vub', 'sk_sporopay', 'sk_benefit'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'marketplace_mix' }
      ]
    }]
  }),
  buildPreset({
    name: 'Marketplace: disable bank transfer',
    description: 'If marketplace order is present, block bank transfer',
    paymentMethods: ['sk_bank'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'marketplace_present' }
      ]
    }]
  }),
  buildPreset({
    name: 'Babybox restrictions',
    description: 'If shipping method is Babybox, block selected payments',
    paymentMethods: ['sk_sporopay', 'sk_cod', 'sk_vub'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['babybox'] }
      ]
    }]
  }),
  buildPreset({
    name: 'Express delivery restrictions',
    description: 'If shipping is Express to pharmacy, block pay in pharmacy and COD',
    paymentMethods: ['sk_pharmacy', 'sk_cod'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['express_pharmacy'] }
      ]
    }]
  })
];

/** Italy (IT) presets */
const IT_PRESETS = [
  buildPreset({
    name: 'No COD for Click & Collect / pickup points',
    description: 'If shipping method is Click & Collect or pickup point, then block cash on delivery',
    paymentMethods: ['it_cod'],
    groups: [
      { conditions: [{ ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['click_collect'] }] },
      { conditions: [{ ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['pickup_point'] }] }
    ]
  }),
  buildPreset({
    name: 'Payment in pharmacy (Pay in store)',
    description: 'If shipping method is not Click & Collect or reservation, then block pay in pharmacy',
    paymentMethods: ['it_pharmacy'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'is_not', value: 'click_collect' }
      ]
    }]
  }),
  buildPreset({
    name: 'Reservations: no online payment methods',
    description: 'If order type = Reservation, block online payments (keep pay in pharmacy only)',
    paymentMethods: ['it_card_apple_google', 'it_satispay', 'it_paypal', 'it_klarna'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'reservation' }
      ]
    }]
  }),
  buildPreset({
    name: 'Reservations: no COD',
    description: 'If order type = Reservation, then block cash on delivery',
    paymentMethods: ['it_cod'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'reservation' }
      ]
    }]
  }),
  buildPreset({
    name: 'CBD products: PayPal not allowed',
    description: 'If product type is CBD, then block PayPal',
    paymentMethods: ['it_paypal'],
    groups: [{
      conditions: [
        { ...createCondition('PRODUCT_TYPE'), operator: 'includes', value: ['cbd'] }
      ]
    }]
  }),
  buildPreset({
    name: 'Quick commerce: restrict to COD only',
    description: 'If shipping type is Quick commerce, block all except COD',
    paymentMethods: ['it_pharmacy', 'it_card_apple_google', 'it_satispay', 'it_paypal', 'it_klarna'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['quick_commerce'] }
      ]
    }]
  }),
  buildPreset({
    name: 'Quick commerce: disable pay-in-pharmacy',
    description: 'If shipping type is Quick commerce, then block pay in pharmacy',
    paymentMethods: ['it_pharmacy'],
    groups: [{
      conditions: [
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['quick_commerce'] }
      ]
    }]
  })
];

/** Poland (PL) presets */
const PL_PRESETS = [
  buildPreset({
    name: '[Marketplace] Products 2P+ cannot use online payments',
    description: 'If cart contains marketplace product type 2P+, block online payments',
    paymentMethods: ['pl_card_blik', 'pl_przelewy24'],
    groups: [{
      conditions: [
        { ...createCondition('PRODUCT_TYPE'), operator: 'includes', value: ['marketplace_2p'] }
      ]
    }]
  }),
  buildPreset({
    name: '[Marketplace] Stripe not allowed for CBD or Viagra',
    description: 'If cart contains CBD or Viagra, block card payment',
    paymentMethods: ['pl_card_blik'],
    groups: [{
      conditions: [
        { ...createCondition('PRODUCT_TYPE'), operator: 'includes', value: ['cbd'] }
      ]
    }]
  }),
  buildPreset({
    name: '[Marketplace] COD not available for marketplace',
    description: 'If marketplace is present (1P or 2P), block COD',
    paymentMethods: ['pl_cod'],
    groups: [{
      conditions: [
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'marketplace_present' }
      ]
    }]
  })
];

/** Presets by country code */
export const PRESETS_BY_COUNTRY = {
  RO: RO_PRESETS,
  CZ: CZ_PRESETS,
  SK: SK_PRESETS,
  PL: PL_PRESETS,
  IT: IT_PRESETS,
  RS: []
};

/** Get presets for a country; fallback to empty if none */
export function getPresetsForCountry(countryCode) {
  return PRESETS_BY_COUNTRY[countryCode] || [];
}
