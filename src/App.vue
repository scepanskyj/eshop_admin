<template>
  <v-app>
    <v-app-bar class="app-header">
      <img src="/logo/drmaxlogo-border.svg" alt="DRMax Logo" class="app-logo" />
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

// Global typography overrides for Vuetify classes
h1, .text-h1, .text-h2, .text-h3, .text-h4, .text-h5, .text-h6 {
  font-family: tokens.$font-family-base !important;
}

h1, .text-h1 {
  font: tokens.$text-h1 !important;
  color: tokens.$color-text-primary !important;
}

.text-h2 {
  font: tokens.$text-h2 !important;
  color: tokens.$color-text-primary !important;
}

.text-h3 {
  font: tokens.$text-h3 !important;
  color: tokens.$color-text-primary !important;
}

.text-h4 {
  font: tokens.$text-h4 !important;
  color: tokens.$color-text-primary !important;
}

.text-h5 {
  font: tokens.$text-h5 !important;
  color: tokens.$color-text-primary !important;
}

.text-h6 {
  font: tokens.$text-h6 !important;
  color: tokens.$color-text-primary !important;
}

.app-header {
  background-color: white !important;
  border-bottom: 1px solid tokens.$color-border-subtle !important;
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px !important;
  box-shadow: none !important;
  
  // Toolbar title - black
  :deep(.v-toolbar__title) {
    color: tokens.$color-text-primary !important;
  }
  
  // Menu buttons - black text
  .tenant-switcher,
  .role-switcher {
    color: tokens.$color-text-primary !important;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04) !important;
    }
  }
  
  // Menu buttons text
  .tenant-label,
  .role-label {
    color: tokens.$color-text-primary !important;
  }
  
  // Menu icons - black
  :deep(.v-btn .v-icon) {
    color: tokens.$color-text-primary !important;
  }
  
  // Menu dropdown active states
  :deep(.v-menu__content .v-list-item--active) {
    background-color: tokens.$color-green-50 !important;
    color: tokens.$color-green-500 !important;
  }
  
  :deep(.v-menu__content .v-list-item:hover) {
    background-color: tokens.$color-green-50 !important;
  }
  
  :deep(.v-menu__content .v-icon) {
    color: tokens.$color-green-500 !important;
  }
}

.app-logo {
  height: 40px;
  width: auto;
  margin-right: 16px;
  margin-left: 8px;
}

.app-drawer {
  top: 64px !important;
  height: calc(100% - 64px) !important;
  width: 256px !important;
  z-index: 1;
  position: fixed !important;
  left: 0 !important;
  background-color: white !important;
  
  // Default navigation items - black text and icons
  :deep(.v-list-item) {
    color: tokens.$color-text-primary !important;
    
    .v-list-item__title {
      color: tokens.$color-text-primary !important;
    }
  }
  
  // Icons in navigation - black by default
  :deep(.v-list-item__action .v-icon) {
    color: tokens.$color-text-secondary !important;
  }
  
  // Active navigation items - green
  :deep(.v-list-item--active) {
    background-color: tokens.$color-green-50 !important;
    color: tokens.$color-green-500 !important;
    
    .v-list-item__title {
      color: tokens.$color-green-500 !important;
      font-weight: 500 !important;
    }
    
    .v-icon {
      color: tokens.$color-green-500 !important;
    }
    
    .v-list-item__action .v-icon {
      color: tokens.$color-green-500 !important;
    }
  }
  
  // Hover states - subtle gray, not green
  :deep(.v-list-item:hover:not(.v-list-item--active)) {
    background-color: rgba(0, 0, 0, 0.04) !important;
  }
  
  // List group header - black by default
  :deep(.v-list-group__header) {
    color: tokens.$color-text-primary !important;
    
    .v-list-item__title {
      color: tokens.$color-text-primary !important;
    }
    
    // Prepend icon (left icon) - black by default
    .v-list-item__icon .v-icon {
      color: tokens.$color-text-secondary !important;
    }
  }
  
  // List group icons - black by default (including prepend-icon)
  :deep(.v-list-group__header .v-icon) {
    color: tokens.$color-text-secondary !important;
  }
  
  // List group prepend icon specifically
  :deep(.v-list-group[prepend-icon] .v-list-group__header .v-list-item__icon .v-icon) {
    color: tokens.$color-text-secondary !important;
  }
  
  // List group active state - green
  :deep(.v-list-group--active > .v-list-group__header) {
    background-color: tokens.$color-green-50 !important;
    color: tokens.$color-green-500 !important;
    
    .v-list-item__title {
      color: tokens.$color-green-500 !important;
      font-weight: 500 !important;
    }
    
    .v-icon {
      color: tokens.$color-green-500 !important;
    }
    
    .v-list-item__icon .v-icon {
      color: tokens.$color-green-500 !important;
    }
  }
  
  // Border on the right side of drawer
  border-right: 1px solid tokens.$color-border-subtle !important;
}

.app-main {
  padding-top: 64px !important;
  margin-left: 256px !important; /* Standard Vuetify drawer width */
  background-color: tokens.$color-surface-muted !important;
}

.nested-link {
  padding-left: 32px;
}

.tenant-switcher {
  color: tokens.$color-text-primary !important;
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
  color: tokens.$color-text-primary !important;
}

.role-switcher {
  color: tokens.$color-text-primary !important;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
}

.role-label {
  font-size: 14px;
  color: tokens.$color-text-primary !important;
}

// Global interactive elements - use green colors
:deep(.v-input--checkbox .v-input--selection-controls__input .v-input--selection-controls__ripple) {
  color: tokens.$color-green-500 !important;
}

:deep(.v-input--checkbox .v-input--selection-controls__input input:checked + .v-input--selection-controls__ripple) {
  color: tokens.$color-green-500 !important;
}

:deep(.v-input--switch .v-input--selection-controls__input .v-input--switch__track) {
  background-color: rgba(0, 0, 0, 0.38) !important;
}

:deep(.v-input--switch .v-input--is-label-active .v-input--switch__track) {
  background-color: tokens.$color-green-500 !important;
}

:deep(.v-input--switch .v-input--selection-controls__input .v-input--switch__thumb) {
  color: white !important;
}

// Radio buttons
:deep(.v-input--radio-group .v-input--selection-controls__input .v-input--selection-controls__ripple) {
  color: tokens.$color-green-500 !important;
}

:deep(.v-input--radio-group .v-input--selection-controls__input input:checked + .v-input--selection-controls__ripple) {
  color: tokens.$color-green-500 !important;
}

// Chips and tags
:deep(.v-chip--active) {
  background-color: tokens.$color-green-500 !important;
  color: white !important;
}

// Links - exclude navigation drawer links
a:not(.app-drawer a) {
  color: tokens.$color-green-500 !important;
  
  &:hover {
    color: tokens.$color-green-600 !important;
  }
}

// Override link color in drawer to use black
.app-drawer a {
  color: tokens.$color-text-primary !important;
  
  &:hover {
    color: tokens.$color-text-primary !important;
  }
}

// Focus states
:deep(.v-input--is-focused .v-input__slot fieldset) {
  border-color: tokens.$color-green-500 !important;
}

:deep(.v-text-field--outlined.v-input--is-focused .v-input__slot fieldset) {
  border-color: tokens.$color-green-500 !important;
  border-width: 2px !important;
}
</style>


