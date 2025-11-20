<template>
  <div class="page-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs" title="Payment restrictions overview">
      <template v-slot:actions>
        <v-btn color="primary" @click="startNewRule">
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
      class="elevation-1"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
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
        <v-btn icon @click="editRule(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="confirmDelete(item)">
          <v-icon color="red">mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- New/Edit Rule Modal -->
    <Modal v-model="ruleDialog" :title="isEditing ? 'Edit rule' : 'New rule'" @close="handleDialogClose">
      <template v-slot:content>
        <v-form ref="ruleForm" v-if="ruleForm">
          <ModalCard
            title="Rule overview"
            subtitle="Configure the basic settings and behavior for this payment restriction rule."
          >
            <StatusCard
              v-model="ruleForm.active"
              label="Status"
              enabled-label="ACTIVE"
              disabled-label="INACTIVE"
            />

                <div class="field-block">
                  <div class="control-label">Name *</div>
                  <v-text-field
                    class="form-field"
                    v-model="ruleForm.name"
                    :rules="[v=>!!v||'Required']"
                    outlined
                    hide-details="auto"
                  />
                </div>
                <div class="field-block">
                  <div class="control-label">Store view</div>
                  <v-select
                    class="form-field"
                    v-model="ruleForm.storeView"
                    :items="storeViews"
                    outlined
                    hide-details="auto"
                  />
                </div>
                <div class="field-block" v-if="showShopTypeField">
                  <div class="control-label">Shop type</div>
                  <v-select
                    class="form-field"
                    v-model="ruleForm.shopType"
                    :items="shopTypeOptions"
                    outlined
                    hide-details="auto"
                  />
                </div>
                <div class="field-block" v-if="showShopTypeField">
                  <div class="control-label">Target shop types</div>
                  <v-select
                    class="form-field"
                    v-model="ruleForm.targetShopTypes"
                    :items="shopTypeOptions"
                    multiple
                    chips
                    outlined
                    hide-details="auto"
                  />
                </div>
                <div class="field-block">
                  <div class="control-label">Payment method</div>
                  <v-autocomplete
                    class="form-field"
                    v-model="ruleForm.paymentMethods"
                    :items="availablePaymentMethods"
                    multiple
                    chips
                    outlined
                    hide-details="auto"
                  />
                </div>
                <div class="field-block">
                  <div class="control-label">Description</div>
                  <v-textarea
                    class="form-field"
                    v-model="ruleForm.description"
                    rows="2"
                    outlined
                    hide-details="auto"
                  />
                </div>
                <div class="field-block">
                  <v-checkbox v-model="ruleForm.showWhenApplied" label="Show when applied" hide-details />
                </div>
            <div class="field-block">
              <div class="control-label">Reason</div>
              <RichTextStub v-model="ruleForm.reason" />
            </div>
          </ModalCard>

          <ModalCard
            title="Condition Builder"
            subtitle="Define conditions that determine when this rule should be applied."
          >
                <div class="field-block">
                  <div class="control-label">Operator</div>
                  <v-select
                    class="form-field"
                    v-model="ruleForm.conditions.operator"
                    :items="['AND','OR']"
                    outlined
                    hide-details="auto"
                  />
                </div>
                <div v-for="(c, idx) in ruleForm.conditions.conditions" :key="idx" class="d-flex align-center mb-2">
                  <div class="field-block mr-2" style="flex: 1;">
                    <div class="control-label">Field</div>
                    <v-select
                      class="form-field"
                      :items="conditionFields"
                      v-model="c.field"
                      outlined
                      hide-details="auto"
                    />
                  </div>
                  <div class="field-block mr-2" style="flex: 1;">
                    <div class="control-label">Comparator</div>
                    <v-select
                      class="form-field"
                      :items="comparators"
                      v-model="c.comparator"
                      outlined
                      hide-details="auto"
                    />
                  </div>
                  <div class="field-block mr-2" style="flex: 1;">
                    <div class="control-label">Value</div>
                    <v-text-field
                      class="form-field"
                      v-model="c.value"
                      outlined
                      hide-details="auto"
                    />
                  </div>
                  <v-btn icon @click="ruleForm.conditions.conditions.splice(idx,1)">
                    <v-icon color="red">mdi-close</v-icon>
                  </v-btn>
                </div>
                <v-btn small outlined @click="addCondition">
                  <v-icon left>mdi-plus</v-icon>Add condition
                </v-btn>
            <v-alert class="mt-4" type="info" outlined>
              <strong>Preview:</strong> {{ previewSummary }}
            </v-alert>
          </ModalCard>
        </v-form>
      </template>
      
      <template v-slot:footer>
        <v-spacer />
        <v-btn text @click="handleDialogClose">Cancel</v-btn>
        <v-btn color="primary" @click="saveRule">Save</v-btn>
      </template>
    </Modal>

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
        <v-btn text @click="cancelDelete">Cancel</v-btn>
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

    <v-snackbar v-model="snackbar.show">
      {{ snackbar.text }}
      <v-btn text @click="snackbar.show=false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import RichTextStub from '@/components/common/RichTextStub.vue';
import QuickFilter from '@/components/common/QuickFilter.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Modal from '@/components/common/Modal.vue';
import ModalCard from '@/components/common/ModalCard.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';

