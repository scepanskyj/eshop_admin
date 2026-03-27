<template>
  <div class="payment-method-detail-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <TertiaryButton variant="text" @click="handleCancel">Cancel</TertiaryButton>
        <v-btn v-if="!isCreate && canDelete" variant="text" color="red" @click="showDeleteConfirm = true" class="ml-2">
          <v-icon start>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
        <v-btn color="primary" @click="handleSave" :loading="saving" class="ml-2">
          <v-icon start>mdi-check</v-icon>
          Save
        </v-btn>
      </template>
    </PageHeader>

    <div v-if="form" class="payment-method-content">
      <div class="payment-method-detail-layout">
        <div class="payment-method-form-column">
          <v-form ref="detailForm" lazy-validation>
          <ModalCard title="Status" class="payment-method-status-modal">
            <HintText>This indicates if the method is enabled in the checkout list.</HintText>
            <StatusCard v-model="form.enabled" hide-label enabled-label="Enabled" disabled-label="Disabled" />
          </ModalCard>

          <!-- Basic Information -->
          <ModalCard title="Payment Method">
            <div class="field-block">
              <Label>Title <span class="required-asterisk">*</span></Label>
              <v-text-field
                class="form-field"
                v-model="form.title"
                density="compact"
                variant="outlined"
                hide-details="auto"
                :rules="[requiredRule]"
              />
            </div>

            <div class="field-block">
              <Label>Method code <span class="required-asterisk">*</span></Label>
              <HintText>Stable identifier (e.g. paypal, paga_in_farmacia). Used in restriction rules and integrations.</HintText>
              <v-text-field
                class="form-field"
                v-model="form.code"
                density="compact"
                variant="outlined"
                hide-details="auto"
                :disabled="saving"
                :rules="[methodCodeRule]"
                placeholder="paypal"
              />
            </div>

            <div class="field-block">
              <Label>Integration ID</Label>
              <HintText>Optional ID from your payment or ERP integration (e.g. external method or contract reference).</HintText>
              <v-text-field
                class="form-field"
                v-model="form.integrationId"
                density="compact"
                variant="outlined"
                hide-details="auto"
                :disabled="saving"
                placeholder="Optional"
              />
            </div>

            <div class="field-block">
              <Label>Icons</Label>
              <HintText>
                SVG, 1:1 aspect ratio. Always consult your designers when adding new icons.
              </HintText>
              <!-- Row = platform: active | disabled (left to right). -->
              <v-row class="icons-columns icons-row icons-row--web" dense align="stretch">
                <v-col cols="12" md="6">
                  <div class="field-block field-block--nested field-block--icons-cell">
                    <Label>Web</Label>
                    
                    <IconUpload
                      v-model="form.iconWeb"
                      :disabled="saving"
                    />
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="field-block field-block--nested field-block--icons-cell">
                    <Label>Web (disabled)</Label>
                    
                    <IconUpload
                      v-model="form.iconWebDisabled"
                      :disabled="saving"
                    />
                  </div>
                </v-col>
              </v-row>
              <v-row class="icons-columns icons-row icons-row--mobile" dense align="stretch">
                <v-col cols="12" md="6">
                  <div class="field-block field-block--nested field-block--icons-cell">
                    <Label>Mobile</Label>
                    
                    <IconUpload
                      v-model="form.iconMobile"
                      :disabled="saving"
                    />
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="field-block field-block--nested field-block--icons-cell">
                    <Label>Mobile (disabled)</Label>
                   
                    <IconUpload
                      v-model="form.iconMobileDisabled"
                      :disabled="saving"
                    />
                  </div>
                </v-col>
              </v-row>
            </div>

            <div class="field-block">
              <Label>Description</Label>
              <HintText>This will be shown to the customer in the checkout</HintText>
              <v-textarea
                class="form-field"
                v-model="form.description"
                density="compact"
                variant="outlined"
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
                density="compact"
                variant="outlined"
                type="number"
                hide-details="auto"
                :rules="[sortOrderRule]"
              />
            </div>

            <div class="field-block checkout-badge-section">
              <Label>Checkout badge (web)</Label>
              <HintText>
                Optional label strip above the method on <strong>web checkout</strong>. One line; overflow is truncated. Native apps may differ.
              </HintText>
              <v-switch
                v-model="checkoutStripEnabled"
                color="primary"
                hide-details
                density="compact"
                :label="checkoutStripEnabled ? 'Checkout badge enabled' : 'Checkout badge disabled'"
                class="mt-1"
              />
              <div v-if="checkoutStripEnabled" class="checkout-badge-settings-group">
                <div class="field-block field-block--nested field-block--checkout-sub">
                  <Label>Badge text</Label>
                  <HintText>Shown on the strip. Leave empty to use the default label.</HintText>
                  <v-text-field
                    v-model="form.checkoutBadgeLabel"
                    class="form-field"
                    density="compact"
                    variant="outlined"
                    hide-details="auto"
                    maxlength="80"
                    counter="80"
                    placeholder="Optional"
                  />
                </div>
                <div class="field-block field-block--nested field-block--checkout-sub">
                  <v-switch
                    v-model="form.checkoutBadgeTooltipEnabled"
                    color="primary"
                    hide-details
                    density="compact"
                    :label="form.checkoutBadgeTooltipEnabled ? 'Tooltip enabled' : 'Tooltip disabled'"
                  />
                </div>
                <div
                  v-if="form.checkoutBadgeTooltipEnabled"
                  class="field-block field-block--nested field-block--checkout-sub"
                >
                  <Label>Tooltip text</Label>
                  <HintText>Shown when the customer opens the info control next to the strip on web.</HintText>
                  <v-textarea
                    v-model="form.checkoutBadgeTooltip"
                    class="form-field"
                    density="compact"
                    variant="outlined"
                    rows="2"
                    hide-details="auto"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div v-if="canAccessGatewayConfig" class="field-block">
              <v-switch
                v-model="form.needsGatewayConfig"
                color="primary"
                hide-details
                density="compact"
                :label="
                  form.needsGatewayConfig
                    ? 'Gateway configuration required'
                    : 'Gateway configuration not required'
                "
                class="mt-1"
              />
            </div>

            <template v-if="form.needsGatewayConfig && shouldShowStripeTitle">
              <div class="field-block">
                <Label>Gateway title</Label>
                <HintText>Text shown in the gateway as title</HintText>
                <v-text-field
                  class="form-field"
                  v-model="form.stripeTitle"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  placeholder="Text shown in Stripe gateway as title"
                />
              </div>
            </template>
          </ModalCard>

          <!-- Gateway Configuration (Developer/Admin only) -->
          <ModalCard v-if="form.needsGatewayConfig && canAccessGatewayConfig" title="Gateway Configuration">
            <div class="field-block">
              <Label>Provider</Label>
              <HintText>Changing provider replaces the JSON below with that provider&apos;s template.</HintText>
              <v-select
                class="form-field"
                v-model="form.gatewayProvider"
                :items="gatewayProviderSelectItems"
                item-title="title"
                item-value="value"
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </div>
            <div class="field-block">
              <Label>Configuration (JSON) <span class="required-asterisk">*</span></Label>
              <HintText>Enter gateway configuration as JSON.</HintText>
              <v-textarea
                class="form-field json-editor"
                v-model="form.gatewayConfig"
                density="compact"
                variant="outlined"
                rows="20"
                hide-details="auto"
                placeholder='{"key": "value"}'
                :rules="[jsonRule]"
              />
              <v-alert
                v-if="gatewayJsonDetailError"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-2 json-error-alert"
                role="alert"
              >
                {{ gatewayJsonDetailError }}
              </v-alert>
            </div>
          </ModalCard>

          <!-- Payment Fee Settings -->
          <ModalCard title="Payment Fee">
            <div class="field-block">
              <v-switch
                v-model="form.feeEnabled"
                color="primary"
                hide-details
                density="compact"
                :label="form.feeEnabled ? 'Payment fee enabled' : 'Payment fee disabled'"
                class="mt-1"
              />
            </div>

            <template v-if="form.feeEnabled">
              <div class="field-block fee-amount-field fee-input-field">
                <Label>Fee Amount <span class="required-asterisk">*</span></Label>
                <v-text-field
                  class="form-field"
                  v-model.number="form.feeSettings.amount"
                  density="compact"
                  variant="outlined"
                  type="number"
                  step="0.01"
                  hide-details="auto"
                  :rules="[v => form.feeEnabled ? (v > 0 || 'Fee amount is required') : true]"
                  :suffix="form.currency"
                />
              </div>

              <div class="field-block fee-order-range-block">
                <Label>Order total range</Label>
                <HintText>
                  The payment fee applies only when the checkout cart total falls between the minimum and maximum you set below.
                </HintText>
                <div class="field-flex fee-order-range-inputs">
                  <div class="field-block fee-input-field fee-order-bound-column">
                    <Label>Minimum cart total</Label>
                    <v-text-field
                      class="form-field"
                      v-model.number="form.feeSettings.minOrderAmount"
                      density="compact"
                      variant="outlined"
                      type="number"
                      min="0"
                      step="0.01"
                      hide-details="auto"
                      :suffix="form.currency"
                      :rules="[minOrderAmountFeeRule]"
                      autocomplete="off"
                      name="payment-method-fee-min-order"
                      inputmode="decimal"
                      @blur="clampFeeOrderMinMax"
                    />
                  </div>
                  <div class="field-block fee-input-field fee-order-bound-column">
                    <Label>Maximum cart total</Label>
                    <v-text-field
                      class="form-field"
                      v-model.number="form.feeSettings.maxOrderAmount"
                      density="compact"
                      variant="outlined"
                      type="number"
                      min="0"
                      max="1000000"
                      step="0.01"
                      hide-details="auto"
                      :suffix="form.currency"
                      :rules="[maxOrderAmountFeeRule]"
                      autocomplete="off"
                      name="payment-method-fee-max-order"
                      inputmode="decimal"
                      @blur="clampFeeOrderMinMax"
                    />
                  </div>
                </div>
              </div>

              <div class="field-block fee-input-field">
                <Label>Apply Payment Fee for Specific Customers</Label>
                <HintText>If left blank, the fee applies to all customers.</HintText>
                <v-autocomplete
                  class="form-field"
                  v-model="form.feeSettings.customerTypes"
                  :items="customerTypeOptions"
                  item-title="text"
                  item-value="value"
                  multiple
                  chips
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  placeholder="Select customer groups…"
                  autocomplete="off"
                  name="payment-method-fee-customer-types"
                />
              </div>

              <div class="field-block">
                <Label>Tax Settings</Label>
                <v-switch
                  v-model="form.feeSettings.taxSettings.calculateTax"
                  color="primary"
                  hide-details
                  density="compact"
                  :label="
                    form.feeSettings.taxSettings.calculateTax
                      ? 'Calculate tax on fee'
                      : 'Do not calculate tax on fee'
                  "
                  class="mt-2"
                />
                <template v-if="form.feeSettings.taxSettings.calculateTax">
                  <div class="field-block field-block--nested mt-2">
                    <Label>Tax class</Label>
                    <v-select
                      v-model="form.feeSettings.taxSettings.taxClass"
                      class="form-field"
                      :items="feeTaxClassItems"
                      item-title="title"
                      item-value="value"
                      density="compact"
                      variant="outlined"
                      hide-details="auto"
                    />
                  </div>
                  <div class="field-block field-block--nested">
                    <Label>Display payment fee</Label>
                    <v-select
                      v-model="form.feeSettings.taxSettings.displayPaymentFee"
                      class="form-field"
                      :items="feeDisplayPaymentFeeItems"
                      item-title="title"
                      item-value="value"
                      density="compact"
                      variant="outlined"
                      hide-details="auto"
                    />
                  </div>
                </template>
                <v-switch
                  v-model="form.feeSettings.taxSettings.feeContainsTax"
                  color="primary"
                  hide-details
                  density="compact"
                  :label="
                    form.feeSettings.taxSettings.feeContainsTax
                      ? 'Fee already contains tax'
                      : 'Fee does not include tax'
                  "
                  class="mt-2"
                />
              </div>
            </template>
          </ModalCard>
          </v-form>
        </div>
        <aside class="payment-method-preview-column" aria-label="Web checkout preview">
          <div class="payment-method-preview-inner">
            <ModalCard title="Web checkout preview" class="payment-method-preview-modal">
              <HintText class="payment-method-preview-hint">
                Live preview of web checkout.
              </HintText>
              <div
                class="payment-method-preview-card-wrap"
                :class="{ 'payment-method-preview-card-wrap--free-price': previewPriceIsGreen }"
              >
                <CheckoutMethodCard
                  :title="form.title || 'Payment method'"
                  :description="form.description"
                  :price="previewCheckoutPriceLine"
                  :checkout-badge-mode="form.checkoutBadgeMode"
                  :checkout-badge-label="form.checkoutBadgeLabel"
                  :favourite-tooltip="previewFavouriteTooltip"
                  favourite-tooltip-aria="More about this label"
                  :show-partner-strip="false"
                  hide-default-hero-image
                >
                  <template v-if="previewWebIconSrc" #logo>
                    <div class="checkout-method-card__logo-figma" data-name="Logo">
                      <div class="checkout-method-card__logo-inner">
                        <img
                          :src="previewWebIconSrc"
                          alt=""
                          class="payment-method-preview-icon-img"
                          width="32"
                          height="32"
                        />
                      </div>
                    </div>
                  </template>
                </CheckoutMethodCard>
              </div>
            </ModalCard>
          </div>
        </aside>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Modal v-model="showDeleteConfirm" title="Delete payment method" max-width="520" @close="showDeleteConfirm = false">
      <template v-slot:content>
        <v-alert
          v-if="showDeleteConfirmation"
          type="error"
          variant="outlined"
          density="compact"
          class="mb-4"
          closable
          @click:close="showDeleteConfirmation = false"
        >
          <strong>Warning:</strong> Deleting this payment method is irreversible. Click "Confirm delete" below to proceed.
        </v-alert>
        
        <div class="text-body-1 mb-2">
          Are you sure you want to delete <strong>{{ form && form.title }}</strong>?
        </div>
      </template>
      
      <template v-slot:footer>
        <v-spacer />
        <TertiaryButton variant="text" @click="showDeleteConfirm = false; showDeleteConfirmation = false">Cancel</TertiaryButton>
        <v-btn
          v-if="!showDeleteConfirmation"
          outlined
          color="red"
          @click="showDeleteConfirmation = true"
        >
          <v-icon start>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
        <v-btn
          v-else
          color="red"
          dark
          @click="handleDelete"
        >
          <v-icon start>mdi-delete</v-icon>
          Confirm delete
        </v-btn>
      </template>
    </Modal>

    <v-snackbar v-model="snackbar.show">
      {{ snackbar.text }}
      <TertiaryButton variant="text" @click="snackbar.show=false">Close</TertiaryButton>
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
import CheckoutMethodCard from '@/components/checkout/CheckoutMethodCard.vue';
import { resolveIconPath } from '@/utils/iconPath';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';
import roleStore from '@/store/roleStore';
import { getCurrencyForCountry } from '@/utils/currencies';
import {
  GATEWAY_PROVIDER_OPTIONS,
  stringifyGatewayTemplate,
  DEFAULT_GATEWAY_PROVIDER
} from '@/constants/gatewayProviderTemplates';

