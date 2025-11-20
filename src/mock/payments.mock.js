import paymentMethodsSeed, { paymentMethods } from './paymentMethods.seed';

function nowIso(offsetMinutes = 0) {
  const d = new Date(Date.now() - offsetMinutes * 60 * 1000);
  return d.toISOString();
}

// Use new payment methods seed data if available, otherwise fall back to old gateways
export const gateways = (paymentMethods && paymentMethods.length > 0) 
  ? paymentMethods 
  : [
  {
    code: 'cod',
    title: 'Cash on Delivery',
    enabled: true,
    sortOrder: 1,
    language: 'EN',
    paymentAction: 'Authorize & Capture',
    updatedAt: nowIso(40),
    countries: ['GLO'],
    debug: false,
    details: {
      mid: '',
      url: '',
      keysPath: '',
      privateKey: '',
      publicKey: '',
      successUrl: '',
      failUrl: '',
      terminalDomain: '',
      sendCartDescription: false,
      allowPrelive: false,
      externalGuid: '',
      showDescription: true,
      sortOrder: 1
    }
  },
  {
    code: 'bank',
    title: 'Bank Transfer',
    enabled: true,
    sortOrder: 2,
    language: 'EN',
    paymentAction: 'Authorize only',
    updatedAt: nowIso(90),
    countries: ['GLO'],
    debug: false,
    details: {
      mid: '',
      url: '',
      keysPath: '',
      privateKey: '',
      publicKey: '',
      successUrl: '',
      failUrl: '',
      terminalDomain: '',
      sendCartDescription: true,
      allowPrelive: false,
      externalGuid: '',
      showDescription: false,
      sortOrder: 2
    }
  },
  {
    code: 'zero_total',
    title: 'Zero Payment Total',
    enabled: true,
    sortOrder: 3,
    language: 'EN',
    paymentAction: 'Authorize & Capture',
    updatedAt: nowIso(180),
    countries: ['GLO'],
    debug: false,
    details: {
      mid: '',
      url: '',
      keysPath: '',
      privateKey: '',
      publicKey: '',
      successUrl: '',
      failUrl: '',
      terminalDomain: '',
      sendCartDescription: false,
      allowPrelive: false,
      externalGuid: '',
      showDescription: true,
      sortOrder: 3
    }
  },
  {
    code: 'klarna',
    title: 'Klarna Payments',
    enabled: true,
    sortOrder: 4,
    language: 'EN',
    paymentAction: 'Authorize & Capture',
    updatedAt: nowIso(25),
    countries: ['GLO'],
    debug: true,
    details: {
      klarnaApiEndpoint: 'Klarna Payments (Europe)',
      klarnaApiUsername: '',
      klarnaApiPassword: '',
      klarnaMode: 'Playground',
      klarnaLogging: 'Disable',
      klarnaPaymentsEnable: false,
      klarnaPaymentsAllowedCountries: 'All Allowed Countries',
      klarnaPaymentsEnableB2B: false,
      klarnaPaymentsDataSharing: true,
      klarnaPaymentsDataSharingOnLoad: true,
      klarnaMessagingEnable: false,
      klarnaMessagingPlacement: 'cart',
      mid: '',
      url: '',
      keysPath: '',
      privateKey: '',
      publicKey: '',
      successUrl: '',
      failUrl: '',
      terminalDomain: '',
      sendCartDescription: true,
      allowPrelive: false,
      externalGuid: '',
      showDescription: true
    }
  },
  {
    code: 'sporopay',
    title: 'SporoPay Gateway',
    enabled: false,
    sortOrder: 5,
    language: 'SK',
    paymentAction: 'Authorize & Capture',
    updatedAt: nowIso(320),
    countries: ['SK'],
    debug: false,
    details: {
      bankAccountPrefix: '000000',
      bankAccountNumber: '511287879',
      bankCode: '0900',
      constantSymbol: '0308',
      safeKey: '',
      currency: 'EUR',
      paymentTargetUrl: 'MUST_BE_GENERATED',
      paymentReturnUrl: 'MUST_BE_GENERATED',
      debug: false,
      allowedCountries: 'All Allowed Countries',
      specificCountries: [],
      mid: '',
      url: '',
      keysPath: '',
      privateKey: '',
      publicKey: '',
      successUrl: '',
      failUrl: '',
      terminalDomain: '',
      sendCartDescription: false,
      allowPrelive: false,
      externalGuid: '',
      showDescription: true
    }
  },
  {
    code: 'przelewy',
    title: 'Przelewy24',
    enabled: true,
    sortOrder: 6,
    language: 'PL',
    paymentAction: 'Authorize & Capture',
    updatedAt: nowIso(55),
    countries: ['PL'],
    debug: false,
    details: {
      mid: 'prz_merchant',
      url: 'https://api.przelewy24.pl',
      keysPath: '/keys/przelewy',
      privateKey: 'przelewy.key',
      publicKey: 'przelewy.pub',
      successUrl: 'https://shop.example.pl/p24/success',
      failUrl: 'https://shop.example.pl/p24/fail',
      terminalDomain: 'przelewy24.pl',
      sendCartDescription: true,
      allowPrelive: false,
      externalGuid: '',
      showDescription: true
    }
  },
  {
    code: 'paypal',
    title: 'PayPal',
    enabled: true,
    sortOrder: 7,
    language: 'IT',
    paymentAction: 'Authorize & Capture',
    updatedAt: nowIso(12),
    countries: ['IT'],
    debug: false,
    details: {
      mid: 'merchant_pp',
      url: 'https://api.paypal.com',
      keysPath: '/keys/paypal',
      privateKey: 'paypal.key',
      publicKey: 'paypal.pub',
      successUrl: 'https://shop.example.it/pp/success',
      failUrl: 'https://shop.example.it/pp/fail',
      terminalDomain: 'paypal.com',
      sendCartDescription: true,
      allowPrelive: false,
      externalGuid: '',
      showDescription: true
    }
  },
  {
    code: 'stripe',
    title: 'Stripe',
    enabled: true,
    sortOrder: 8,
    language: 'EN',
    paymentAction: 'Authorize & Capture',
    updatedAt: nowIso(15),
    countries: ['GLO'],
    debug: false,
    details: {
      mid: 'live_123',
      url: 'https://api.stripe.com',
      keysPath: '/keys/stripe',
      privateKey: 'stripe.key',
      publicKey: 'stripe.pub',
      successUrl: 'https://shop.example.com/success',
      failUrl: 'https://shop.example.com/fail',
      terminalDomain: 'checkout.stripe.com',
      sendCartDescription: true,
      allowPrelive: false,
      externalGuid: '',
      showDescription: true
    }
  }
];

