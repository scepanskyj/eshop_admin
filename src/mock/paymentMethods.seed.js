import { getCurrencyForCountry } from '@/utils/currencies';

function nowIso(offsetMinutes = 0) {
  const d = new Date(Date.now() - offsetMinutes * 60 * 1000);
  return d.toISOString();
}

const DETAIL_DEFAULTS = {
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
  externalGuid: ''
};

function createPaymentMethod(code, title, countryCode, options = {}) {
  const currency = getCurrencyForCountry(countryCode);
  return {
    code,
    title,
    description: options.description || '',
    icon: options.icon || '',
    disabledIcon: options.disabledIcon || '',
    enabled: options.enabled !== undefined ? options.enabled : true,
    sortOrder: options.sortOrder || 0,
    countryCode,
    currency,
    updatedAt: nowIso(options.offsetMinutes || 0),
    countries: [countryCode],
    // Payment fee settings
    feeEnabled: options.feeEnabled !== undefined ? options.feeEnabled : false,
    feeSettings: {
      priceType: 'Fixed price',
      minAmount: 0,
      maxAmount: 9999,
      refundable: options.feeRefundable !== undefined ? options.feeRefundable : false,
      amount: options.feeAmount || 0,
      currency,
      customerTypes: options.feeCustomerTypes || [],
      taxSettings: {
        calculateTax: options.calculateTax !== undefined ? options.calculateTax : false,
        feeContainsTax: options.feeContainsTax !== undefined ? options.feeContainsTax : false
      }
    },
    // Gateway settings
    gatewayEnabled: options.gatewayEnabled !== undefined ? options.gatewayEnabled : false,
    language: options.language || countryCode === 'IT' ? 'IT' : countryCode === 'SK' ? 'SK' : countryCode === 'CZ' ? 'CZ' : countryCode === 'RO' ? 'RO' : countryCode === 'PL' ? 'PL' : 'EN',
    paymentAction: 'Authorize & Capture',
    debug: false,
    details: { ...DETAIL_DEFAULTS, ...(options.details || {}) }
  };
}

// Italy payment methods
const italyMethods = [
  createPaymentMethod('it_card_apple_google', 'Carte di credito, Apple Pay, Google Pay', 'IT', {
    icon: '/icons/cardonline.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 1
  }),
  createPaymentMethod('it_satispay', 'Satispay', 'IT', {
    icon: '/icons/satispay.svg',
    description: 'Paga smart, con Satispay hai tutto a portata di app!',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 2
  }),
  createPaymentMethod('it_klarna', 'Klarna', 'IT', {
    icon: '/icons/klarna.svg',
    description: 'Paga in 3 rate senza interessi',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 3,
    details: {
      ...DETAIL_DEFAULTS,
      klarnaApiEndpoint: 'Klarna Payments (Europe)',
      klarnaApiUsername: '',
      klarnaApiPassword: '',
      klarnaMode: 'Playground',
      klarnaLogging: 'Disable'
    }
  }),
  createPaymentMethod('it_paypal', 'PayPal', 'IT', {
    icon: '/icons/paypal.svg',
    description: 'Paga gli acquisti tra 30€ e 2.000€ in 3 rate senza interessi con PayPal. TAEG 0%. Scopri di più',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 4
  }),
  createPaymentMethod('it_cod', 'Pagamento alla consegna', 'IT', {
    icon: '/icons/cashondelivery.svg',
    feeEnabled: true,
    feeAmount: 5.90,
    feeRefundable: false,
    gatewayEnabled: true,
    sortOrder: 5
  })
];

