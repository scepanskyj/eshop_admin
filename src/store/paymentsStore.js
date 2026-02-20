import { reactive } from 'vue';
import seed, { gatewaysOnly } from '@/mock/payments.mock';
import { paymentMethods } from '@/mock/paymentMethods.seed';
import { migrateRules } from '@/utils/ruleMigration';

const STORAGE_KEY = 'esa.payments';
const GATEWAYS_STORAGE_KEY = 'esa.gateways';
const SEED_VERSION = '2.7'; // Increment this to force reload from seed data (2.7 = added Italy pay in pharmacy)
const VERSION_KEY = 'esa.payments.version';
const GATEWAYS_VERSION_KEY = 'esa.gateways.version';

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// Helper function to merge Stripe gateway config into card payment methods
function mergeStripeGatewayIntoCardMethods(paymentMethods, stripeGateway) {
  if (!stripeGateway || !stripeGateway.details) return paymentMethods;
  
  const updatedMethods = paymentMethods.map(method => {
    // Check if this is a card payment method (contains 'card' in code or uses cardonline icon)
    const isCardMethod = method.code.includes('card') || method.icon?.includes('cardonline');
    
    if (isCardMethod) {
      return {
        ...method,
        needsGatewayConfig: true,
        stripeTitle: stripeGateway.details.checkoutItemTitle || method.title,
        gatewayConfig: JSON.stringify({
          mid: stripeGateway.details.mid || '',
          url: stripeGateway.details.url || '',
          keysPath: stripeGateway.details.keysPath || '',
          privateKey: stripeGateway.details.privateKey || '',
          publicKey: stripeGateway.details.publicKey || '',
          successUrl: stripeGateway.details.successUrl || '',
          failUrl: stripeGateway.details.failUrl || '',
          terminalDomain: stripeGateway.details.terminalDomain || '',
          sendCartDescription: stripeGateway.details.sendCartDescription !== undefined ? stripeGateway.details.sendCartDescription : true,
          allowPrelive: stripeGateway.details.allowPrelive || false,
          externalGuid: stripeGateway.details.externalGuid || '',
          checkoutItemTitle: stripeGateway.details.checkoutItemTitle || method.title
        }, null, 2)
      };
    }
    return method;
  });
  
  return updatedMethods;
}

const state = reactive({
  gateways: [], // Payment methods (backward compatibility name)
  rules: [],
  fee: null,
  // page dirty flags
  _dirty: {
    paymentMethodDetail: false,
    rulesForm: false,
    feeForm: false,
    methodsOrder: false
  }
});

function persist() {
  const data = { gateways: state.gateways, rules: state.rules, fee: state.fee };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Remove old gateways storage
  localStorage.removeItem(GATEWAYS_STORAGE_KEY);
  localStorage.removeItem(GATEWAYS_VERSION_KEY);
}