export const rules = [
  {
    id: 'r-1',
    name: 'High value orders require PayPal',
    active: true,
    storeView: 'Default',
    targetShopTypes: ['B2C'],
    shopType: '1P',
    paymentMethods: ['paypal'],
    description: 'Force PayPal for orders above 500',
    showWhenApplied: true,
    reason: '<p>Risk policy</p>',
    updatedBy: 'system',
    updatedAt: nowIso(30),
    conditions: { operator: 'AND', conditions: [ { field: 'cartTotal', comparator: '>', value: 500 } ] }
  },
  {
    id: 'r-2',
    name: 'Hide COD for international',
    active: true,
    storeView: 'Default',
    targetShopTypes: ['B2C', 'B2B'],
    shopType: '3P',
    paymentMethods: ['cod'],
    description: 'Restrict COD outside SK/CZ',
    showWhenApplied: false,
    reason: '<p>Logistics limitations</p>',
    updatedBy: 'ops',
    updatedAt: nowIso(90),
    conditions: { operator: 'AND', conditions: [ { field: 'country', comparator: 'not in', value: ['SK', 'CZ'] } ] }
  },
  {
    id: 'r-3',
    name: 'B2B prefer Bank',
    active: false,
    storeView: 'Wholesale',
    targetShopTypes: ['B2B'],
    shopType: '1P',
    paymentMethods: ['bank'],
    description: 'Prefer bank transfer for B2B',
    showWhenApplied: false,
    reason: '<p>Finance flow</p>',
    updatedBy: 'finance',
    updatedAt: nowIso(500),
    conditions: { operator: 'OR', conditions: [ { field: 'customerSegment', comparator: '=', value: 'B2B' } ] }
  }
];

export const fee = {
  enabled: true,
  title: 'Payment Processing Fee',
  showDescription: true,
  totalsSortOrder: 100,
  priceType: 'Fixed price',
  minAmount: 0,
  maxAmount: 0,
  refundable: false,
  feeMatrix: [
    { methodCode: 'paypal', amount: 1.99 },
    { methodCode: 'card', amount: 0.99 }
  ],
  segments: [],
  tax: { calculate: false, included: false }
};

export default { gateways, rules, fee };


