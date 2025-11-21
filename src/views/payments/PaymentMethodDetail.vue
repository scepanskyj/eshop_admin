<template>
  <div class="payment-method-detail-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <v-btn text @click="handleCancel">Cancel</v-btn>
        <v-btn v-if="!isCreate && canDelete" text color="red" @click="showDeleteConfirm = true" class="ml-2">
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
        <v-btn color="primary" @click="handleSave" :loading="saving" class="ml-2">
          <v-icon left>mdi-check</v-icon>
          Save
        </v-btn>
      </template>
    </PageHeader>

    <div v-if="form" class="payment-method-content">
      <v-row>
        <v-col cols="12" md="8" offset-md="0">
          <!-- Basic Information -->
          <ModalCard title="Payment Method">
            <StatusCard v-model="form.enabled" />

            <div class="field-block">
              <div class="control-label">Title *</div>
              <v-text-field
                class="form-field"
                v-model="form.title"
                outlined
                hide-details="auto"
                :rules="[requiredRule]"
              />
            </div>

            <div class="field-block">
              <div class="control-label">Icon</div>
              <IconUpload
                v-model="form.icon"
                :disabled="saving"
              />
            </div>

            <div class="field-block">
              <div class="control-label">Disabled Icon</div>
              <IconUpload
                v-model="form.disabledIcon"
                :disabled="saving"
              />
              <div class="field-hint">Icon to display when this payment method is disabled</div>
            </div>

            <div class="field-block">
              <div class="control-label">Description</div>
              <v-textarea
                class="form-field"
                v-model="form.description"
                outlined
                rows="3"
                hide-details="auto"
                placeholder="Enter description for this payment method"
              />
            </div>

            <div class="field-block">
              <div class="control-label">Position in checkout list</div>
              <v-text-field
                class="form-field"
                v-model.number="form.sortOrder"
                outlined
                type="number"
                hide-details="auto"
                :rules="[sortOrderRule]"
                hint="Lower numbers appear first (min: 1, max: current maximum)"
                persistent-hint
              />
            </div>

            <div class="field-block">
              <div class="control-label">Gateway</div>
              <v-select
                class="form-field"
                v-model="form.gatewayCode"
                :items="gatewayOptions"
                outlined
                hide-details="auto"
                placeholder="Select a gateway"
              >
                <template v-slot:item="{ item }">
                  <div class="d-flex align-center">
                    <span>{{ item.text }}</span>
                    <v-chip v-if="item.enabled === false" x-small color="grey" text-color="white" class="ml-2">Disabled</v-chip>
                  </div>
                </template>
                <template v-slot:selection="{ item }">
                  <span>{{ item ? item.text : '' }}</span>
                </template>
              </v-select>
            </div>
          </ModalCard>

          <!-- Payment Fee Settings -->
          <ModalCard title="Payment Fee">
            <div class="field-block">
              <v-checkbox
                v-model="form.feeEnabled"
                label="Enable payment fee for this method"
                hide-details
              />
            </div>

            <template v-if="form.feeEnabled">
              <div class="field-block fee-amount-field">
                <div class="control-label">Fee Amount *</div>
                <v-text-field
                  class="form-field"
                  v-model.number="form.feeSettings.amount"
                  outlined
                  type="number"
                  step="0.01"
                  hide-details="auto"
                  :rules="[v => form.feeEnabled ? (v > 0 || 'Fee amount is required') : true]"
                  :suffix="form.currency"
                />
              </div>

              <div class="field-flex">
                <div class="field-block">
                  <div class="control-label">Min Order Amount</div>
                  <v-text-field
                    class="form-field"
                    v-model.number="form.feeSettings.minOrderAmount"
                    outlined
                    type="number"
                    step="0.01"
                    hide-details="auto"
                    :suffix="form.currency"
                    hint="Minimum order amount to apply payment fee"
                    persistent-hint
                  />
                </div>

                <div class="field-block">
                  <div class="control-label">Max Order Amount</div>
                  <v-text-field
                    class="form-field"
                    v-model.number="form.feeSettings.maxOrderAmount"
                    outlined
                    type="number"
                    step="0.01"
                    hide-details="auto"
                    :suffix="form.currency"
                    hint="Maximum order amount to apply payment fee"
                    persistent-hint
                  />
                </div>
              </div>

              <div class="field-block">
                <v-checkbox
                  v-model="form.feeSettings.refundable"
                  label="Refund fee when order is refunded"
                  hide-details
                />
              </div>

              <div class="field-block">
                <div class="control-label">Apply Payment Fee For Specific Customers</div>
                <v-select
                  class="form-field"
                  v-model="form.feeSettings.customerTypes"
                  :items="customerTypeOptions"
                  multiple
                  chips
                  small-chips
                  outlined
                  hide-details="auto"
                />
              </div>

              <div class="field-block">
                <div class="control-label">Tax Settings</div>
                <v-checkbox
                  v-model="form.feeSettings.taxSettings.calculateTax"
                  label="Calculate tax"
                  hide-details
                  class="mt-2"
                />
                <v-checkbox
                  v-model="form.feeSettings.taxSettings.feeContainsTax"
                  label="Fee already contains tax"
                  hide-details
                />
              </div>
            </template>
          </ModalCard>
        </v-col>
      </v-row>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Modal v-model="showDeleteConfirm" title="Delete payment method" max-width="520" @close="showDeleteConfirm = false">
      <template v-slot:content>
        <v-alert
          v-if="showDeleteConfirmation"
          type="error"
          outlined
          dense
          class="mb-4"
          dismissible
          @input="showDeleteConfirmation = false"
        >
          <strong>Warning:</strong> Deleting this payment method is irreversible. Click "Confirm delete" below to proceed.
        </v-alert>
        
        <div class="text-body-1 mb-2">
          Are you sure you want to delete <strong>{{ form && form.title }}</strong>?
        </div>
      </template>
      
      <template v-slot:footer>
        <v-spacer />
        <v-btn text @click="showDeleteConfirm = false; showDeleteConfirmation = false">Cancel</v-btn>
        <v-btn
          v-if="!showDeleteConfirmation"
          outlined
          color="red"
          @click="showDeleteConfirmation = true"
        >
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
        <v-btn
          v-else
          color="red"
          dark
          @click="handleDelete"
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
import PageHeader from '@/components/common/PageHeader.vue';
import ModalCard from '@/components/common/ModalCard.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import IconUpload from '@/components/common/IconUpload.vue';
import Modal from '@/components/common/Modal.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';
import roleStore from '@/store/roleStore';
import { getCurrencyForCountry } from '@/utils/currencies';

