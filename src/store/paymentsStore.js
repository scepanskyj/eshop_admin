import Vue from 'vue';
import seed, { gatewaysOnly } from '@/mock/payments.mock';
import { paymentMethods } from '@/mock/paymentMethods.seed';

const STORAGE_KEY = 'esa.payments';
const GATEWAYS_STORAGE_KEY = 'esa.gateways';
const SEED_VERSION = '2.4'; // Increment this to force reload from seed data
const VERSION_KEY = 'esa.payments.version';
const GATEWAYS_VERSION_KEY = 'esa.gateways.version';

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

const state = Vue.observable({
  gateways: [], // Payment methods (backward compatibility)
  gatewaysOnly: [], // Separate gateways list (only Stripe)
  rules: [],
  fee: null,
  // page dirty flags
  _dirty: {
    gatewayDetail: false,
    paymentMethodDetail: false,
    rulesForm: false,
    feeForm: false
  }
});

function persist() {
  const data = { gateways: state.gateways, rules: state.rules, fee: state.fee };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const gatewaysData = { gatewaysOnly: state.gatewaysOnly };
  localStorage.setItem(GATEWAYS_STORAGE_KEY, JSON.stringify(gatewaysData));
}

function hydrate() {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  const raw = localStorage.getItem(STORAGE_KEY);
  
  // If version changed or no data exists, use seed data
  if (storedVersion !== SEED_VERSION || !raw) {
    console.log('Loading seed data - version:', SEED_VERSION, 'stored version:', storedVersion, 'payment methods count:', paymentMethods?.length);
    // Payment methods come from paymentMethods.seed.js
    state.gateways = deepClone(paymentMethods && paymentMethods.length > 0 ? paymentMethods : seed.gateways);
    state.rules = deepClone(seed.rules);
    state.fee = deepClone(seed.fee);
    localStorage.setItem(VERSION_KEY, SEED_VERSION);
    
    // Load gateways separately
    const gatewaysVersion = localStorage.getItem(GATEWAYS_VERSION_KEY);
    const gatewaysRaw = localStorage.getItem(GATEWAYS_STORAGE_KEY);
    if (gatewaysVersion !== SEED_VERSION || !gatewaysRaw) {
      state.gatewaysOnly = deepClone(gatewaysOnly);
      localStorage.setItem(GATEWAYS_VERSION_KEY, SEED_VERSION);
    } else {
      try {
        const parsed = JSON.parse(gatewaysRaw);
        state.gatewaysOnly = parsed.gatewaysOnly || [];
      } catch (e) {
        state.gatewaysOnly = deepClone(gatewaysOnly);
        localStorage.setItem(GATEWAYS_VERSION_KEY, SEED_VERSION);
      }
    }
    
    persist();
    return;
  }
  
  // Otherwise, try to load from localStorage
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      state.gateways = parsed.gateways || [];
      state.rules = parsed.rules || [];
      state.fee = parsed.fee || null;
    } catch (e) {
      // reset storage on parse error
      console.log('Parse error, resetting to seed data');
      localStorage.removeItem(STORAGE_KEY);
      state.gateways = deepClone(paymentMethods && paymentMethods.length > 0 ? paymentMethods : seed.gateways);
      state.rules = deepClone(seed.rules);
      state.fee = deepClone(seed.fee);
      localStorage.setItem(VERSION_KEY, SEED_VERSION);
    }
  }
  
  // Load gateways separately
  const gatewaysRaw = localStorage.getItem(GATEWAYS_STORAGE_KEY);
  if (gatewaysRaw) {
    try {
      const parsed = JSON.parse(gatewaysRaw);
      state.gatewaysOnly = parsed.gatewaysOnly || [];
    } catch (e) {
      state.gatewaysOnly = deepClone(gatewaysOnly);
      localStorage.setItem(GATEWAYS_VERSION_KEY, SEED_VERSION);
    }
  } else {
    state.gatewaysOnly = deepClone(gatewaysOnly);
    localStorage.setItem(GATEWAYS_VERSION_KEY, SEED_VERSION);
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
  createGateway(gateway) {
    const exists = state.gatewaysOnly.some(g => g.code === gateway.code);
    if (exists) throw new Error('Gateway code already exists');
    const gw = deepClone(gateway);
    gw.updatedAt = new Date().toISOString();
    state.gatewaysOnly.push(gw);
    persist();
  },
  updateGateway(code, data) {
    const idx = state.gatewaysOnly.findIndex(g => g.code === code);
    if (idx === -1) throw new Error('Gateway not found');
    const incoming = deepClone(data);
    if (incoming.code && incoming.code !== code) {
      const conflict = state.gatewaysOnly.some((g, i) => g.code === incoming.code && i !== idx);
      if (conflict) throw new Error('Gateway code already exists');
    }
    const merged = { ...state.gatewaysOnly[idx], ...incoming, updatedAt: new Date().toISOString() };
    Vue.set(state.gatewaysOnly, idx, merged);
    persist();
  },
  deleteGateway(code) {
    const idx = state.gatewaysOnly.findIndex(g => g.code === code);
    if (idx !== -1) {
      state.gatewaysOnly.splice(idx, 1);
      persist();
    }
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
    Vue.set(state.rules, idx, merged);
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
  set(pageKey, value) { Vue.set(state._dirty, pageKey, !!value); },
  clear(pageKey) { Vue.set(state._dirty, pageKey, false); },
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



