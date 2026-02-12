<template>
  <div class="payment-restriction-detail-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <SecondaryButton text @click="handleCancel">Cancel</SecondaryButton>
        <v-btn v-if="!isCreate" text color="red" @click="showDeleteConfirm = true" class="ml-2">
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
        <PrimaryButton @click="handleSave" :loading="saving" class="ml-2">
          <v-icon left>mdi-check</v-icon>
          Save
        </PrimaryButton>
      </template>
    </PageHeader>

    <div v-if="ruleForm" class="payment-restriction-content">
      <v-row>
        <v-col cols="12" md="8" offset-md="0">
          <v-form ref="ruleFormRef" v-model="formValid">
            <section class="section-block">
              <h2 class="h2 section-title">Rule overview</h2>
              
              <div class="field-block">
                <div class="control-label">Name *</div>
                <v-text-field
                  class="form-field"
                  v-model="ruleForm.name"
                  :rules="[v=>!!v||'Required']"
                  dense
                  outlined
                  hide-details="auto"
                />
              </div>

              <StatusCard
                v-model="ruleForm.active"
                label="Status"
                enabled-label="ACTIVE"
                disabled-label="INACTIVE"
              />

              <div class="field-block">
                <div class="control-label">Payment method</div>
                <v-autocomplete
                  class="form-field"
                  v-model="ruleForm.paymentMethods"
                  :items="availablePaymentMethods"
                  multiple
                  chips
                  small-chips
                  dense
                  outlined
                  hide-details="auto"
                />
              </div>

              <div class="field-block">
                <div class="control-label">Description</div>
                <div class="control-label-secondary">This is only internal and will serve for your purposes</div>
                <v-textarea
                  class="form-field description-textarea"
                  v-model="ruleForm.description"
                  dense
                  outlined
                  hide-details="auto"
                />
              </div>

              <div class="field-block">
                <div class="control-label">Reason (shown to customer when payment method is disabled)</div>
                <RichTextStub v-model="ruleForm.reason" />
              </div>

              <div class="field-block">
                <v-checkbox 
                  v-model="ruleForm.showWhenApplied" 
                  label="Display reason to customer" 
                  color="primary"
                  hide-details 
                />
              </div>
            </section>

            <section class="section-block">
              <h2 class="h2 section-title">Condition Builder</h2>
              
              <div class="builder-actions mb-4">
                <SecondaryButton small @click="loadSampleRules">
                  <v-icon left small>mdi-file-document-outline</v-icon>
                  Load sample rules
                </SecondaryButton>
              </div>
              <PaymentRestrictionBuilder v-model="ruleForm.groups" />
              <v-alert class="mt-4" type="info" outlined>
                <strong>Preview:</strong> {{ previewSummary }}
              </v-alert>
            </section>
          </v-form>
        </v-col>
      </v-row>
    </div>

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
          Are you sure you want to delete <strong>{{ ruleForm && ruleForm.name }}</strong>?
        </div>
      </template>
      
      <template v-slot:footer>
        <v-spacer />
        <SecondaryButton text @click="cancelDelete">Cancel</SecondaryButton>
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
      <SecondaryButton text @click="snackbar.show=false">Close</SecondaryButton>
    </v-snackbar>
  </div>
</template>

<script>
import RichTextStub from '@/components/common/RichTextStub.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Modal from '@/components/common/Modal.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import PaymentRestrictionBuilder from '@/components/payments/PaymentRestrictionBuilder.vue';
import PrimaryButton from '@/components/common/PrimaryButton.vue';
import SecondaryButton from '@/components/common/SecondaryButton.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';
import { createConditionGroup, createCondition } from '@/utils/paymentRestrictionTypes';
import { getConditionTypeLabel, getOperatorLabel, getOptionsForType } from '@/utils/conditionConfig';