let previousTenant = tenantStore.state.current;

const DETAIL_DEFAULTS = {
  mid: '',
  url: '',
  keysPath: '',
  privateKey: '',
  publicKey: '',
  successUrl: '',
  failUrl: '',
  terminalDomain: '',
  sendCartDescription: true,
  allowPrelive: false,
  externalGuid: ''
};

function buildPaymentMethodTemplate(countryCode) {
  const currency = getCurrencyForCountry(countryCode);
  return {
    code: '',
    title: '',
    description: '',
    icon: '',
    disabledIcon: '',
    enabled: true,
    sortOrder: 0,
    countryCode: countryCode || tenantStore.state.current,
    currency,
    updatedAt: new Date().toISOString(),
    countries: [countryCode || tenantStore.state.current],
    feeEnabled: false,
    feeSettings: {
      priceType: 'Fixed price',
      minAmount: 0,
      maxAmount: 9999,
      refundable: false,
      amount: 0,
      minOrderAmount: 0,
      maxOrderAmount: 0,
      currency,
      customerTypes: [],
      taxSettings: {
        calculateTax: false,
        feeContainsTax: false
      }
    },
    gatewayEnabled: false,
    gatewayCode: '',
    details: {}
  };
}

export default {
  name: 'PaymentMethodDetail',
  components: { PageHeader, ModalCard, StatusCard, IconUpload, Modal },
  props: {
    code: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      form: null,
      original: null,
      saving: false,
      showDeleteConfirm: false,
      showDeleteConfirmation: false,
      snackbar: { show: false, text: '' },
      suspendDirty: true,
      previousTenant: tenantStore.state.current
    };
  },
  computed: {
    isCreate() {
      return !this.code;
    },
    canDelete() {
      return roleStore.getters.canDelete();
    },
    breadcrumbs() {
      const baseTitle = this.isCreate ? 'Create payment method' : 'Edit payment method';
      const title = this.form && this.form.title ? `${baseTitle} - ${this.form.title}` : baseTitle;
      return [
        { text: 'Payment section', disabled: true },
        { text: 'Payment methods', to: { name: 'PaymentMethodsOverview' } },
        { text: title, disabled: true }
      ];
    },
    gatewayOptions() {
      const gateways = store.state.gatewaysOnly.map(gateway => ({
        text: gateway.title || gateway.code,
        value: gateway.code,
        enabled: gateway.enabled
      }));
      // Add "No gateway" option at the beginning
      return [
        { text: 'No gateway', value: null },
        ...gateways
      ];
    },
    customerTypeOptions() {
      return [
        { text: 'Logged in user', value: 'logged_in' },
        { text: 'Not logged in', value: 'guest' },
        { text: 'Wholesale', value: 'wholesale' }
      ];
    },
    requiredRule() {
      return v => !!v || 'This field is required';
    },
    currentTenant() {
      return tenantStore.state.current;
    },
    maxSortOrder() {
      // Get the maximum sortOrder from all payment methods
      const gateways = store.state.gateways || [];
      if (gateways.length === 0) return 1;
      const maxOrder = Math.max(...gateways.map(g => g.sortOrder || 0));
      return Math.max(maxOrder, 1); // Ensure at least 1
    },
    sortOrderRule() {
      return v => {
        if (v === null || v === undefined || v === '') return true; // Allow empty
        const num = Number(v);
        if (isNaN(num)) return 'Must be a number';
        if (num < 1) return 'Position must be at least 1';
        if (num > this.maxSortOrder) return `Position cannot exceed ${this.maxSortOrder} (current maximum)`;
        return true;
      };
    }
  },
  watch: {
    form: {
      handler() {
        if (this.suspendDirty) return;
        store.dirty.set('paymentMethodDetail', true);
      },
      deep: true
    },
    currentTenant: {
      handler(newTenant, oldTenant) {
        // Redirect to overview when tenant changes while editing
        if (oldTenant && newTenant !== oldTenant) {
          if (store.dirty.state._dirty.paymentMethodDetail) {
            const proceed = window.confirm('Tenant changed. Discard unsaved changes and return to overview?');
            if (!proceed) return;
          }
          store.dirty.clear('paymentMethodDetail');
          this.$router.push({ name: 'PaymentMethodsOverview' });
        }
      }
    }
  },
  created() {
    this.initializeForm();
    this.$nextTick(() => {
      this.suspendDirty = false;
    });
  },
  methods: {
    initializeForm() {
      if (this.isCreate) {
        const countryCode = tenantStore.state.current;
        this.form = buildPaymentMethodTemplate(countryCode);
        this.original = JSON.parse(JSON.stringify(this.form));
      } else {
        const gateway = store.state.gateways.find(g => g.code === this.code);
        if (!gateway) {
          this.$router.push({ name: 'PaymentMethodsOverview' });
          return;
        }
        this.form = this.ensureDefaults(JSON.parse(JSON.stringify(gateway)));
        this.original = JSON.parse(JSON.stringify(this.form));
      }
    },
    ensureDefaults(gateway) {
      // Ensure all new fields exist
      if (!gateway.description) gateway.description = '';
      if (!gateway.icon) gateway.icon = '';
      if (!gateway.disabledIcon) gateway.disabledIcon = '';
      if (!gateway.countryCode) gateway.countryCode = tenantStore.state.current;
      if (!gateway.currency) gateway.currency = getCurrencyForCountry(gateway.countryCode);

      // Ensure fee settings
      if (gateway.feeEnabled === undefined) gateway.feeEnabled = false;
      if (!gateway.feeSettings) {
        gateway.feeSettings = {
          priceType: 'Fixed price',
          minAmount: 0,
          maxAmount: 9999,
          refundable: false,
          amount: 0,
          minOrderAmount: 0,
          maxOrderAmount: 0,
          currency: gateway.currency,
          customerTypes: [],
          taxSettings: {
            calculateTax: false,
            feeContainsTax: false
          }
        };
      }
      // Ensure minOrderAmount and maxOrderAmount exist
      if (gateway.feeSettings.minOrderAmount === undefined) gateway.feeSettings.minOrderAmount = 0;
      if (gateway.feeSettings.maxOrderAmount === undefined) gateway.feeSettings.maxOrderAmount = 0;

      // Ensure gateway code
      if (!gateway.gatewayCode) gateway.gatewayCode = '';
      if (!gateway.details) gateway.details = {};

      return gateway;
    },
    handleCancel() {
      // Always clear ALL dirty flags to prevent router guard from blocking
      store.dirty.clearAll();
      // Navigate back to payment methods list
      this.$router.push({ name: 'PaymentMethodsOverview' });
    },
    async handleSave() {
      if (!this.form.title || !this.form.title.trim()) {
        this.snackbar = { show: true, text: 'Title is required' };
        return;
      }

      this.saving = true;
      try {
        const payload = {
          ...this.form,
          title: this.form.title.trim(),
          code: this.form.code || `pm-${Date.now()}`
        };

        if (this.isCreate) {
          store.actions.createGateway(payload);
          this.snackbar = { show: true, text: 'Payment method created' };
        } else {
          store.actions.updateGateway(this.code, payload);
          this.snackbar = { show: true, text: 'Payment method updated' };
        }

        store.dirty.clear('paymentMethodDetail');
        setTimeout(() => {
          this.$router.push({ name: 'PaymentMethodsOverview' });
        }, 1000);
      } catch (error) {
        this.snackbar = { show: true, text: error.message || 'Unable to save payment method' };
      } finally {
        this.saving = false;
      }
    },
    async handleDelete() {
      this.saving = true;
      try {
        store.actions.deleteGateway(this.code);
        this.snackbar = { show: true, text: 'Payment method deleted' };
        store.dirty.clear('paymentMethodDetail');
        setTimeout(() => {
          this.$router.push({ name: 'PaymentMethodsOverview' });
        }, 1000);
      } catch (error) {
        this.snackbar = { show: true, text: error.message || 'Unable to delete payment method' };
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;
@use '@/styles/form-fields.scss';

.payment-method-detail-wrapper {
  background-color: tokens.$color-surface-muted;
  min-height: calc(100vh - 64px);
  padding: tokens.$space-md;
}

.payment-method-content {
  padding: 0;
}

.field-block {
  margin-bottom: tokens.$space-md;
}

.control-label {
  font-weight: 500;
  margin-bottom: tokens.$space-xs;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}

.form-field {
  width: 100%;
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

// Payment Fee accordions - nested within white card
:deep(.payment-fee-accordions .v-expansion-panels) {
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.payment-fee-accordions .v-expansion-panel) {
  box-shadow: none !important;
  border: 1px solid tokens.$color-border-subtle !important;
  border-radius: 8px !important;
  margin-bottom: tokens.$space-md !important;
  background-color: tokens.$color-surface-default !important;
}

:deep(.payment-fee-accordions .v-expansion-panel:before) {
  box-shadow: none !important;
}

:deep(.payment-fee-accordions .v-expansion-panel-header) {
  padding: tokens.$space-md tokens.$space-lg !important;
}

:deep(.payment-fee-accordions .v-expansion-panel-content) {
  padding: 0 tokens.$space-lg tokens.$space-lg tokens.$space-lg !important;
}


.field-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 4px;
}

.field-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: tokens.$space-lg;
}

.field-flex .field-block {
  flex: 1 1 240px;
  margin-bottom: 0;
}

.fee-amount-field :deep(.v-input) {
  max-width: 50%;
}

// Truncate breadcrumb title if too long
:deep(.v-breadcrumbs__item:last-child) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

// Ensure h1 title truncates properly
.payment-method-detail-wrapper :deep(h1) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>

