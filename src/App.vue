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
            <v-btn variant="text" class="tenant-switcher" v-bind="props">
              {{ currentTenant.code }}
            </v-btn>
          </template>
          <v-list density="default">
            <v-list-item
              v-for="option in tenantOptions"
              :key="option.code"
              @click="selectTenant(option.code)"
            >
              <v-list-item-title>
                <span class="tenant-flag">{{ option.flag }}</span>
                <span class="tenant-label">{{ option.label }}</span>
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
          <v-list density="default">
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
      <v-list density="default">
        <v-list-group value="Payment section">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" title="Payment section" class="drawer-group-header">
              <template v-slot:prepend>
                <i class="fa-solid fa-credit-card drawer-icon" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'PaymentMethodsOverview' }"
            title="Payment methods"
            class="nested-link"
          />

          <v-list-item
            :to="{ name: 'PaymentRestrictions' }"
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

html, body, #app { height: 100%; }

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
  box-shadow: none !important;
  
  :deep(.v-toolbar-title) {
    color: tokens.$color-text-primary !important;
  }
  
  .tenant-switcher,
  .role-switcher {
    color: tokens.$color-text-primary !important;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.04) !important;
    }
  }
  
  .tenant-label,
  .role-label {
    color: tokens.$color-text-primary !important;
  }
  
  :deep(.v-btn:not(.header-icon-btn) .v-icon) {
    color: tokens.$color-text-primary !important;
  }
  
  :deep(.v-overlay__content .v-list-item--active) {
    background-color: tokens.$color-green-50 !important;
    color: tokens.$color-green-500 !important;
  }
  
  :deep(.v-overlay__content .v-list-item:hover) {
    background-color: tokens.$color-green-50 !important;
  }
  
  :deep(.v-overlay__content .v-icon) {
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
  background-color: white !important;
  
  // All list items - font size and weight
  :deep(.v-list-item),
  :deep(.v-list-item-title),
  :deep(.v-list-group__header),
  :deep(.v-list-group__header .v-list-item-title) {
    font-size: 14px !important;
    font-weight: 500 !important;
  }
  
  :deep(.v-list-item) {
    color: tokens.$color-text-primary !important;
    
    .v-list-item-title {
      color: tokens.$color-text-primary !important;
    }
  }
  
  // Font Awesome icon styling
  .drawer-icon {
    color: tokens.$color-text-secondary !important;
    font-size: 18px !important;
    margin-right: 8px !important;
  }
  
  :deep(.v-list-item .v-list-item__prepend .v-icon) {
    color: tokens.$color-text-secondary !important;
  }
  
  // Active items
  :deep(.v-list-item--active) {
    background-color: tokens.$color-green-50 !important;
    color: tokens.$color-green-500 !important;
    
    .v-list-item-title {
      color: tokens.$color-green-500 !important;
    }
    
    .v-icon {
      color: tokens.$color-green-500 !important;
    }
    
    .drawer-icon {
      color: tokens.$color-green-500 !important;
    }
  }
  
  :deep(.v-list-item:hover:not(.v-list-item--active)) {
    background-color: rgba(0, 0, 0, 0.04) !important;
  }
  
  // Nested items - remove the large left padding
  :deep(.v-list-group__items .v-list-item) {
    color: tokens.$color-text-primary !important;
    --indent-padding: 52px !important;
    padding-left: 52px !important;
    padding-inline-start: 52px !important;
    
    .v-list-item-title {
      color: tokens.$color-text-primary !important;
    }
  }
  
  
  // List group header chevron (default state)
  :deep(.v-list-group .v-list-group__header .v-icon),
  :deep(.v-list-group .v-list-group__header .v-list-group__items .v-icon) {
    color: tokens.$color-text-secondary !important;
  }
  
  // Expanded group header - green-600 for title, icon, and chevron
  :deep(.v-list-group--open > .v-list-group__header) {
    background-color: tokens.$color-green-50 !important;
    
    .v-list-item-title {
      color: tokens.$color-green-600 !important;
    }
    
    .drawer-icon {
      color: tokens.$color-green-600 !important;
    }
    
    // Chevron icon when expanded - target all possible locations
    .v-icon,
    :deep(.v-icon),
    .v-list-item__append .v-icon,
    :deep(.v-list-item__append .v-icon) {
      color: tokens.$color-green-600 !important;
    }
  }
  
  // Also target the chevron in the append slot
  :deep(.v-list-group--open .v-list-group__header .v-list-item__append .v-icon) {
    color: tokens.$color-green-600 !important;
  }
  
  // Group header when any child is active - make it green and bolder
  :deep(.v-list-group:has(.v-list-item--active) > .v-list-group__header) {
    background-color: tokens.$color-green-50 !important;
    
    .v-list-item-title {
      color: tokens.$color-green-600 !important;
      font-weight: 600 !important;
    }
    
    .drawer-icon {
      color: tokens.$color-green-600 !important;
    }
    
    .v-icon {
      color: tokens.$color-green-600 !important;
    }
  }
  
  // Border
  :deep(.v-navigation-drawer__border) {
    width: 1px !important;
    background-color: tokens.$color-border-subtle !important;
  }
}