function buildPaymentMethodTemplate(countryCode) {
  const currency = getCurrencyForCountry(countryCode);
  return {
    code: '',
    title: '',
    integrationId: '',
    description: '',
    icon: '',
    disabledIcon: '',
    iconWeb: '',
    iconMobile: '',
    iconWebDisabled: '',
    iconMobileDisabled: '',
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
      amount: 0,
      minOrderAmount: 0,
      maxOrderAmount: 1000000,
      currency,
      customerTypes: [],
      taxSettings: {
        calculateTax: false,
        feeContainsTax: false,
        taxClass: '',
        displayPaymentFee: 'excluding_tax'
      }
    },
    needsGatewayConfig: false,
    gatewayProvider: '',
    stripeTitle: '',
    gatewayConfig: '',
    checkoutBadgeMode: 'none',
    checkoutBadgeLabel: '',
    checkoutBadgeTooltipEnabled: false,
    checkoutBadgeTooltip: ''
  };
}

export default {
  name: 'PaymentMethodDetail',
  components: { PageHeader, ModalCard, StatusCard, IconUpload, Modal, TertiaryButton, Label, HintText, CheckoutMethodCard },
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
      suspendGatewayEffects: true
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
    gatewayProviderSelectItems() {
      return GATEWAY_PROVIDER_OPTIONS;
    },
    breadcrumbs() {
      const baseTitle = this.isCreate ? 'Create payment method' : 'Edit payment method';
      const title = this.form && this.form.title ? `${baseTitle} - ${this.form.title}` : baseTitle;
      return [
        { title: 'Payment section', disabled: true },
        { title: 'Payment methods', to: { name: 'PaymentMethodsOverview' } },
        { title: title, disabled: true }
      ];
    },
    checkoutStripEnabled: {
      get() {
        return !!(this.form && this.form.checkoutBadgeMode && this.form.checkoutBadgeMode !== 'none');
      },
      set(v) {
        if (!this.form) return;
        if (v) {
          if (this.form.checkoutBadgeMode === 'none') {
            this.form.checkoutBadgeMode = 'favourite';
          }
        } else {
          this.form.checkoutBadgeMode = 'none';
        }
      }
    },
    previewWebIconSrc() {
      if (!this.form?.iconWeb) return '';
      return resolveIconPath(this.form.iconWeb);
    },
    /** Country for fee/free copy: method country or current tenant. */
    feePreviewCountryCode() {
      return (this.form?.countryCode || tenantStore.state.current || '').toUpperCase();
    },
    feeIsConfigured() {
      if (!this.form?.feeEnabled || !this.form?.feeSettings) return false;
      const amt = Number(this.form.feeSettings.amount);
      return !Number.isNaN(amt) && amt > 0;
    },
    /** Price line in checkout card: fee amount, localized “free”, or currency zero fallback. */
    previewCheckoutPriceLine() {
      if (!this.form) return '';
      if (this.feeIsConfigured) {
        const amt = Number(this.form.feeSettings.amount);
        const code = this.form.currency || 'EUR';
        try {
          return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(amt);
        } catch {
          return String(amt);
        }
      }
      const cc = this.feePreviewCountryCode;
      const freeMap = {
        CZ: 'Zdarma',
        SK: 'Zadarmo',
        PL: '',
        RO: 'Gratis',
        IT: 'Gratis'
      };
      if (Object.prototype.hasOwnProperty.call(freeMap, cc)) {
        return freeMap[cc];
      }
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: this.form.currency || 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(0);
      } catch {
        return '0.00 €';
      }
    },
    /** Green-600 styling for localized free labels (not PL empty, not currency fallback). */
    previewPriceIsGreen() {
      if (!this.form || this.feeIsConfigured) return false;
      const cc = this.feePreviewCountryCode;
      return ['CZ', 'SK', 'RO', 'IT'].includes(cc);
    },
    previewFavouriteTooltip() {
      if (!this.form?.checkoutBadgeTooltipEnabled) return '';
      const t = (this.form.checkoutBadgeTooltip || '').trim();
      // Non-empty so the preview still shows the info icon; tooltip body stays visually empty.
      return t || '\u00A0';
    },
    customerTypeOptions() {
      return [
        { text: 'Logged in user', value: 'logged_in' },
        { text: 'Guest user', value: 'guest' },
        { text: 'Business', value: 'business' },
        { text: 'Wholesale', value: 'wholesale' }
      ];
    },
    feeTaxClassItems() {
      return [
        { title: 'Products 21%', value: 'products_21' },
        { title: 'Products 10%', value: 'products_10' },
        { title: 'Products 5%', value: 'products_5' },
        { title: 'Shipping', value: 'shipping' },
        { title: 'None', value: 'none' }
      ];
    },
    feeDisplayPaymentFeeItems() {
      return [
        { title: 'Excluding tax', value: 'excluding_tax' },
        { title: 'Including tax', value: 'including_tax' }
      ];
    },
    minOrderAmountFeeRule() {
      return v => {
        if (!this.form?.feeEnabled) return true;
        const n = Number(v);
        if (Number.isNaN(n) || n < 0) return 'Enter a minimum cart total (0 or greater)';
        return true;
      };
    },
    maxOrderAmountFeeRule() {
      const cap = 1000000;
      return v => {
        if (!this.form?.feeEnabled) return true;
        const n = Number(v);
        if (Number.isNaN(n) || n < 0) return 'Enter a maximum cart total (0 or greater)';
        if (n > cap) return `Maximum cart total cannot exceed ${cap.toLocaleString('en-US')}`;
        const minV = Number(this.form.feeSettings.minOrderAmount);
        if (!Number.isNaN(minV) && n < minV) return 'Maximum must be greater than or equal to minimum';
        return true;
      };
    },
    requiredRule() {
      return v => !!v || 'This field is required';
    },
    currentTenant() {
      return tenantStore.state.current;
    },
    maxSortOrder() {
      const gateways = store.state.gateways || [];
      if (gateways.length === 0) return 1;
      const maxOrder = Math.max(...gateways.map(g => g.sortOrder || 0));
      return Math.max(maxOrder, 1);
    },
    sortOrderRule() {
      return v => {
        if (v === null || v === undefined || v === '') return true;
        const num = Number(v);
        if (isNaN(num)) return 'Must be a number';
        if (num < 1) return 'Position must be at least 1';
        if (num > this.maxSortOrder) return `Position cannot exceed ${this.maxSortOrder} (current maximum)`;
        return true;
      };
    },
    gatewayJsonDetailError() {
      if (!this.form || !this.form.needsGatewayConfig || !this.canAccessGatewayConfig) return '';
      const v = this.form.gatewayConfig;
      if (!v || !String(v).trim()) return '';
      try {
        JSON.parse(v);
        return '';
      } catch (e) {
        return e.message || 'Invalid JSON';
      }
    },
    jsonRule() {
      return v => {
        if (!this.form || !this.form.needsGatewayConfig) return true;
        if (!v || !String(v).trim()) return 'Gateway configuration is required when gateway config is needed';
        try {
          JSON.parse(v);
          return true;
        } catch (e) {
          return e.message || 'Invalid JSON format';
        }
      };
    },
    shouldShowStripeTitle() {
      if (!this.form) return false;
      if (this.form.gatewayProvider === 'stripe') return true;
      if (this.form.gatewayProvider) return false;
      if (!this.form.title) return false;
      const cardPaymentTitles = [
        'Carte di credito, Apple Pay, Google Pay',
        'Blik / Karty / Apple Pay / Google Pay',
        'Kartou online',
        'Online platba kartou / Apple Pay / GooglePay',
        'Plata cu cardul.'
      ];
      return cardPaymentTitles.includes(this.form.title);
    },
    methodCodeRule() {
      return v => {
        const s = (v || '').trim();
        if (!s) return 'Method code is required';
        if (!/^[a-z0-9_]+$/.test(s)) {
          return 'Use lowercase letters, numbers, and underscores only';
        }
        const gateways = store.state.gateways || [];
        const taken = gateways.some(g => g.code === s && (this.isCreate || s !== this.code));
        if (taken) return 'This method code is already in use';
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
    'form.needsGatewayConfig'(enabled) {
      if (this.suspendGatewayEffects || !this.form) return;
      if (enabled) {
        if (!this.form.gatewayProvider) {
          this.form.gatewayProvider = DEFAULT_GATEWAY_PROVIDER;
        }
        const t = stringifyGatewayTemplate(this.form.gatewayProvider || DEFAULT_GATEWAY_PROVIDER);
        if (!this.form.gatewayConfig || !String(this.form.gatewayConfig).trim()) {
          this.form.gatewayConfig = t;
        }
      }
    },
    'form.gatewayProvider'(newVal, oldVal) {
      if (this.suspendGatewayEffects || !this.form) return;
      if (oldVal === undefined || newVal === oldVal) return;
      const hadProvider = oldVal !== '' && oldVal != null;
      if (!hadProvider) return;
      this.form.gatewayConfig = stringifyGatewayTemplate(newVal);
    },
    currentTenant: {
      handler(newTenant, oldTenant) {
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
        this.suspendGatewayEffects = false;
      });
    } catch (error) {
      console.error('Failed to initialize form:', error);
      this.$router.push({ name: 'PaymentMethodsOverview' });
    }
  },
  methods: {
    clampFeeOrderMinMax() {
      const cap = 1000000;
      if (!this.form?.feeSettings) return;
      let minV = Number(this.form.feeSettings.minOrderAmount);
      let maxV = Number(this.form.feeSettings.maxOrderAmount);
      if (Number.isNaN(minV)) minV = 0;
      if (Number.isNaN(maxV)) maxV = 0;
      if (minV < 0) minV = 0;
      if (maxV < 0) maxV = 0;
      if (maxV > cap) maxV = cap;
      if (minV > cap) minV = cap;
      if (minV > maxV) {
        this.form.feeSettings.minOrderAmount = maxV;
        this.form.feeSettings.maxOrderAmount = minV;
      } else {
        this.form.feeSettings.minOrderAmount = minV;
        this.form.feeSettings.maxOrderAmount = maxV;
      }
    },
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
      if (!gateway.description) gateway.description = '';
      if (!gateway.integrationId) gateway.integrationId = '';
      if (!gateway.icon) gateway.icon = '';
      if (!gateway.disabledIcon) gateway.disabledIcon = '';
      if (!gateway.iconWeb) gateway.iconWeb = '';
      if (!gateway.iconMobile) gateway.iconMobile = '';
      if (!gateway.iconWebDisabled) gateway.iconWebDisabled = '';
      if (!gateway.iconMobileDisabled) gateway.iconMobileDisabled = '';

      if (!gateway.iconWeb && gateway.icon) gateway.iconWeb = gateway.icon;
      if (!gateway.iconWebDisabled && gateway.disabledIcon) gateway.iconWebDisabled = gateway.disabledIcon;

      if (!gateway.countryCode) gateway.countryCode = tenantStore.state.current;
      if (!gateway.currency) gateway.currency = getCurrencyForCountry(gateway.countryCode);

      if (gateway.feeEnabled === undefined) gateway.feeEnabled = false;
      if (!gateway.feeSettings) {
        gateway.feeSettings = {
          priceType: 'Fixed price',
          minAmount: 0,
          maxAmount: 9999,
          amount: 0,
          minOrderAmount: 0,
          maxOrderAmount: 1000000,
          currency: gateway.currency,
          customerTypes: [],
          taxSettings: {
            calculateTax: false,
            feeContainsTax: false,
            taxClass: '',
            displayPaymentFee: 'excluding_tax'
          }
        };
      }
      if (gateway.feeSettings.taxSettings) {
        if (gateway.feeSettings.taxSettings.taxClass === undefined || gateway.feeSettings.taxSettings.taxClass === null) {
          gateway.feeSettings.taxSettings.taxClass = '';
        }
        if (!gateway.feeSettings.taxSettings.displayPaymentFee) {
          gateway.feeSettings.taxSettings.displayPaymentFee = 'excluding_tax';
        }
      }
      if (gateway.feeSettings.minOrderAmount === undefined) gateway.feeSettings.minOrderAmount = 0;
      if (gateway.feeSettings.maxOrderAmount === undefined) gateway.feeSettings.maxOrderAmount = 1000000;
      if (gateway.feeSettings && Object.prototype.hasOwnProperty.call(gateway.feeSettings, 'refundable')) {
        delete gateway.feeSettings.refundable;
      }

      if (gateway.needsGatewayConfig === undefined) gateway.needsGatewayConfig = false;
      if (gateway.needsGatewayConfig && !gateway.gatewayProvider) {
        gateway.gatewayProvider = DEFAULT_GATEWAY_PROVIDER;
      }
      if (!gateway.gatewayProvider) gateway.gatewayProvider = '';
      if (!gateway.stripeTitle) gateway.stripeTitle = gateway.title || '';
      if (!gateway.gatewayConfig) {
        if (gateway.needsGatewayConfig) {
          gateway.gatewayConfig = stringifyGatewayTemplate(gateway.gatewayProvider || DEFAULT_GATEWAY_PROVIDER);
        } else {
          gateway.gatewayConfig = '';
        }
      }
      if (typeof gateway.gatewayConfig === 'object') {
        gateway.gatewayConfig = JSON.stringify(gateway.gatewayConfig, null, 2);
      }

      if (!gateway.checkoutBadgeMode) gateway.checkoutBadgeMode = 'none';
      if (gateway.checkoutBadgeLabel === undefined || gateway.checkoutBadgeLabel === null) {
        gateway.checkoutBadgeLabel = '';
      }
      if (gateway.checkoutBadgeTooltipEnabled === undefined) gateway.checkoutBadgeTooltipEnabled = false;
      if (gateway.checkoutBadgeTooltip === undefined || gateway.checkoutBadgeTooltip === null) {
        gateway.checkoutBadgeTooltip = '';
      }

      return gateway;
    },
    handleCancel() {
      store.dirty.clearAll();
      this.$router.push({ name: 'PaymentMethodsOverview' });
    },
    async handleSave() {
      const formRef = this.$refs.detailForm;
      if (formRef && typeof formRef.validate === 'function') {
        const result = await formRef.validate();
        const ok = typeof result === 'boolean' ? result : result?.valid;
        if (!ok) {
          this.snackbar = { show: true, text: 'Please fix validation errors' };
          return;
        }
      }

      if (!this.form.title || !this.form.title.trim()) {
        this.snackbar = { show: true, text: 'Title is required' };
        return;
      }

      const codeTrim = (this.form.code || '').trim();
      if (!codeTrim) {
        this.snackbar = { show: true, text: 'Method code is required' };
        return;
      }

      if (this.form.needsGatewayConfig && this.form.gatewayConfig) {
        try {
          JSON.parse(this.form.gatewayConfig);
        } catch (e) {
          this.snackbar = { show: true, text: e.message || 'Invalid JSON in gateway configuration' };
          return;
        }
      }

      this.saving = true;
      const routeCode = this.code;
      try {
        const payload = {
          ...this.form,
          title: this.form.title.trim(),
          code: codeTrim,
          integrationId: (this.form.integrationId || '').trim()
        };

        if (!payload.needsGatewayConfig) {
          payload.gatewayConfig = '';
          payload.stripeTitle = '';
          payload.gatewayProvider = '';
        }

        if (this.isCreate) {
          store.actions.createPaymentMethod(payload);
          this.snackbar = { show: true, text: 'Payment method created' };
        } else {
          store.actions.updatePaymentMethod(routeCode, payload);
          this.snackbar = { show: true, text: 'Payment method updated' };
          if (payload.code !== routeCode) {
            await this.$router.replace({ name: 'PaymentMethodDetail', params: { code: payload.code } });
          }
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
  padding: tokens.$page-padding;
}

/* Status modal: less gap between hint and StatusCard, and less empty padding under the card. */
.payment-method-detail-wrapper :deep(.payment-method-status-modal.modal-card) {
  padding-bottom: tokens.$space-md;
}

.payment-method-detail-wrapper :deep(.payment-method-status-modal .modal-card__body) {
  gap: tokens.$space-sm;
}

.payment-method-detail-wrapper :deep(.payment-method-status-modal .hint-text) {
  margin-bottom: 0;
}

.payment-method-content {
  padding: 0;
  container-type: inline-size;
  container-name: pm-layout;
}

.payment-method-detail-layout {
  display: grid;
  grid-template-columns: minmax(560px, min(800px, 100%)) minmax(328px, min(400px, 100%));
  gap: tokens.$space-lg;
  align-items: stretch;
  justify-content: start;
  width: 100%;
  min-width: 0;
}

/* Form column height = content; preview column stretches to row height so sticky preview has room. */
.payment-method-form-column {
  align-self: start;
  min-width: 0;
  max-width: 800px;
  width: 100%;
}

.payment-method-preview-column {
  align-self: stretch;
  min-width: 0;
  max-width: 800px;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.payment-method-preview-inner {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
  position: sticky;
  /* Matches v-main padding / app bar via Vuetify layout (inherits --v-layout-top from v-main) */
  top: calc(var(--v-layout-top, #{tokens.$space-4xl}) + #{tokens.$space-md});
  align-self: flex-start;
  width: 100%;
  z-index: 1;
}

.payment-method-preview-modal {
  margin-bottom: 0 !important;
}

.payment-method-preview-hint {
  margin: 0 0 tokens.$space-xs 0;
}

.payment-method-preview-card-wrap {
  min-width: 328px;
  max-width: 400px;
}

.payment-method-preview-card-wrap :deep(.checkout-method-card__logo-inner) {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.payment-method-preview-card-wrap :deep(.payment-method-preview-icon-img) {
  display: block;
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.payment-method-preview-card-wrap--free-price :deep(.checkout-method-card__price) {
  color: tokens.$color-green-600;
}

/* Stack when 800px form + gap + 328px preview cannot sit side by side (800 + 24 + 328 = 1152) */
@container pm-layout (max-width: 1152px) {
  .payment-method-detail-layout {
    grid-template-columns: 1fr;
  }

  .payment-method-preview-column {
    order: 2;
  }

  .payment-method-form-column {
    order: 1;
  }
}

@supports not (container-type: inline-size) {
  @media (max-width: 1152px) {
    .payment-method-detail-layout {
      grid-template-columns: 1fr;
    }

    .payment-method-preview-column {
      order: 2;
    }

    .payment-method-form-column {
      order: 1;
    }
  }
}

.field-block {
  margin-bottom: tokens.$space-md;
}

.field-block--nested {
  margin-bottom: tokens.$space-md;

  &:last-child {
    margin-bottom: 0;
  }
}

/* Tighter proximity: badge text + tooltip toggle + tooltip copy as one sub-form */
.checkout-badge-settings-group {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-sm;
  margin-top: tokens.$space-xs;
}

.checkout-badge-section .checkout-badge-settings-group .field-block--checkout-sub {
  margin-bottom: 0;
}

.icons-columns {
  margin-top: tokens.$space-xs;
}

.icons-row--web {
  margin-bottom: tokens.$space-md;
}

.icons-row :deep(.v-col) {
  display: flex;
  flex-direction: column;
}

.field-block--icons-cell {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 0;
}

.form-field {
  width: 100%;
}

.json-error-alert {
  font: tokens.$text-p2;
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

:deep(.payment-fee-accordions .v-expansion-panel-title) {
  padding: tokens.$space-md tokens.$space-lg !important;
}

:deep(.payment-fee-accordions .v-expansion-panel-text) {
  padding: 0 tokens.$space-lg tokens.$space-lg tokens.$space-lg !important;
}


.field-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: tokens.$space-lg;
}

.fee-order-range-inputs {
  align-items: flex-start;

  > .field-block {
    align-self: flex-start;
  }
}

.fee-order-bound-column {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-xs;
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

.payment-method-detail-wrapper :deep(h1) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
