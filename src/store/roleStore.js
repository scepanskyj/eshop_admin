import Vue from 'vue';

const ROLE_OPTIONS = [
  { code: 'admin', label: 'Admin', icon: 'mdi-shield-crown' },
  { code: 'developer', label: 'Developer', icon: 'mdi-code-tags' },
  { code: 'user', label: 'User', icon: 'mdi-account' }
];

const state = Vue.observable({
  current: 'admin',
  options: ROLE_OPTIONS
});

const actions = {
  setRole(code) {
    if (ROLE_OPTIONS.some(option => option.code === code)) {
      state.current = code;
    }
  }
};

const getters = {
  isAdmin() {
    return state.current === 'admin';
  },
  isDeveloper() {
    return state.current === 'developer';
  },
  isUser() {
    return state.current === 'user';
  },
  canCreate() {
    // Admin and developer can create
    return state.current === 'admin' || state.current === 'developer';
  },
  canDelete() {
    // Admin and developer can delete
    return state.current === 'admin' || state.current === 'developer';
  },
  canEdit() {
    // All roles can edit
    return true;
  }
};

export default {
  state,
  actions,
  getters
};

