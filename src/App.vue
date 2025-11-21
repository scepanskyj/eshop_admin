<template>
  <v-app>
    <v-app-bar class="app-header" dark>
      <v-toolbar-title>Eshop Admin</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text class="tenant-switcher" v-bind="attrs" v-on="on">
            <span class="tenant-flag">{{ currentTenant.flag }}</span>
            <span class="tenant-label">{{ currentTenant.label }}</span>
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="option in tenantOptions"
            :key="option.code"
            @click="selectTenant(option.code)"
          >
            <v-list-item-title>
              <span class="tenant-flag">{{ option.flag }}</span>
              <span class="tenant-label">{{ option.label }}</span>
            </v-list-item-title>
            <v-spacer />
            <v-icon v-if="option.code === currentTenant.code">mdi-check</v-icon>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text class="role-switcher" v-bind="attrs" v-on="on">
            <v-icon left>{{ currentRole.icon }}</v-icon>
            <span class="role-label">{{ currentRole.label }}</span>
            <v-icon right small>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="option in roleOptions"
            :key="option.code"
            @click="selectRole(option.code)"
          >
            <v-list-item-icon>
              <v-icon>{{ option.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ option.label }}</v-list-item-title>
            <v-spacer />
            <v-icon v-if="option.code === currentRole.code" small>mdi-check</v-icon>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer permanent class="app-drawer">
      <v-list dense>
        <v-list-group prepend-icon="mdi-cog" value="true">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Payment section</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item :to="{ name: 'PaymentMethodsOverview' }" link class="nested-link">
            <v-list-item-action><v-icon>mdi-credit-card-outline</v-icon></v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Payment methods</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item :to="{ name: 'PaymentRestrictions' }" link class="nested-link">
            <v-list-item-action><v-icon>mdi-shield-half-full</v-icon></v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Payment restrictions</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item v-if="canAccessGateways" :to="{ name: 'GatewaysList' }" link class="nested-link">
            <v-list-item-action><v-icon>mdi-server</v-icon></v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Gateways</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
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
    canAccessGateways() {
      return roleStore.getters.canCreate(); // Only developers and admins
    }
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

html, body, #app { height: 100%; }

.app-header {
  background-color: tokens.$color-green !important;
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px !important;
}

.app-drawer {
  top: 64px !important;
  height: calc(100% - 64px) !important;
  width: 256px !important;
  z-index: 1;
  position: fixed !important;
  left: 0 !important;
  background-color: white !important;
}

.app-main {
  padding-top: 64px !important;
  margin-left: 256px !important; /* Standard Vuetify drawer width */
}

.nested-link {
  padding-left: 32px;
}

.tenant-switcher {
  color: white !important;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.tenant-flag {
  font-size: 18px;
  margin-right: 6px;
}

.tenant-label {
  font-size: 14px;
}

.role-switcher {
  color: white !important;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.role-label {
  font-size: 14px;
}
</style>