export default {
  name: 'PaymentRestrictionDetail',
  components: { RichTextStub, PageHeader, Modal, StatusCard, PaymentRestrictionBuilder, PrimaryButton, SecondaryButton },
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      ruleForm: null,
      suspendDirty: true,
      formValid: false,
      saving: false,
      snackbar: { show: false, text: '' },
      deleteDialog: false,
      showDeleteConfirm: false
    };
  },
  computed: {
    isCreate() {
      return !this.id || this.id === 'create';
    },
    breadcrumbs() {
      const crumbs = [
        { text: 'Payment methods', disabled: false, to: { name: 'PaymentRestrictions' } },
        { text: 'Payment restrictions', disabled: false, to: { name: 'PaymentRestrictions' } }
      ];
      if (this.isCreate) {
        crumbs.push({ text: 'New rule', disabled: true });
      } else {
        crumbs.push({ text: this.ruleForm?.name || 'Edit rule', disabled: true });
      }
      return crumbs;
    },
    availablePaymentMethods() {
      const currentTenant = tenantStore.state.current;
      const allMethods = store.state.gateways.map(g => ({
        text: g.title,
        value: g.code
      }));
      return allMethods.filter(m => {
        const gateway = store.state.gateways.find(g => g.code === m.value);
        if (!gateway) return false;
        return gateway.countries.includes(currentTenant);
      });
    },
    previewSummary() {
      if (!this.ruleForm || !this.ruleForm.groups || !this.ruleForm.groups.length) return '—';
      
      const groups = this.ruleForm.groups.filter(g => g.conditions && g.conditions.length > 0);
      if (groups.length === 0) return '—';
      
      const groupSummaries = groups.map(group => {
        const conditionParts = group.conditions
          .filter(c => c.type && c.operator && c.value !== null && c.value !== undefined && c.value !== '')
          .map(cond => {
            const typeLabel = getConditionTypeLabel(cond.type);
            const operatorLabel = getOperatorLabel(cond.type, cond.operator);
            let valueLabel = this.formatConditionValue(cond.type, cond.value);
            
            return `${typeLabel} ${operatorLabel} ${valueLabel}`;
          });
        
        return conditionParts.join(' AND ');
      });
      
      return groupSummaries.join(' OR ') || '—';
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
  created() {
    this.initializeForm();
  },
  methods: {
    initializeForm() {
      if (this.isCreate) {
        this.resetRuleForm();
      } else {
        const rule = store.state.rules.find(r => r.id === this.id);
        if (rule) {
          this.setRuleForm(rule);
        } else {
          this.snackbar = { show: true, text: 'Rule not found' };
          this.$router.push({ name: 'PaymentRestrictions' });
        }
      }
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    setRuleForm(payload) {
      this.suspendDirty = true;
      this.ruleForm = JSON.parse(JSON.stringify(payload));
      // Ensure groups exist (for migrated rules)
      if (!this.ruleForm.groups || !Array.isArray(this.ruleForm.groups) || this.ruleForm.groups.length === 0) {
        this.ruleForm.groups = [createConditionGroup()];
      }
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    resetRuleForm() {
      this.setRuleForm(this.buildRuleForm());
    },
    buildRuleForm() {
      return {
        active: true,
        name: '',
        paymentMethods: [],
        description: '',
        showWhenApplied: false,
        reason: '',
        updatedBy: 'you',
        groups: [createConditionGroup()]
      };
    },
    formatConditionValue(conditionType, value) {
      if (value === null || value === undefined || value === '') return '';
      
      // Handle between operator (object with min/max)
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        if (value.min !== undefined && value.max !== undefined) {
          return `${value.min} - ${value.max}`;
        }
        return '';
      }
      
      // Get options for this condition type to map values to labels
      const options = getOptionsForType(conditionType);
      const optionMap = {};
      if (options && Array.isArray(options)) {
        options.forEach(opt => {
          optionMap[opt.value] = opt.label;
        });
      }
      
      // Handle arrays (multiselect values)
      if (Array.isArray(value)) {
        return value.map(v => {
          // Handle boolean values
          if (typeof v === 'boolean') {
            return v ? 'Yes' : 'No';
          }
          return optionMap[v] || String(v);
        }).join(', ');
      }
      
      // Handle boolean values
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      // Handle single values
      return optionMap[value] || String(value);
    },
    loadSampleRules() {
      const samples = [
        {
          name: 'Disable Stripe for zero amount orders',
          groups: [createConditionGroup()],
          description: 'Disable Stripe when Amount = 0 AND Shipping method is Click & Collect AND Order type is MarketplaceMix'
        },
        {
          name: 'COD only below 1200',
          groups: [createConditionGroup()],
          description: 'Restrict COD when Payment amount is above 1200'
        },
        {
          name: 'Stripe disabled for 0 CZK orders',
          groups: [createConditionGroup()],
          description: 'Disable Stripe when Payment amount = 0'
        },
        {
          name: 'COD only for logged-in users',
          groups: [createConditionGroup()],
          description: 'Disable COD when Customer type is Guest'
        },
        {
          name: 'PayPal disabled when Gift Card is applied',
          groups: [createConditionGroup()],
          description: 'Disable PayPal when Gift Card applied is Yes'
        }
      ];

      // Sample 1: Disable Stripe when Amount = 0 AND Shipping method is Click & Collect AND Order type is MarketplaceMix
      samples[0].groups[0].conditions = [
        { ...createCondition('PAYMENT_AMOUNT'), operator: 'equals_zero', value: 0 },
        { ...createCondition('SHIPPING_METHOD'), operator: 'includes', value: ['click_collect'] },
        { ...createCondition('ORDER_TYPE'), operator: 'is', value: 'marketplace_mix' }
      ];

      // Sample 2: COD only below 1200 (Payment amount above 1200)
      samples[1].groups[0].conditions = [
        { ...createCondition('PAYMENT_AMOUNT'), operator: 'above', value: 1200 }
      ];

      // Sample 3: Stripe disabled for 0 CZK orders
      samples[2].groups[0].conditions = [
        { ...createCondition('PAYMENT_AMOUNT'), operator: 'equals_zero', value: 0 }
      ];

      // Sample 4: COD only for logged-in users (disable when Guest)
      samples[3].groups[0].conditions = [
        { ...createCondition('CUSTOMER_TYPE'), operator: 'is', value: 'guest' }
      ];

      // Sample 5: PayPal disabled when Gift Card is applied
      samples[4].groups[0].conditions = [
        { ...createCondition('GIFT_CARD_APPLIED'), operator: 'is', value: true }
      ];

      // Show a menu to select which sample to load
      const selected = window.prompt(
        'Select a sample rule to load:\n\n' +
        '1. Disable Stripe for zero amount orders\n' +
        '2. COD only below 1200\n' +
        '3. Stripe disabled for 0 CZK orders\n' +
        '4. COD only for logged-in users\n' +
        '5. PayPal disabled when Gift Card is applied\n\n' +
        'Enter number (1-5):'
      );

      const index = parseInt(selected) - 1;
      if (index >= 0 && index < samples.length) {
        const sample = samples[index];
        this.ruleForm.groups = JSON.parse(JSON.stringify(sample.groups));
        if (!this.ruleForm.name) {
          this.ruleForm.name = sample.name;
        }
        if (!this.ruleForm.description) {
          this.ruleForm.description = sample.description;
        }
        this.snackbar = { show: true, text: `Loaded sample: ${sample.name}` };
      }
    },
    handleCancel() {
      if (store.dirty.shouldBlockNavigation()) {
        const proceed = window.confirm('Discard unsaved changes?');
        if (!proceed) return;
      }
      store.dirty.clear('rulesForm');
      this.$router.push({ name: 'PaymentRestrictions' });
    },
    handleSave() {
      if (!this.$refs.ruleFormRef || !this.$refs.ruleFormRef.validate()) {
        this.snackbar = { show: true, text: 'Please fill in all required fields' };
        return;
      }
      if (!this.ruleForm.name) {
        this.snackbar = { show: true, text: 'Name is required' };
        return;
      }
      // Validate that at least one group has at least one condition
      const hasValidConditions = this.ruleForm.groups && this.ruleForm.groups.some(group =>
        group.conditions && group.conditions.some(cond =>
          cond.type && cond.operator && cond.value !== null && cond.value !== undefined && cond.value !== ''
        )
      );
      if (!hasValidConditions) {
        this.snackbar = { show: true, text: 'At least one condition is required' };
        return;
      }
      
      this.saving = true;
      try {
        if (this.isCreate) {
          const created = store.actions.createRule(this.ruleForm);
          this.snackbar = { show: true, text: 'Rule created' };
          store.dirty.clear('rulesForm');
          this.$router.push({ name: 'PaymentRestrictionDetail', params: { id: created.id } });
        } else {
          store.actions.updateRule(this.id, this.ruleForm);
          this.snackbar = { show: true, text: 'Rule updated' };
          store.dirty.clear('rulesForm');
        }
      } catch(e) {
        this.snackbar = { show: true, text: e.message || 'Save failed' };
      } finally {
        this.saving = false;
      }
    },
    cancelDelete() {
      this.deleteDialog = false;
      this.showDeleteConfirm = false;
    },
    doDelete() {
      if (!this.ruleForm) return;
      try {
        store.actions.deleteRule(this.id);
        this.snackbar = { show: true, text: 'Rule deleted' };
        store.dirty.clear('rulesForm');
        this.deleteDialog = false;
        this.$router.push({ name: 'PaymentRestrictions' });
      } catch(e) {
        this.snackbar = { show: true, text: e.message || 'Delete failed' };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;
@use '@/styles/form-fields.scss';

.payment-restriction-detail-wrapper {
  padding: tokens.$space-lg;
}

.payment-restriction-content {
  margin-top: tokens.$space-lg;
}

.section-block {
  margin-bottom: tokens.$space-4xl;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  margin-bottom: tokens.$space-xl;
  margin-top: 0;
  padding-bottom: tokens.$space-md;
  border-bottom: 1px solid tokens.$color-border-subtle;
}

.field-block {
  margin-bottom: tokens.$space-xl !important;
  
  &:last-child {
    margin-bottom: 0 !important;
  }
}

.control-label-secondary {
  font-size: 12px;
  color: tokens.$color-text-tertiary;
  margin-bottom: tokens.$space-sm;
  margin-top: -4px;
}

.description-textarea {
  min-height: 120px;
  
  :deep(.v-input__control textarea) {
    min-height: 120px !important;
  }
}

.builder-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: tokens.$space-lg;
}
</style>