function hydrate() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const raw = localStorage.getItem(STORAGE_KEY);
  
  // If version changed or no data exists, use seed data and migrate
  if (storedVersion !== SEED_VERSION || !raw) {
    console.log('Loading seed data - version:', SEED_VERSION, 'stored version:', storedVersion);
    
    // Start with payment methods from seed
    let methods = deepClone(paymentMethods && paymentMethods.length > 0 ? paymentMethods : seed.gateways);
    
    // Try to load existing Stripe gateway data and merge it
    const gatewaysRaw = localStorage.getItem(GATEWAYS_STORAGE_KEY);
    if (gatewaysRaw) {
      try {
        const parsed = JSON.parse(gatewaysRaw);
        const stripeGateway = parsed.gatewaysOnly?.find(g => g.code === 'stripe');
        if (stripeGateway) {
          console.log('Merging Stripe gateway config into card payment methods');
          methods = mergeStripeGatewayIntoCardMethods(methods, stripeGateway);
        }
      } catch (e) {
        console.warn('Failed to parse existing gateway data:', e);
      }
    } else {
      // Use seed gateway data if no stored data exists
      const stripeGateway = gatewaysOnly?.find(g => g.code === 'stripe');
      if (stripeGateway) {
        methods = mergeStripeGatewayIntoCardMethods(methods, stripeGateway);
      }
    }
    
    state.gateways = methods;
    const seedRules = deepClone(seed.rules);
    state.rules = migrateRules(seedRules);
    state.fee = deepClone(seed.fee);
    localStorage.setItem(VERSION_KEY, SEED_VERSION);
    
    persist();
    return;
  }
  
  // Otherwise, try to load from localStorage
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      state.gateways = parsed.gateways || [];
      const loadedRules = parsed.rules || [];
      // Migrate rules if they're in old format
      state.rules = migrateRules(loadedRules);
      state.fee = parsed.fee || null;
      
      // Migrate old gateway data if it exists and hasn't been merged yet
      const gatewaysRaw = localStorage.getItem(GATEWAYS_STORAGE_KEY);
      if (gatewaysRaw) {
        try {
          const parsedGateways = JSON.parse(gatewaysRaw);
          const stripeGateway = parsedGateways.gatewaysOnly?.find(g => g.code === 'stripe');
          if (stripeGateway) {
            // Check if any card method already has gateway config
            const hasGatewayConfig = state.gateways.some(m => 
              m.code.includes('card') && m.gatewayConfig
            );
            
            if (!hasGatewayConfig) {
              console.log('Migrating Stripe gateway config to card payment methods');
              state.gateways = mergeStripeGatewayIntoCardMethods(state.gateways, stripeGateway);
              persist();
            }
          }
        } catch (e) {
          console.warn('Failed to migrate gateway data:', e);
        }
      }
    } catch (e) {
      // reset storage on parse error
      console.log('Parse error, resetting to seed data');
      localStorage.removeItem(STORAGE_KEY);
      let methods = deepClone(paymentMethods && paymentMethods.length > 0 ? paymentMethods : seed.gateways);
      const stripeGateway = gatewaysOnly?.find(g => g.code === 'stripe');
      if (stripeGateway) {
        methods = mergeStripeGatewayIntoCardMethods(methods, stripeGateway);
      }
      state.gateways = methods;
      const seedRules = deepClone(seed.rules);
      state.rules = migrateRules(seedRules);
      state.fee = deepClone(seed.fee);
      localStorage.setItem(VERSION_KEY, SEED_VERSION);
    }
  }
  
  persist();
}

const getters = {
  filterGateways(list, { search, quick = {}, dialog = {} } = {}) {
    let items = Array.from(list);
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(g => (g.title || '').toLowerCase().includes(s) || (g.code || '').toLowerCase().includes(s));
    }
    if (quick.status === 'Enabled') items = items.filter(g => !!g.enabled);
    if (quick.status === 'Disabled') items = items.filter(g => !g.enabled);
    if (quick.language) items = items.filter(g => g.language === quick.language);
    if (dialog.paymentAction) items = items.filter(g => g.paymentAction === dialog.paymentAction);
    if (dialog.debug === 'Yes') items = items.filter(g => !!g.debug);
    if (dialog.debug === 'No') items = items.filter(g => !g.debug);
    if (Array.isArray(dialog.countries) && dialog.countries.length) {
      items = items.filter(g => (g.countries || []).some(c => dialog.countries.includes(c)));
    }
    return items;
  },
  sortItems(list, sortBy, sortDesc) {
    if (!sortBy) return list;
    const items = Array.from(list);
    items.sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];
      if (sortBy === 'updatedAt') {
        const ad = new Date(va).getTime();
        const bd = new Date(vb).getTime();
        return ad - bd;
      }
      if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb);
      return (va || 0) - (vb || 0);
    });
    if (sortDesc) items.reverse();
    return items;
  },
  paginate(list, page = 1, itemsPerPage = 10) {
    const start = (page - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  },
  filterRules(list, { search, quick = {}, dialog = {} } = {}) {
    let items = Array.from(list);
    if (search) {
      const s = search.toLowerCase();
      items = items.filter(r => (r.name || '').toLowerCase().includes(s));
    }
    if (quick.status === 'Active') items = items.filter(r => !!r.active);
    if (quick.status === 'Inactive') items = items.filter(r => !r.active);
    if (quick.storeView) items = items.filter(r => r.storeView === quick.storeView);
    if (Array.isArray(dialog.paymentMethods) && dialog.paymentMethods.length) items = items.filter(r => r.paymentMethods.some(m => dialog.paymentMethods.includes(m)));
    if (Array.isArray(dialog.targetShopTypes) && dialog.targetShopTypes.length) items = items.filter(r => r.targetShopTypes.some(t => dialog.targetShopTypes.includes(t)));
    if (dialog.updatedRange && dialog.updatedRange.length === 2) {
      const [from, to] = dialog.updatedRange;
      const f = from ? new Date(from).getTime() : 0;
      const t = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER;
      items = items.filter(r => {
        const d = new Date(r.updatedAt).getTime();
        return d >= f && d <= t;
      });
    }
    return items;
  }
};

