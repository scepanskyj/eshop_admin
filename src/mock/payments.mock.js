import paymentMethodsSeed, { paymentMethods } from './paymentMethods.seed';

function nowIso(offsetMinutes = 0) {
  const d = new Date(Date.now() - offsetMinutes * 60 * 1000);
  return d.toISOString();
}

// Gateways are separate entities - only Stripe for now
const gatewaysSeed = [
  {
    code: 'stripe',
    title: 'Stripe',
    enabled: true,
    sortOrder: 1,
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

// Payment methods use paymentMethods seed data
// Gateways are separate entities - only Stripe for now
export const gateways = (paymentMethods && paymentMethods.length > 0) 
  ? paymentMethods  // Payment methods use this (for backward compatibility)
  : gatewaysSeed;   // Fallback

// Separate export for gateways only (used by GatewaysList)
export const gatewaysOnly = gatewaysSeed;

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


