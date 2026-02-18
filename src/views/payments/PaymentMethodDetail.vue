<template>
  <div class="payment-method-detail-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <TertiaryButton text @click="handleCancel">Cancel</TertiaryButton>
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
        <v-col cols="12" md="8" offset-md="0" class="content-col">
          <ModalCard title="Status">
            <StatusCard v-model="form.enabled" hide-label enabled-label="Enabled" disabled-label="Disabled" />
          </ModalCard>

          <!-- Basic Information -->
          <ModalCard title="Payment Method">
            <div class="field-block">
              <Label>Title <span class="required-asterisk">*</span></Label>
              <v-text-field
                class="form-field"
                v-model="form.title"
                dense
                outlined
                hide-details="auto"
                :rules="[requiredRule]"
              />
            </div>

            <div class="field-block">
              <Label>Icon</Label>
              <HintText>SVG format, 1:1 ratio recommended</HintText>
              <IconUpload
                v-model="form.icon"
                :disabled="saving"
              />
            </div>

            <div class="field-block">
              <Label>Disabled Icon</Label>
              <HintText>Icon to display when this payment method is disabled</HintText>
              <IconUpload
                v-model="form.disabledIcon"
                :disabled="saving"
              />
            </div>

            <div class="field-block">
              <Label>Description</Label>
              <HintText>This will be shown to the customer in the checkout</HintText>
              <v-textarea
                class="form-field"
                v-model="form.description"
                dense
                outlined
                rows="3"
                hide-details="auto"
                placeholder="Enter description for this payment method"
              />
            </div>

            <div class="field-block">
              <Label>Position in checkout list</Label>
              <v-text-field
                class="form-field"
                v-model.number="form.sortOrder"
                dense
                outlined
                type="number"
                hide-details="auto"
                :rules="[sortOrderRule]"
              />
            </div>

            <div v-if="canAccessGatewayConfig" class="field-block">
              <v-checkbox
                v-model="form.needsGatewayConfig"
                label="Gateway configuration is needed"
                hide-details
              />
              <HintText>Enable this if this payment method requires gateway configuration (e.g., Stripe, Klarna)</HintText>
            </div>

            <template v-if="form.needsGatewayConfig && shouldShowStripeTitle">
              <div class="field-block">
                <Label>Stripe title</Label>
                <HintText>Text shown in Stripe gateway as title</HintText>
                <v-text-field
                  class="form-field"
                  v-model="form.stripeTitle"
                  dense
                  outlined
                  hide-details="auto"
                  placeholder="Text shown in Stripe gateway as title"
                />
              </div>
            </template>
          </ModalCard>

          <!-- Gateway Configuration (Developer/Admin only) -->
          <ModalCard v-if="form.needsGatewayConfig && canAccessGatewayConfig" title="Gateway Configuration">
            <div class="field-block">
              <Label>Configuration (JSON) <span class="required-asterisk">*</span></Label>
              <HintText>Enter gateway configuration as JSON.</HintText>
              <v-textarea
                class="form-field json-editor"
                v-model="form.gatewayConfig"
                dense
                outlined
                rows="20"
                hide-details="auto"
                placeholder='{"key": "value"}'
                :rules="[jsonRule]"
              />
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
              <div class="field-block fee-amount-field fee-input-field">
                <Label>Fee Amount <span class="required-asterisk">*</span></Label>
                <v-text-field
                  class="form-field"
                  v-model.number="form.feeSettings.amount"
                  dense
                  outlined
                  type="number"
                  step="0.01"
                  hide-details="auto"
                  :rules="[v => form.feeEnabled ? (v > 0 || 'Fee amount is required') : true]"
                  :suffix="form.currency"
                />
              </div>

              <div class="field-flex">
                <div class="field-block fee-input-field">
                  <Label>Min Order Amount</Label>
                  <HintText>Minimum order amount to apply payment fee</HintText>
                  <v-text-field
                    class="form-field"
                    v-model.number="form.feeSettings.minOrderAmount"
                    dense
                    outlined
                    type="number"
                    step="0.01"
                    hide-details="auto"
                    :suffix="form.currency"
                  />
                </div>

                <div class="field-block fee-input-field">
                  <Label>Max Order Amount</Label>
                  <HintText>Maximum order amount to apply payment fee</HintText>
                  <v-text-field
                    class="form-field"
                    v-model.number="form.feeSettings.maxOrderAmount"
                    dense
                    outlined
                    type="number"
                    step="0.01"
                    hide-details="auto"
                    :suffix="form.currency"
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

              <div class="field-block fee-input-field">
                <Label>Apply Payment Fee For Specific Customers</Label>
                <HintText>If left blank, the fee applies to all customers.</HintText>
                <v-select
                  class="form-field"
                  v-model="form.feeSettings.customerTypes"
                  :items="customerTypeOptions"
                  multiple
                  chips
                  small-chips
                  dense
                  outlined
                  hide-details="auto"
                />
              </div>

              <div class="field-block">
                <Label>Tax Settings</Label>
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
        <TertiaryButton text @click="showDeleteConfirm = false; showDeleteConfirmation = false">Cancel</TertiaryButton>
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
      <TertiaryButton text @click="snackbar.show=false">Close</TertiaryButton>
    </v-snackbar>
  </div>