.app-main {
  background-color: tokens.$color-surface-muted !important;
}

.nested-link {
  --indent-padding: 0px !important;
  
  :deep(.v-list-item) {
    padding-left: 52px !important;
    padding-inline-start: 52px !important;
  }
}

.header-right-items {
  display: flex;
  align-items: center;
  gap: 2px;
}

.version-text {
  font-size: 11px;
  color: tokens.$color-text-secondary;
  white-space: nowrap;
  padding: 0 2px;
}

.header-divider {
  margin: 0 2px;
  height: 16px !important;
  align-self: center;
}

.header-icon-btn {
  color: tokens.$color-text-secondary !important;
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  
  :deep(.v-icon) {
    color: tokens.$color-text-secondary !important;
    font-size: 18px !important;
  }
  
  &:hover {
    color: tokens.$color-text-primary !important;
    background-color: rgba(0, 0, 0, 0.04) !important;
    
    :deep(.v-icon) {
      color: tokens.$color-text-primary !important;
    }
  }
}


.tenant-switcher {
  color: tokens.$color-text-primary !important;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  font-size: 13px;
  min-width: auto;
  padding: 0 4px;
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

:deep(.v-selection-control__input) {
  color: tokens.$color-green-500 !important;
}

:deep(.v-switch__track) {
  background-color: rgba(0, 0, 0, 0.38) !important;
}

:deep(.v-selection-control--dirty .v-switch__track) {
  background-color: tokens.$color-green-500 !important;
}

:deep(.v-switch__thumb) {
  color: white !important;
}

// Chips - tonal variant styling
:deep(.v-chip--variant-tonal) {
  opacity: 1 !important;
}

// Tonal chips with green color
:deep(.v-chip--variant-tonal.v-chip--color-green) {
  background-color: tokens.$color-green-50 !important;
  color: tokens.$color-green-600 !important;
}

// Tonal chips with grey color
:deep(.v-chip--variant-tonal.v-chip--color-grey) {
  background-color: tokens.$color-gray-50 !important;
  color: tokens.$color-gray-700 !important;
}

// Elevated chips (green primary chips)
:deep(.v-chip--variant-elevated) {
  background-color: tokens.$color-green-500 !important;
  color: white !important;
  opacity: 1 !important;
}

a:not(.app-drawer a) {
  color: tokens.$color-green-500 !important;
  
  &:hover {
    color: tokens.$color-green-600 !important;
  }
}

.app-drawer a {
  color: tokens.$color-text-primary !important;
  
  &:hover {
    color: tokens.$color-text-primary !important;
  }
}

:deep(.v-field--focused .v-field__outline) {
  color: tokens.$color-green-500 !important;
}

:deep(.v-field--variant-outlined.v-field--focused .v-field__outline) {
  color: tokens.$color-green-500 !important;
  --v-field-border-width: 2px;
}

// Breadcrumbs - remove left padding globally with maximum specificity
// Target all possible combinations including spacing class
.v-breadcrumbs,
.v-breadcrumbs.v-breadcrumbs--density-default,
.v-breadcrumbs--density-default,
.v-breadcrumbs-spacing,
.v-breadcrumbs.v-breadcrumbs-spacing,
.v-breadcrumbs--density-default.v-breadcrumbs-spacing,
.no-left-padding,
.no-left-padding.v-breadcrumbs,
.no-left-padding.v-breadcrumbs-spacing {
  padding-left: 0 !important;
  padding-inline-start: 0 !important;
  padding-right: 0 !important;
  padding-inline-end: 0 !important;
  padding: 16px 0 !important; // Override shorthand: top/bottom 16px, left/right 0
}

</style>