// Slovakia payment methods
const slovakiaMethods = [
  createPaymentMethod('sk_card_apple_google', 'Online platba kartou / Apple Pay / GooglePay', 'SK', {
    icon: '/icons/cardonline.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 1
  }),
  createPaymentMethod('sk_cod', 'Dobierka', 'SK', {
    icon: '/icons/cashondelivery.svg',
    feeEnabled: true,
    feeAmount: 0.99,
    feeRefundable: false,
    gatewayEnabled: true,
    sortOrder: 2
  }),
  createPaymentMethod('sk_pharmacy', 'Platba v lekárni', 'SK', {
    icon: '/icons/cashondelivery.svg',
    description: 'platba len kartou alebo v hotovosti',
    feeEnabled: true,
    feeAmount: 0.99,
    feeRefundable: false,
    gatewayEnabled: true,
    sortOrder: 3
  }),
  createPaymentMethod('sk_sporopay', 'SporoPay', 'SK', {
    icon: '/icons/sporopay.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 4,
    details: {
      ...DETAIL_DEFAULTS,
      bankAccountPrefix: '000000',
      bankAccountNumber: '511287879',
      bankCode: '0900',
      constantSymbol: '0308'
    }
  }),
  createPaymentMethod('sk_vub', 'VÚB ePlatby', 'SK', {
    icon: '/icons/vub.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 5
  }),
  createPaymentMethod('sk_benefit', 'Benefit Plus', 'SK', {
    icon: '/icons/benefitplus.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 6
  }),
  createPaymentMethod('sk_bank', 'Bankový prevod', 'SK', {
    icon: '/icons/banktransfer.svg',
    description: 'Predlží dobu doručenia o 1 - 2 dni)',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 7
  })
];

// Czechia payment methods
const czechiaMethods = [
  createPaymentMethod('cz_pharmacy', 'V lékarně', 'CZ', {
    icon: '/icons/cashondelivery.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 1
  }),
  createPaymentMethod('cz_card', 'Kartou online', 'CZ', {
    icon: '/icons/cardonline.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 2
  }),
  createPaymentMethod('cz_cod', 'Dobírka', 'CZ', {
    icon: '/icons/cashondelivery.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 3
  }),
  createPaymentMethod('cz_pluxee', 'Pluxee', 'CZ', {
    icon: '/icons/pluxee.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 4
  }),
  createPaymentMethod('cz_benefit', 'Benefit Plus / Up eBenefity', 'CZ', {
    icon: '/icons/benefitplus.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 5
  }),
  createPaymentMethod('cz_edenred_account', 'Edenred Benefity Premium (účet)', 'CZ', {
    icon: '/icons/edenred.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 6
  }),
  createPaymentMethod('cz_edenred_card', 'FKSP Edenred Card', 'CZ', {
    icon: '/icons/edenred.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 7
  })
];

// Romania payment methods
const romaniaMethods = [
  createPaymentMethod('ro_pharmacy', 'Plata in farmacie', 'RO', {
    icon: '/icons/cashondelivery.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 1
  }),
  createPaymentMethod('ro_cod', 'Plata la livrare', 'RO', {
    icon: '/icons/cashondelivery.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 2
  }),
  createPaymentMethod('ro_edenred_gift', 'Edenred card cadou', 'RO', {
    icon: '/icons/edenred.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 3
  }),
  createPaymentMethod('ro_edenred_meal', 'Edenred tichete de masa', 'RO', {
    icon: '/icons/edenred.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 4
  }),
  createPaymentMethod('ro_card', 'Plata cu cardul.', 'RO', {
    icon: '/icons/cardonline.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 5
  })
];

// Poland payment methods
const polandMethods = [
  createPaymentMethod('pl_przelewy24', 'Szybki przelew online P24', 'PL', {
    icon: '/icons/przelewy.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 1
  }),
  createPaymentMethod('pl_card_blik', 'Blik / Karty / Apple Pay / Google Pay', 'PL', {
    icon: '/icons/cardonline.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 2
  }),
  createPaymentMethod('pl_cod', 'Płatność przy odbiorze', 'PL', {
    icon: '/icons/cashondelivery.svg',
    feeEnabled: false,
    gatewayEnabled: true,
    sortOrder: 3
  })
];

export const paymentMethods = [
  ...italyMethods,
  ...slovakiaMethods,
  ...czechiaMethods,
  ...romaniaMethods,
  ...polandMethods
];

export default paymentMethods;

