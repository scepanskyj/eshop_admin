<template>
  <div class="gateways-page-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <v-btn 
          v-if="canCreate" 
          color="primary" 
          @click="createGateway" 
          :disabled="loading"
        >
          <v-icon left>mdi-plus</v-icon>
          Create gateway
        </v-btn>
      </template>
      <template v-slot:filters>
        <section class="filters-section">
          <v-row class="search-row" dense>
            <v-col cols="12" md="6" lg="5">
              <v-text-field
                v-model="search"
                outlined
                prepend-inner-icon="mdi-magnify"
                label="Search title or code"
                hide-details
                class="search-field"
              />
            </v-col>
            <v-col cols="12" md="auto" lg="auto">
              <v-sheet outlined class="filter-wrapper">
                <v-checkbox
                  v-model="showEnabledOnly"
                  :label="`Show enabled only (${enabledFilterCount})`"
                  hide-details
                  class="ma-0"
                  @change="onFilterChange"
                />
              </v-sheet>
            </v-col>
          </v-row>
        </section>
      </template>
    </PageHeader>

    <v-overlay :value="loading" z-index="9999">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-overlay>

    <EmptyState
      v-if="!filtering && !sortedGateways.length"
      icon="mdi-server"
      title="No gateways match"
      :subtitle="canCreate ? 'Adjust filters or create a new gateway to get started.' : 'Adjust filters to see gateways.'"
      :cta-label="canCreate ? 'Create gateway' : undefined"
      @cta="canCreate && createGateway"
    />

    <div v-if="filtering" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <div v-else-if="sortedGateways.length" class="gateways-list">
      <GatewayCard
        v-for="gateway in sortedGateways"
        :key="gateway.code"
        :gateway="gateway"
        :icon="getGatewayIcon(gateway.code)"
        :updated-label="formatUpdated(gateway.updatedAt)"
        :on-configure="openConfigure"
        :show-country-badge="false"
      />
    </div>
  </div>
</template>

<script>
import EmptyState from '@/components/common/EmptyState.vue';
import GatewayCard from '@/components/payments/GatewayCard.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import store from '@/store/paymentsStore';
import roleStore from '@/store/roleStore';
import { getAssetPath } from '@/utils/paths';

export default {
  name: 'GatewaysList',
  components: { EmptyState, GatewayCard, PageHeader },
  data() {
    return {
      search: '',
      showEnabledOnly: false,
      loading: false,
      filtering: false
    };
  },
  computed: {
    canCreate() {
      return roleStore.getters.canCreate();
    },
    canDelete() {
      return roleStore.getters.canDelete();
    },
    breadcrumbs() {
      return [
        { text: 'Payment section', disabled: true },
        { text: 'Gateways', disabled: true }
      ];
    },
    filteredGateways() {
      const term = (this.search || '').toLowerCase();
      return store.state.gatewaysOnly.filter(gateway => {
        const title = (gateway.title || '').toLowerCase();
        const code = (gateway.code || '').toLowerCase();
        const matchesSearch = !term || title.includes(term) || code.includes(term);
        const matchesStatus = !this.showEnabledOnly || gateway.enabled;
        return matchesSearch && matchesStatus;
      });
    },
    sortedGateways() {
      return [...this.filteredGateways].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );
    },
    enabledFilterCount() {
      return store.state.gatewaysOnly.filter(g => g.enabled).length;
    }
  },
  methods: {
    onFilterChange() {
      this.filtering = true;
      setTimeout(() => {
        this.filtering = false;
      }, 800);
    },
    getGatewayIcon(code) {
      const gateway = this.sortedGateways.find(g => g.code === code);
      if (gateway && gateway.icon) {
        return getAssetPath(typeof gateway.icon === 'string' ? gateway.icon : gateway.icon.value);
      }
      return getAssetPath('/icons/default.svg');
    },
    formatUpdated(value) {
      if (!value) return 'never';
      const date = new Date(value);
      return isNaN(date.getTime()) ? 'unknown' : date.toLocaleString();
    },
    openConfigure(gateway) {
      this.$router.push({ name: 'GatewayDetail', params: { code: gateway.code } });
    },
    createGateway() {
      this.$router.push({ name: 'GatewayCreate' });
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.gateways-page-wrapper {
  background-color: tokens.$color-surface-muted;
  min-height: calc(100vh - 64px);
  padding: tokens.$space-md;
}

.filters-section {
  margin-bottom: tokens.$space-md;
}

.search-row :deep(.v-col) {
  padding-left: tokens.$space-md;
  padding-right: tokens.$space-md;
}

.search-row :deep(.v-col:first-child) {
  padding-left: 0;
}

.search-field :deep(.v-input__slot) {
  background-color: white !important;
}

.filter-wrapper {
  border-radius: 4px;
  padding: 11px 16px 15px 16px;
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.gateways-list {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: tokens.$space-xl;
  min-height: 200px;
}
</style>
