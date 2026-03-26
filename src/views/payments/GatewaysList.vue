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
          <v-icon start>mdi-plus</v-icon>
          Create gateway
        </v-btn>
      </template>
      <template v-slot:filters>
        <section class="filters-section">
          <v-row class="search-row" dense>
            <v-col cols="12" md="6" lg="5">
              <v-text-field
                v-model="search"
                density="compact"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                label="Search title or code"
                hide-details
                class="search-field"
              />
            </v-col>
          </v-row>
        </section>
      </template>
    </PageHeader>

    <v-overlay :model-value="loading" z-index="9999">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-overlay>

    <EmptyState
      v-if="!sortedGateways.length"
      icon="mdi-server"
      title="No gateways match"
      :subtitle="canCreate ? 'Adjust filters or create a new gateway to get started.' : 'Adjust filters to see gateways.'"
      :cta-label="canCreate ? 'Create gateway' : undefined"
      @cta="canCreate && createGateway"
    />

    <div v-if="sortedGateways.length" class="table-card">
      <OverviewTableHeader
        :filter-active="showEnabledOnly"
        :active-count="enabledFilterCount"
        filter-label="Enabled"
        @update:filterActive="setShowEnabledOnly"
      />
      <div class="gateways-list">
      <GatewayCard
        v-for="gateway in sortedGateways"
        :key="gateway.code"
        :gateway="gateway"
        :icon="getGatewayIcon(gateway.code)"
        :on-configure="openConfigure"
        :show-country-badge="false"
      />
      </div>
    </div>
  </div>
</template>

<script>
import EmptyState from '@/components/common/EmptyState.vue';
import OverviewTableHeader from '@/components/common/OverviewTableHeader.vue';
import GatewayCard from '@/components/payments/GatewayCard.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import store from '@/store/paymentsStore';
import roleStore from '@/store/roleStore';
import { getAssetPath } from '@/utils/paths';

export default {
  name: 'GatewaysList',
  components: { EmptyState, GatewayCard, OverviewTableHeader, PageHeader },
  data() {
    return {
      search: '',
      showEnabledOnly: false,
      loading: false
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
        { title: 'Payment section', disabled: true },
        { title: 'Gateways', disabled: true }
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
      return this.filteredGateways.filter(g => g.enabled).length;
    }
  },
  methods: {
    setShowEnabledOnly(val) {
      this.showEnabledOnly = val;
    },
    getGatewayIcon(code) {
      const gateway = this.sortedGateways.find(g => g.code === code);
      if (gateway && gateway.icon) {
        return getAssetPath(typeof gateway.icon === 'string' ? gateway.icon : gateway.icon.value);
      }
      return getAssetPath('/icons/default.svg');
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
  padding: tokens.$page-padding;
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

.search-field :deep(.v-field) {
  background-color: white !important;
}

.table-card {
  background: tokens.$color-surface-default;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.gateways-list {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
  padding: tokens.$space-lg;
}

</style>