const actions = {
  createPaymentMethod(method) {
    const exists = state.gateways.some(m => m.code === method.code);
    if (exists) throw new Error('Payment method code already exists');
    const pm = deepClone(method);
    pm.updatedAt = new Date().toISOString();
    state.gateways.push(pm);
    persist();
  },
  updatePaymentMethod(code, data) {
    const idx = state.gateways.findIndex(m => m.code === code);
    if (idx === -1) throw new Error('Payment method not found');
    const incoming = deepClone(data);
    if (incoming.code && incoming.code !== code) {
      const conflict = state.gateways.some((m, i) => m.code === incoming.code && i !== idx);
      if (conflict) throw new Error('Payment method code already exists');
    }
    const merged = { ...state.gateways[idx], ...incoming, updatedAt: new Date().toISOString() };
    state.gateways[idx] = merged;
    persist();
  },
  deletePaymentMethod(code) {
    const idx = state.gateways.findIndex(m => m.code === code);
    if (idx !== -1) {
      state.gateways.splice(idx, 1);
      persist();
    }
  },
  // Legacy gateway methods - now redirect to payment method methods
  createGateway(gateway) {
    return this.createPaymentMethod(gateway);
  },
  updateGateway(code, data) {
    return this.updatePaymentMethod(code, data);
  },
  deleteGateway(code) {
    return this.deletePaymentMethod(code);
  },
  reorderPaymentMethods(orderedList) {
    orderedList.forEach((item, index) => {
      const newOrder = index + 1;
      if ((item.sortOrder || 0) !== newOrder) {
        this.updatePaymentMethod(item.code, { ...item, sortOrder: newOrder });
      }
    });
  },
  createRule(rule) {
    const r = { ...deepClone(rule), id: rule.id || `r-${Date.now()}`, updatedAt: new Date().toISOString() };
    state.rules.push(r);
    persist();
    return r;
  },
  updateRule(id, data) {
    const idx = state.rules.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Rule not found');
    const merged = { ...state.rules[idx], ...deepClone(data), updatedAt: new Date().toISOString() };
    state.rules[idx] = merged;
    persist();
  },
  deleteRule(id) {
    const idx = state.rules.findIndex(r => r.id === id);
    if (idx !== -1) {
      state.rules.splice(idx, 1);
      persist();
    }
  },
  updateFee(fee) {
    state.fee = { ...deepClone(fee) };
    persist();
  }
};

const dirty = {
  set(pageKey, value) { state._dirty[pageKey] = !!value; },
  clear(pageKey) { state._dirty[pageKey] = false; },
  clearAll() { Object.keys(state._dirty).forEach(k => { state._dirty[k] = false; }); },
  shouldBlockNavigation() { return Object.values(state._dirty).some(Boolean); }
};

export default {
  state,
  getters,
  actions,
  dirty,
  init: hydrate
};



