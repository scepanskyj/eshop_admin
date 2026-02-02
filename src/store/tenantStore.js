import Vue from 'vue';

const TENANT_OPTIONS = [
  { code: 'IT', label: 'Italy', flag: '🇮🇹' },
  { code: 'SK', label: 'Slovakia', flag: '🇸🇰' },
  { code: 'CZ', label: 'Czechia', flag: '🇨🇿' },
  { code: 'PL', label: 'Poland', flag: '🇵🇱' },
  { code: 'RO', label: 'Romania', flag: '🇷🇴' },
  { code: 'RS', label: 'Serbia', flag: '🇷🇸' }
];

const state = Vue.observable({
  current: 'IT',
  options: TENANT_OPTIONS
});

const actions = {
  setTenant(code) {
    if (TENANT_OPTIONS.some(option => option.code === code)) {
      state.current = code;
    }
  }
};

export default {
  state,
  actions
};