</template>

<script>
import PageHeader from '@/components/common/PageHeader.vue';
import ModalCard from '@/components/common/ModalCard.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import IconUpload from '@/components/common/IconUpload.vue';
import Modal from '@/components/common/Modal.vue';
import TertiaryButton from '@/components/common/TertiaryButton.vue';
import Label from '@/components/common/Label.vue';
import HintText from '@/components/common/HintText.vue';
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
    needsGatewayConfig: false,
    stripeTitle: '',
    gatewayConfig: ''
  };
}

export default {
  name: 'PaymentMethodDetail',
  components: { PageHeader, ModalCard, StatusCard, IconUpload, Modal, TertiaryButton, Label, HintText },
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
    canAccessGatewayConfig() {
      return roleStore.getters.canCreate(); // Only developers and admins
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
    },
    jsonRule() {
      return v => {
        if (!this.form.needsGatewayConfig) return true;
        if (!v || !v.trim()) return 'Gateway configuration is required when gateway config is needed';
        try {
          JSON.parse(v);
          return true;
        } catch (e) {
          return 'Invalid JSON format';
        }
      };
    },
    shouldShowStripeTitle() {
      if (!this.form || !this.form.title) return false;
      
      // List of card payment method titles that should show Stripe title field
      const cardPaymentTitles = [
        'Carte di credito, Apple Pay, Google Pay',
        'Blik / Karty / Apple Pay / Google Pay',
        'Kartou online',
        'Online platba kartou / Apple Pay / GooglePay',
        'Plata cu cardul.'
      ];
      
      return cardPaymentTitles.includes(this.form.title);
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
  async created() {
    try {
      await this.initializeForm();
      this.$nextTick(() => {
        this.suspendDirty = false;
      });
    } catch (error) {
      console.error('Failed to initialize form:', error);
      this.$router.push({ name: 'PaymentMethodsOverview' });
    }
  },
  methods: {
    async initializeForm() {
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

      // Ensure gateway configuration fields
      if (gateway.needsGatewayConfig === undefined) gateway.needsGatewayConfig = false;
      if (!gateway.stripeTitle) gateway.stripeTitle = gateway.title || '';
      if (!gateway.gatewayConfig) {
        // If gatewayConfig doesn't exist but needsGatewayConfig is true, create default JSON
        if (gateway.needsGatewayConfig) {
          gateway.gatewayConfig = JSON.stringify({}, null, 2);
        } else {
          gateway.gatewayConfig = '';
        }
      }
      // If gatewayConfig is an object, stringify it
      if (typeof gateway.gatewayConfig === 'object') {
        gateway.gatewayConfig = JSON.stringify(gateway.gatewayConfig, null, 2);
      }

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

      // Validate JSON if gateway config is needed
      if (this.form.needsGatewayConfig && this.form.gatewayConfig) {
        try {
          JSON.parse(this.form.gatewayConfig);
        } catch (e) {
          this.snackbar = { show: true, text: 'Invalid JSON in gateway configuration' };
          return;
        }
      }

      this.saving = true;
      try {
        const payload = {
          ...this.form,
          title: this.form.title.trim(),
          code: this.form.code || `pm-${Date.now()}`
        };

        // Clean up gatewayConfig if not needed
        if (!payload.needsGatewayConfig) {
          payload.gatewayConfig = '';
          payload.stripeTitle = '';
        }

        if (this.isCreate) {
          store.actions.createPaymentMethod(payload);
          this.snackbar = { show: true, text: 'Payment method created' };
        } else {
          store.actions.updatePaymentMethod(this.code, payload);
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
        store.actions.deletePaymentMethod(this.code);
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
  min-height: calc(100vh - 64px);
  padding: tokens.$page-padding;
}

.payment-method-content {
  padding: 0;
}

.field-block {
  margin-bottom: tokens.$space-md;
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

.fee-input-field :deep(.v-input) {
  max-width: 320px;
}

.json-editor {
  font-family: 'Courier New', monospace;
  font-size: 14px;
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

