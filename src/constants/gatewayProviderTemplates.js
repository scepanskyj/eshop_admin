/**
 * Default gateway JSON templates per provider. Keys match `gatewayProvider` on payment methods.
 */
export const GATEWAY_PROVIDER_IDS = ['stripe', 'provider_2', 'provider_3'];

export const GATEWAY_PROVIDER_OPTIONS = [
  { value: 'stripe', title: 'Stripe' },
  { value: 'provider_2', title: 'Provider 2' },
  { value: 'provider_3', title: 'Provider 3' }
];

const STRIPE_TEMPLATE = {
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
  checkoutItemTitle: ''
};

export const GATEWAY_PROVIDER_TEMPLATES = {
  stripe: STRIPE_TEMPLATE,
  provider_2: {
    _comment: 'Replace with Provider 2 configuration keys'
  },
  provider_3: {
    _comment: 'Replace with Provider 3 configuration keys'
  }
};

export function stringifyGatewayTemplate(providerId) {
  const obj = GATEWAY_PROVIDER_TEMPLATES[providerId] || {};
  return JSON.stringify(obj, null, 2);
}

export const DEFAULT_GATEWAY_PROVIDER = 'stripe';