export default {
  name: 'PaymentRestrictions',
  components: { RichTextStub, QuickFilter, PageHeader, Modal, ModalCard, StatusCard },
  data() {
    return {
      search: '',
      showActiveOnly: false,
      sortBy: 'updatedAt',
      sortDesc: true,
      deleteDialog: false,
      showDeleteConfirm: false,
      toDelete: null,
      snackbar: { show: false, text: '' },
      ruleDialog: false,
      ruleForm: null,
      editingId: null,
      suspendDirty: true,
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
    this.resetRuleForm();
    this.$nextTick(() => { this.suspendDirty = false; });
  },
  computed: {
    breadcrumbs() {
      return [
        { text: 'Payment methods', disabled: true },
        { text: 'Payment restrictions', disabled: true }
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
    availablePaymentMethods() {
      const currentTenant = tenantStore.state.current;
      const allMethods = store.state.gateways.map(g => ({
        text: g.title,
        value: g.code
      }));
      if (currentTenant === 'GLO') {
        return allMethods;
      }
      return allMethods.filter(m => {
        const gateway = store.state.gateways.find(g => g.code === m.value);
        if (!gateway) return false;
        return gateway.countries.includes('GLO') || gateway.countries.includes(currentTenant);
      });
    },
    methodCodes() {
      return Array.from(new Set(store.state.gateways.map(g => g.code).concat(['paypal','card','cod','bank'])));
    },
    storeViews() {
      return ['Default','Wholesale'];
    },
    filteredRules() {
      const currentTenant = tenantStore.state.current;
      let rules = store.state.rules;
      
      // Filter by tenant - rules should be visible if they apply to current tenant or GLO
      if (currentTenant !== 'GLO') {
        rules = rules.filter(rule => {
          // For now, show all rules. In a real app, you'd filter based on rule applicability
          return true;
        });
      }
      
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
    conditionFields() {
      return ['country','cartTotal','customerSegment','paymentMethod'];
    },
    comparators() {
      return ['=','!=','>','<','in','not in'];
    },
    previewSummary() {
      if (!this.ruleForm || !this.ruleForm.conditions) return '—';
      const c = this.ruleForm.conditions;
      const parts = (c.conditions || []).map(x => {
        const value = Array.isArray(x.value) ? '['+x.value.join(', ')+']' : x.value;
        return `${x.field} ${x.comparator} ${value}`;
      });
      return parts.join(` ${c.operator} `) || '—';
    },
    isEditing() {
      return !!this.editingId;
    }
  },
  watch: {
    ruleForm: {
      deep: true,
      handler() {
        if (this.suspendDirty) return;
        store.dirty.set('rulesForm', true);
      }
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
    setRuleForm(payload) {
      this.suspendDirty = true;
      this.ruleForm = JSON.parse(JSON.stringify(payload));
      if (!this.ruleForm.shopType) {
        this.ruleForm.shopType = '1P';
      }
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    resetRuleForm() {
      this.editingId = null;
      this.setRuleForm(this.buildRuleForm());
    },
    buildRuleForm() {
      return {
        active: true,
        name: '',
        storeView: 'Default',
        shopType: '1P',
        targetShopTypes: this.showShopTypeField ? ['1P'] : [],
        paymentMethods: [],
        description: '',
        showWhenApplied: false,
        reason: '',
        updatedBy: 'you',
        conditions: { operator: 'AND', conditions: [] }
      };
    },
    startNewRule() {
      this.resetRuleForm();
      store.dirty.clear('rulesForm');
      this.ruleDialog = true;
    },
    editRule(item) {
      this.editingId = item.id;
      this.setRuleForm(item);
      store.dirty.clear('rulesForm');
      this.ruleDialog = true;
    },
    handleDialogClose() {
      if (store.dirty.shouldBlockNavigation()) {
        const proceed = window.confirm('Discard unsaved changes?');
        if (!proceed) return;
      }
      this.resetRuleForm();
      store.dirty.clear('rulesForm');
      this.ruleDialog = false;
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
        if (this.editingId === deletedId) {
          this.resetRuleForm();
          store.dirty.clear('rulesForm');
          this.ruleDialog = false;
        }
        this.snackbar = { show: true, text: 'Rule deleted' };
      }
      this.deleteDialog = false;
      this.showDeleteConfirm = false;
      this.toDelete = null;
    },
    addCondition() {
      this.ruleForm.conditions.conditions.push({ field: 'country', comparator: '=', value: '' });
    },
    saveRule() {
      if (!this.$refs.ruleForm || !this.$refs.ruleForm.validate()) {
        this.snackbar = { show: true, text: 'Please fill in all required fields' };
        return;
      }
      if (!this.ruleForm.name) {
        this.snackbar = { show: true, text: 'Name is required' };
        return;
      }
      try {
        if (this.editingId) {
          store.actions.updateRule(this.editingId, this.ruleForm);
        } else {
          const created = store.actions.createRule(this.ruleForm);
          this.editingId = created.id;
        }
        store.dirty.clear('rulesForm');
        this.resetRuleForm();
        this.snackbar = { show: true, text: 'Rule saved' };
        this.ruleDialog = false;
      } catch(e) {
        this.snackbar = { show: true, text: e.message || 'Save failed' };
      }
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

</style>
