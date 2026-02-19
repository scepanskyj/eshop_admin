<template>
  <v-app>
    <v-app-bar class="app-header">
      <img src="/logo/drmaxlogo-border.svg" alt="DRMax Logo" class="app-logo" />
      <v-toolbar-title>Eshop Admin</v-toolbar-title>
      <v-spacer></v-spacer>

      <div class="header-right-items">
        <span class="version-text">client v{{ clientVersion }}, server v{{ serverVersion }}</span>
        <v-divider vertical class="header-divider" />
        <v-btn icon variant="text" class="header-icon-btn" aria-label="Info">
          <v-icon size="small">mdi-information-outline</v-icon>
        </v-btn>
        <v-btn icon variant="text" class="header-icon-btn" aria-label="Package">
          <v-icon size="small">mdi-cube-outline</v-icon>
        </v-btn>
        <v-btn icon variant="text" class="header-icon-btn" aria-label="Documentation">
          <v-icon size="small">mdi-book-open-outline</v-icon>
        </v-btn>
        <v-divider vertical class="header-divider" />
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn variant="text" class="header-switcher" v-bind="props">
              {{ currentTenant.code }}
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="option in tenantOptions"
              :key="option.code"
              @click="selectTenant(option.code)"
            >
              <v-list-item-title>
                <span class="header-switcher-flag">{{ option.flag }}</span>
                <span class="header-switcher-label">{{ option.label }}</span>
              </v-list-item-title>
              <template v-slot:append>
                <v-icon v-if="option.code === currentTenant.code">mdi-check</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-divider vertical class="header-divider" />
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon variant="text" class="header-icon-btn" aria-label="User profile" v-bind="props">
              <v-icon size="small">mdi-account-outline</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="option in roleOptions"
              :key="option.code"
              :prepend-icon="option.icon"
              @click="selectRole(option.code)"
            >
              <v-list-item-title>{{ option.label }}</v-list-item-title>
              <template v-slot:append>
                <v-icon v-if="option.code === currentRole.code" size="small">mdi-check</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-navigation-drawer permanent class="app-drawer">
      <v-list density="compact">
        <v-list-group value="Payment section">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog" title="Payment section" />
          </template>

          <v-list-item
            :to="{ name: 'PaymentMethodsOverview' }"
            prepend-icon="mdi-credit-card-outline"
            title="Payment methods"
            class="nested-link"
          />

          <v-list-item
            :to="{ name: 'PaymentRestrictions' }"
            prepend-icon="mdi-shield-half-full"
            title="Payment restrictions"
            class="nested-link"
          />
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-main class="app-main">
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import tenantStore from '@/store/tenantStore';
import roleStore from '@/store/roleStore';

export default {
  name: 'App',
  data() {
    return {
      clientVersion: (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.1.0'),
      serverVersion: '0.1.0'
    };
  },
  computed: {
    tenantOptions() {
      return tenantStore.state.options;
    },
    currentTenant() {
      const current = tenantStore.state.current;
      return tenantStore.state.options.find(option => option.code === current) || tenantStore.state.options[0];
    },
    roleOptions() {
      return roleStore.state.options;
    },
    currentRole() {
      const current = roleStore.state.current;
      return roleStore.state.options.find(option => option.code === current) || roleStore.state.options[0];
    },
  },
  methods: {
    selectTenant(code) {
      tenantStore.actions.setTenant(code);
    },
    selectRole(code) {
      roleStore.actions.setRole(code);
    }
  }
};
</script>

<style lang="scss">
@use '@/styles/tokens.scss' as tokens;
@use '@/styles/typography';
@use '@/styles/vuetify-overrides';
@use '@/styles/layout';
</style>
