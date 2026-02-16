<template>
  <div class="page-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <v-btn color="primary" @click="newRuleDialog = true">
          <v-icon left>mdi-plus</v-icon>New rule
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
                label="Search in all columns"
                hide-details
                class="search-field"
              />
            </v-col>
            <v-col cols="12" md="auto" lg="auto">
              <QuickFilter
                v-model="showActiveOnly"
                :label="`Show active only (${activeFilterCount})`"
                @change="onFilterChange"
              />
            </v-col>
          </v-row>
        </section>
      </template>
    </PageHeader>

    <v-data-table
      :headers="tableHeaders"
      :items="sortedRules"
      class="elevation-1 rules-table"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      @click:row="onRowClick"
    >
      <template v-slot:item.paymentMethods="{ item }">
        {{ formatPaymentMethods(item.paymentMethods) }}
      </template>
      <template v-slot:item.updatedAt="{ item }">
        {{ formatUpdated(item.updatedAt) }}
      </template>
      <template v-slot:item.active="{ item }">
        <v-chip small :class="item.active ? 'chip-enabled' : 'chip-disabled'" text-color="white">
          {{ item.active ? 'ACTIVE' : 'INACTIVE' }}
        </v-chip>
      </template>
      <template v-slot:item.shopType="{ item }">
        {{ item.shopType || '1P' }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon @click.stop="$router.push({ name: 'PaymentRestrictionDetail', params: { id: item.id } })">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click.stop="confirmDelete(item)">
          <v-icon color="red">mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Delete Confirmation Dialog -->
    <Modal v-model="deleteDialog" title="Delete rule" max-width="520" @close="cancelDelete">
      <template v-slot:content>
        <v-alert
          v-if="showDeleteConfirm"
          type="error"
          outlined
          dense
          class="mb-4"
          dismissible
          @input="showDeleteConfirm = false"
        >
          <strong>Warning:</strong> Deleting this rule is irreversible. Click "Confirm delete" below to proceed.
        </v-alert>
        
        <div class="text-body-1 mb-2">
          Are you sure you want to delete <strong>{{ toDelete && toDelete.name }}</strong>?
        </div>
      </template>
      
      <template v-slot:footer>
        <v-spacer />
        <TertiaryButton text @click="cancelDelete">Cancel</TertiaryButton>
        <v-btn
          v-if="!showDeleteConfirm"
          outlined
          color="red"
          @click="showDeleteConfirm = true"
        >
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
        <v-btn
          v-else
          color="red"
          dark
          @click="doDelete"
        >
          <v-icon left>mdi-delete</v-icon>
          Confirm delete
        </v-btn>
      </template>
    </Modal>

    <!-- New Rule Choice Dialog -->
    <Modal v-model="newRuleDialog" :title="newRuleDialogTitle" max-width="640" :has-footer="false" @close="closeNewRuleDialog">
      <template v-slot:content>
        <!-- Step 1: Choice -->
        <template v-if="newRuleDialogStep === 'choice'">
          <p class="new-rule-dialog-text">How would you like to start?</p>
          <div class="new-rule-dialog-actions">
            <v-btn
              block
              large
              color="primary"
              class="new-rule-option-btn"
              @click="startNewRule(false)"
            >
              <v-icon left>mdi-file-document-outline</v-icon>
              Start from fresh
            </v-btn>
            <SecondaryButton
              block
              large
              outlined
              class="new-rule-option-btn"
              @click="newRuleDialogStep = 'preset'"
            >
              <v-icon left>mdi-file-document-multiple-outline</v-icon>
              Load example rule
            </SecondaryButton>
          </div>
        </template>

        <!-- Step 2: Preset picker -->
        <template v-else>
          <div class="preset-picker-header">
            <v-btn icon small @click="newRuleDialogStep = 'choice'" class="preset-back-btn">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <p class="preset-picker-text">Choose an example rule for {{ currentCountryLabel }}</p>
          </div>
          <div class="preset-table-wrapper">
            <table class="preset-table" v-if="presetsForCountry.length">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Description</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(preset, idx) in presetsForCountry"
                  :key="`${preset.name}-${idx}`"
                  class="preset-row"
                  @click="selectPreset(preset)"
                >
                  <td class="preset-name">{{ preset.name }}</td>
                  <td class="preset-desc">{{ preset.description }}</td>
                  <td class="preset-actions">
                    <v-btn small color="primary" @click.stop="selectPreset(preset)">Use</v-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-if="!presetsForCountry.length" class="preset-empty">No example rules for this country yet.</p>
        </template>
      </template>
    </Modal>

    <v-snackbar v-model="snackbar.show">
      {{ snackbar.text }}
      <TertiaryButton text @click="snackbar.show=false">Close</TertiaryButton>
    </v-snackbar>
  </div>
</template>

<script>
import QuickFilter from '@/components/common/QuickFilter.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Modal from '@/components/common/Modal.vue';
import TertiaryButton from '@/components/common/TertiaryButton.vue';
import SecondaryButton from '@/components/common/SecondaryButton.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';
import { getPresetsForCountry } from '@/data/exampleRulePresets';

const PRESET_STORAGE_KEY = 'paymentRestrictionPreset';

export default {
  name: 'PaymentRestrictions',
  components: { QuickFilter, PageHeader, Modal, TertiaryButton, SecondaryButton },
  data() {
    return {
      search: '',
      showActiveOnly: false,
      sortBy: 'updatedAt',
      sortDesc: true,
      deleteDialog: false,
      newRuleDialog: false,
      newRuleDialogStep: 'choice',
      showDeleteConfirm: false,
      toDelete: null,
      snackbar: { show: false, text: '' },
      rulesMetadata: [],
      filtering: false
    };
  },
    async created() {
      try {
        const response = await fetch('/rules-metadata.json');
        if (response.ok) {
          const payload = await response.json();
          this.rulesMetadata = Array.isArray(payload.rules) ? payload.rules : [];
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Unable to load rules metadata', error);
      }
    },
  computed: {
    breadcrumbs() {
      return [
        { text: 'Payment methods', disabled: true },
        { text: 'Payment restrictions overview', disabled: true }
      ];
    },
    showShopTypeField() {
      const currentTenant = tenantStore.state.current;
      return currentTenant === 'CZ' || currentTenant === 'SK';
    },
    shopTypeOptions() {
      return ['1P', '3P'];
    },
    tableHeaders() {
      const headers = [
        { text: 'Name', value: 'name', sortable: true },
        { text: 'Method', value: 'paymentMethods', sortable: false },
        { text: 'Updated', value: 'updatedAt', sortable: true },
        { text: 'Status', value: 'active', sortable: false },
        { text: 'Actions', value: 'actions', align: 'end', sortable: false }
      ];
      if (this.showShopTypeField) {
        headers.splice(3, 0, { text: 'Shop type', value: 'shopType', sortable: false });
      }
      return headers;
    },
    activeFilterCount() {
      return store.state.rules.filter(r => r.active).length;
    },
    filteredRules() {
      const currentTenant = tenantStore.state.current;
      let rules = store.state.rules;
      
      // Filter by tenant - rules should be visible if they apply to current tenant
      rules = rules.filter(rule => {
        // For now, show all rules. In a real app, you'd filter based on rule applicability
        return true;
      });
      
      // Global search - search across all columns
      if (this.search) {
        const s = this.search.toLowerCase();
        rules = rules.filter(r => {
          const name = (r.name || '').toLowerCase();
          const description = (r.description || '').toLowerCase();
          const methods = this.formatPaymentMethods(r.paymentMethods || []).toLowerCase();
          const status = r.active ? 'active' : 'inactive';
          const shopType = (r.shopType || '1P').toLowerCase();
          const storeView = (r.storeView || '').toLowerCase();
          
          return name.includes(s) ||
                 description.includes(s) ||
                 methods.includes(s) ||
                 status.includes(s) ||
                 shopType.includes(s) ||
                 storeView.includes(s);
        });
      }
      
      // Filter by active status (quick filter)
      if (this.showActiveOnly) {
        rules = rules.filter(r => r.active);
      }
      
      return rules;
    },
    sortedRules() {
      return store.getters.sortItems(this.filteredRules, this.sortBy, this.sortDesc);
    },
    newRuleDialogTitle() {
      return this.newRuleDialogStep === 'preset' ? 'Load example rule' : 'New rule';
    },
    currentCountryLabel() {
      const opt = tenantStore.state.options.find(o => o.code === tenantStore.state.current);
      return opt ? opt.label : tenantStore.state.current;
    },
    presetsForCountry() {
      return getPresetsForCountry(tenantStore.state.current);
    }
  },
  methods: {
    formatPaymentMethods(methods) {
      if (!methods || !methods.length) return '—';
      return methods.map(code => {
        const gateway = store.state.gateways.find(g => g.code === code);
        return gateway ? gateway.title : code;
      }).join(', ');
    },
    formatUpdated(value) {
      if (!value) return 'never';
      const date = new Date(value);
      return isNaN(date.getTime()) ? 'unknown' : date.toLocaleString();
    },
    onFilterChange() {
      this.filtering = true;
      setTimeout(() => {
        this.filtering = false;
      }, 800);
    },
    confirmDelete(item) {
      this.toDelete = item;
      this.showDeleteConfirm = false;
      this.deleteDialog = true;
    },
    cancelDelete() {
      this.deleteDialog = false;
      this.showDeleteConfirm = false;
      this.toDelete = null;
    },
    doDelete() {
      if (this.toDelete) {
        const deletedId = this.toDelete.id;
        store.actions.deleteRule(deletedId);
        this.snackbar = { show: true, text: 'Rule deleted' };
      }
      this.deleteDialog = false;
      this.showDeleteConfirm = false;
      this.toDelete = null;
    },
    onRowClick(cellOrItem, slotOrItem) {
      // Vuetify click:row passes (cellData, slot) where slot may be { item } or the item directly
      const item = (slotOrItem && slotOrItem.item) || slotOrItem || cellOrItem;
      if (item && item.id != null) {
        this.$router.push({ name: 'PaymentRestrictionDetail', params: { id: item.id } });
      }
    },
    startNewRule(loadPreset) {
      this.newRuleDialog = false;
      this.newRuleDialogStep = 'choice';
      const route = { name: 'PaymentRestrictionCreate' };
      if (loadPreset) {
        route.query = { loadPreset: '1' };
      }
      this.$router.push(route);
    },
    closeNewRuleDialog() {
      this.newRuleDialog = false;
      this.newRuleDialogStep = 'choice';
    },
    selectPreset(preset) {
      try {
        sessionStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify({
          name: preset.name,
          description: preset.description,
          paymentMethods: preset.paymentMethods,
          groups: preset.groups
        }));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not store preset', e);
      }
      this.newRuleDialog = false;
      this.newRuleDialogStep = 'choice';
      this.$router.push({ name: 'PaymentRestrictionCreate', query: { loadPreset: '1' } });
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;
@use '@/styles/form-fields.scss';

.page-wrapper {
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

.breadcrumbs-text :deep(.v-breadcrumbs__item) {
  color: tokens.$color-text-secondary !important;
}

.breadcrumbs-text :deep(.v-breadcrumbs__divider) {
  color: tokens.$color-text-secondary !important;
}

.modal-content {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding: 24px;
}

.modal-footer-wrapper {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.modal-footer {
  padding: 16px 24px;
  min-height: 64px;
}

.chip-enabled {
  background-color: tokens.$color-green !important;
}

.chip-disabled {
  background-color: #757575 !important;
}

.search-field :deep(.v-input__slot) {
  background-color: white !important;
}

.filter-wrapper {
  background-color: white;
  border-radius: 4px;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.modal-card {
  border-radius: 12px;
  padding: tokens.$space-lg;
  margin-bottom: 20px;
  background-color: tokens.$color-surface-muted;
}

.modal-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-card__title {
  font-weight: 600;
  font-size: 16px;
}

.modal-card__subtitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 2px;
}

.modal-card__body {
  display: flex;
  flex-direction: column;
}

.status-card {
  border-radius: 12px;
  padding: tokens.$space-md;
  margin-bottom: tokens.$space-md;
  background-color: tokens.$color-surface-default;
  border: 1px solid tokens.$color-border-subtle;
}

.status-card--enabled {
  background-color: rgba(71, 133, 10, 0.08);
  border-color: rgba(71, 133, 10, 0.2);
}

.status-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgba(0, 0, 0, 0.75);
}

.status-card__body {
  display: flex;
  align-items: center;
}

.switch-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-state {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
  min-width: 76px;
}

.switch-state--on {
  color: tokens.$color-green;
}

.state-switch {
  margin: 0;
}

.builder-actions {
  display: flex;
  justify-content: flex-end;
}

.rules-table :deep(tbody tr) {
  cursor: pointer;
}

.rules-table :deep(tbody tr:hover) {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

.new-rule-dialog-text {
  font: tokens.$text-p1;
  color: tokens.$color-text-secondary;
  margin: 0 0 tokens.$space-lg 0;
}

.new-rule-dialog-actions {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
}

.new-rule-option-btn {
  justify-content: flex-start;
}

.preset-picker-header {
  display: flex;
  align-items: center;
  gap: tokens.$space-sm;
  margin-bottom: tokens.$space-lg;
}

.preset-back-btn {
  flex-shrink: 0;
}

.preset-picker-text {
  font: tokens.$text-p1;
  color: tokens.$color-text-secondary;
  margin: 0;
}

.preset-table-wrapper {
  max-height: 360px;
  overflow-y: auto;
  border: 1px solid tokens.$color-border-subtle;
  border-radius: 8px;
}

.preset-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.preset-table th {
  text-align: left;
  padding: tokens.$space-sm tokens.$space-md;
  font-weight: 600;
  color: tokens.$color-text-secondary;
  border-bottom: 1px solid tokens.$color-border-subtle;
  background: tokens.$color-surface-muted;
}

.preset-table td {
  padding: tokens.$space-md;
  border-bottom: 1px solid tokens.$color-border-subtle;
  vertical-align: middle;
}

.preset-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.preset-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.preset-row:last-child td {
  border-bottom: none;
}

.preset-name {
  font-weight: 500;
  color: tokens.$color-text-primary;
  min-width: 180px;
}

.preset-desc {
  color: tokens.$color-text-secondary;
  font-size: 13px;
}

.preset-actions {
  text-align: right;
  white-space: nowrap;
}

.preset-empty {
  font: tokens.$text-p2;
  color: tokens.$color-text-tertiary;
  margin: tokens.$space-lg 0 0 0;
}

</style>
