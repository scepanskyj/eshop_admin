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
          Create payment method
        </v-btn>
      </template>
      <template v-slot:filters>
        <section class="filters-section">
          <v-row class="search-row" dense>
            <v-col cols="12" md="6" lg="5">
              <v-text-field
                v-model="search"
                dense
                outlined
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

    <v-overlay :value="loading" z-index="9999">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-overlay>

    <EmptyState
      v-if="!sortedGateways.length"
      icon="mdi-credit-card-outline"
      title="No payment methods match"
      :subtitle="canCreate ? 'Adjust filters or create a new payment method to get started.' : 'Adjust filters to see payment methods.'"
      :cta-label="canCreate ? 'Create payment method' : undefined"
      @cta="canCreate && createGateway"
    />

    <div v-if="sortedGateways.length" class="table-card">
      <OverviewTableHeader
        :filter-active="showEnabledOnly"
        :active-count="enabledFilterCount"
        filter-label="Enabled"
        @update:filterActive="setShowEnabledOnly"
      />
      <div class="gateways-hint-wrap">
        <p1>This is how payment methods appear at checkout. Drag items to change the order.</p1>
        <v-btn
          color="primary"
          :disabled="!orderHasChanged"
          @click="saveOrder"
          class="save-order-btn"
        >
          <v-icon left small>mdi-sort</v-icon>
          Save sort order
        </v-btn>
      </div>
      <draggable
        v-model="orderedGateways"
        handle=".card-drag-area"
        ghost-class="gateway-card--ghost"
        drag-class="gateway-card--drag"
        class="gateways-list"
      >
        <GatewayCard
          v-for="(gateway, index) in orderedGateways"
          :key="gateway.code"
          :gateway="gateway"
          :position="index + 1"
          :icon="getGatewayIcon(gateway.code)"
          :updated-label="formatUpdated(gateway.updatedAt)"
          :on-configure="openConfigure"
          :show-country-badge="showCountryBadge"
          :country-flag="getCountryFlag(gateway.countryCode)"
          :country-abbreviation="getCountryAbbreviation(gateway.countryCode)"
        />
      </draggable>
    </div>

    <Modal v-model="configDialog" :title="dialogTitle" max-width="720" @close="handleDialogClose">
      <template v-slot:content>
        <v-form ref="gatewayForm" lazy-validation v-if="editedGateway && editedGateway.feeSettings">
          <v-alert
            v-if="showDeleteConfirmation"
            type="error"
            outlined
            dense
            class="mb-4"
            dismissible
            @input="showDeleteConfirmation = false"
          >
            <strong>Warning:</strong> Deleting this gateway is irreversible. Click "Confirm delete" below to proceed.
          </v-alert>

          <div class="modal-form">
            <ModalCard
              title="Payment Method"
            >
              <StatusCard v-model="editedGateway.enabled" enabled-label="Enabled" disabled-label="Disabled" />

              <div class="field-block">
                <Label>Title <span class="required-asterisk">*</span></Label>
                <v-text-field
                  class="form-field"
                  v-model="editedGateway.title"
                  dense
                  outlined
                  hide-details="auto"
                  :rules="[requiredRule]"
                />
              </div>
              <div class="field-block">
                <Label>Icon</Label>
                <v-select
                  class="form-field"
                  v-model="editedGateway.icon"
                  dense
                  outlined
                  :items="iconOptions"
                  item-text="text"
                  item-value="value"
                  hide-details="auto"
                >
                  <template v-slot:item="{ item }">
                    <div class="d-flex align-center">
                      <v-avatar size="32" class="mr-3">
                        <v-img :src="getAssetPath(item.value)" contain />
                      </v-avatar>
                      <span>{{ item.text }}</span>
                    </div>
                  </template>
                  <template v-slot:selection="{ item }">
                    <div class="d-flex align-center">
                      <v-avatar size="24" class="mr-2">
                        <v-img :src="getAssetPath(item.value)" contain />
                      </v-avatar>
                      <span>{{ item.text }}</span>
                    </div>
                  </template>
                </v-select>
              </div>
              <div class="field-block">
                <Label>Description (shown to customer)</Label>
                <v-textarea
                  class="form-field"
                  v-model="editedGateway.description"
                  dense
                  outlined
                  rows="3"
                  hide-details="auto"
                  placeholder="Enter description for this payment method"
                />
              </div>
            </ModalCard>

            <v-expansion-panels multiple>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  <div>
                    <div class="modal-card__title">Payment Fee Settings</div>
                    <div class="modal-card__subtitle">
                      Configure fee settings for this payment method
                    </div>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="modal-card__body">
                    <div class="field-block">
                      <Label>Price Type</Label>
                      <v-select
                        class="form-field"
                        outlined
                        dense
                        v-model="editedGateway.feeSettings.priceType"
                        :items="['Fixed price', 'Percent']"
                        placeholder="Select price type"
                        hide-details="auto"
                      />
                    </div>
                    <div class="field-flex">
                      <div class="field-block fee-input-field">
                        <Label>Minimum Order Amount</Label>
                        <v-text-field
                          class="form-field"
                          outlined
                          dense
                          v-model.number="editedGateway.feeSettings.minAmount"
                          type="number"
                          placeholder="0"
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block fee-input-field">
                        <Label>Maximum Order Amount</Label>
                        <v-text-field
                          class="form-field"
                          outlined
                          dense
                          v-model.number="editedGateway.feeSettings.maxAmount"
                          type="number"
                          placeholder="9999"
                          hide-details="auto"
                        />
                      </div>
                    </div>
                    <div class="field-block fee-input-field">
                      <Label>Fee Amount</Label>
                      <v-text-field
                        class="form-field"
                        outlined
                        dense
                        v-model.number="editedGateway.feeSettings.amount"
                        type="number"
                        placeholder="0.00"
                        hide-details="auto"
                      />
                    </div>
                    <div class="field-block">
                      <v-checkbox
                        v-model="editedGateway.feeSettings.refundable"
                        label="Refund fee when order is refunded"
                        hide-details
                      />
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-header>
                  <div>
                    <div class="modal-card__title">Gateway Settings</div>
                    <div class="modal-card__subtitle">
                      Technical configuration for the payment gateway (if needed)
                    </div>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div class="modal-card__body">
                    <div class="field-block">
                      <Label>Sort order</Label>
                      <v-text-field
                        class="form-field"
                        v-model.number="editedGateway.sortOrder"
                        dense
                        outlined
                        type="number"
                        hide-details="auto"
                      />
                    </div>
                    <div class="field-block">
                      <Label>Gateway language</Label>
                      <v-select
                        class="form-field"
                        v-model="editedGateway.language"
                        dense
                        outlined
                        :items="languages"
                        hide-details="auto"
                      />
                    </div>
                    <ModalCard
                      title="Details"
                    >
                      <div class="field-block">
                        <Label>Merchant ID (MID)</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.mid"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Gateway URL</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.url"
                          dense
                          outlined
                          hide-details="auto"
                          :rules="[urlRule]"
                        />
                      </div>
                      <div class="field-block">
                        <v-checkbox
                          v-model="editedGateway.details.sendCartDescription"
                          label="Send Cart Description"
                          hide-details
                        />
                      </div>
                      <div class="field-block">
                        <Label>Gateway Keys Path</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.keysPath"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Private key filename</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.privateKey"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Public (gateway) key filename</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.publicKey"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Payment Fail Page</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.failUrl"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Terminal Page Domain</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.terminalDomain"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Payment Success Page</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.successUrl"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <v-checkbox
                          v-model="editedGateway.debug"
                          label="Debug"
                          hide-details
                        />
                      </div>
                      <div class="field-block">
                        <v-checkbox
                          v-model="editedGateway.details.allowPrelive"
                          label="Allow Pre-live integration controller"
                          hide-details
                        />
                      </div>
                      <div class="field-block">
                        <Label>Payment Action</Label>
                        <v-select
                          class="form-field"
                          v-model="editedGateway.paymentAction"
                          dense
                          outlined
                          :items="actions"
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Payment From Applicable Countries</Label>
                        <v-autocomplete
                          class="form-field"
                          v-model="editedGateway.countries"
                          dense
                          outlined
                          :items="allCountryOptions"
                          multiple
                          chips
                          small-chips
                          hide-details="auto"
                          :filter="countryFilter"
                        />
                      </div>
                      <div class="field-block">
                        <Label>External GUID</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.externalGuid"
                          dense
                          outlined
                          hide-details="auto"
                          :readonly="!!editedGateway.details.externalGuid"
                        />
                      </div>
                    </ModalCard>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <template v-if="editedGateway.code === 'klarna'">
              <ModalCard
                title="Klarna configuration"
                subtitle="Configure Klarna API, payment preferences, and on-site messaging."
              >
                      <v-expansion-panels multiple focusable>
                      <v-expansion-panel>
                        <v-expansion-panel-header>API Configuration</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <div class="field-block">
                            <Label>Endpoint</Label>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaApiEndpoint"
                              dense
                              outlined
                              :items="['Klarna Payments (Europe)', 'Klarna Payments (US)']"
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <Label>Klarna API username</Label>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.klarnaApiUsername"
                              dense
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <Label>Klarna API password</Label>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.klarnaApiPassword"
                              dense
                              outlined
                              type="password"
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <Label>Mode</Label>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaMode"
                              dense
                              outlined
                              :items="['Playground', 'Production']"
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <Label>Logging</Label>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaLogging"
                              dense
                              outlined
                              :items="['Enable', 'Disable']"
                              hide-details="auto"
                            />
                          </div>
                        </v-expansion-panel-content>
                      </v-expansion-panel>

                      <v-expansion-panel>
                        <v-expansion-panel-header>Klarna Payments</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <div class="field-block">
                            <v-checkbox
                              v-model="editedGateway.details.klarnaPaymentsEnable"
                              label="Enable Klarna payments"
                              hide-details
                            />
                          </div>
                          <div class="field-block">
                            <Label>Allowed countries</Label>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaPaymentsAllowedCountries"
                              dense
                              outlined
                              :items="['All Allowed Countries', 'Specific Countries']"
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <v-checkbox
                              v-model="editedGateway.details.klarnaPaymentsEnableB2B"
                              label="Enable B2B"
                              hide-details
                            />
                          </div>
                          <div class="field-block">
                            <v-checkbox
                              v-model="editedGateway.details.klarnaPaymentsDataSharing"
                              label="Enable data sharing"
                              hide-details
                            />
                          </div>
                          <div class="field-block">
                            <v-checkbox
                              v-model="editedGateway.details.klarnaPaymentsDataSharingOnLoad"
                              label="Enable data sharing on load"
                              hide-details
                            />
                          </div>
                        </v-expansion-panel-content>
                      </v-expansion-panel>

                      <v-expansion-panel>
                        <v-expansion-panel-header>Klarna On-Site Messaging</v-expansion-panel-header>
                        <v-expansion-panel-content>
                          <div class="field-block">
                            <v-checkbox
                              v-model="editedGateway.details.klarnaMessagingEnable"
                              label="Enable messaging"
                              hide-details
                            />
                          </div>
                          <div class="field-block">
                            <Label>Placement</Label>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaMessagingPlacement"
                              dense
                              outlined
                              :items="['cart', 'product', 'sidebar']"
                              hide-details="auto"
                            />
                          </div>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
              </v-expansion-panels>
              </ModalCard>
            </template>

            <template v-if="editedGateway.code === 'sporopay'">
              <ModalCard
                title="SporoPay settings"
                subtitle="Bank account parameters required by Sporopay gateway."
              >
                      <div class="field-block">
                        <Label>Bank account prefix</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.bankAccountPrefix"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Bank account number</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.bankAccountNumber"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Bank code</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.bankCode"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Constant symbol</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.constantSymbol"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Safe key</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.safeKey"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Currency</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.currency"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Payment target url</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.paymentTargetUrl"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <Label>Payment return url</Label>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.paymentReturnUrl"
                          dense
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <v-checkbox
                          v-model="editedGateway.details.debug"
                          label="Debug mode"
                          hide-details
                        />
                      </div>
                      <div class="field-block">
                        <Label>Payment from applicable countries</Label>
                        <v-select
                          class="form-field"
                          v-model="editedGateway.details.allowedCountries"
                          dense
                          outlined
                          :items="['All Allowed Countries', 'Specific Countries']"
                          hide-details="auto"
                        />
                      </div>
              </ModalCard>
            </template>

            <!-- Destructive action section - at end of content -->
            <template v-if="!isCreating && canDelete">
              <ModalCard
                title="Delete gateway"
                subtitle="This action is irreversible. Once deleted, this gateway cannot be recovered."
                destructive
              >
                <v-card-actions class="destructive-actions">
                  <v-spacer />
                  <v-btn
                    v-if="!showDeleteConfirmation"
                    outlined
                    color="red"
                    @click="initiateDelete"
                  >
                    <v-icon left>mdi-delete-outline</v-icon>
                    Delete gateway
                  </v-btn>
                  <div v-else class="d-flex align-center" style="gap: 8px;">
                    <TertiaryButton text @click="showDeleteConfirmation = false">Cancel</TertiaryButton>
                    <v-btn color="red" dark @click="confirmDelete">
                      <v-icon left>mdi-delete</v-icon>
                      Confirm delete
                    </v-btn>
                  </div>
                </v-card-actions>
              </ModalCard>
            </template>
          </div>
        </v-form>
      </template>
      
      <template v-slot:footer>
        <v-spacer />
        <TertiaryButton text @click="handleDialogClose">Cancel</TertiaryButton>
        <v-btn color="primary" @click="saveGateway">Save</v-btn>
      </template>
    </Modal>

    <v-snackbar v-model="snackbar.show">
      {{ snackbar.text }}
      <TertiaryButton text @click="snackbar.show=false">Close</TertiaryButton>
    </v-snackbar>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import EmptyState from '@/components/common/EmptyState.vue';
import OverviewTableHeader from '@/components/common/OverviewTableHeader.vue';
import GatewayCard from '@/components/payments/GatewayCard.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Modal from '@/components/common/Modal.vue';
import ModalCard from '@/components/common/ModalCard.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import TertiaryButton from '@/components/common/TertiaryButton.vue';
import Label from '@/components/common/Label.vue';
import HintText from '@/components/common/HintText.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';
import roleStore from '@/store/roleStore';
import { getAssetPath } from '@/utils/paths';

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
  externalGuid: '',
  showDescription: true,
  bankAccountPrefix: '',
  bankAccountNumber: '',
  bankCode: '',
  constantSymbol: '',
  safeKey: '',
  currency: '',
  paymentTargetUrl: '',
  paymentReturnUrl: '',
  debug: false,
  allowedCountries: 'All Allowed Countries',
  specificCountries: [],
  klarnaApiEndpoint: 'Klarna Payments (Europe)',
  klarnaApiUsername: '',
  klarnaApiPassword: '',
  klarnaMode: 'Playground',
  klarnaLogging: 'Disable',
  klarnaPaymentsEnable: false,
  klarnaPaymentsAllowedCountries: 'All Allowed Countries',
  klarnaPaymentsEnableB2B: false,
  klarnaPaymentsDataSharing: true,
  klarnaPaymentsDataSharingOnLoad: true,
  klarnaMessagingEnable: false,
  klarnaMessagingPlacement: 'cart'
};

function cloneGateway(gateway) {
  return JSON.parse(JSON.stringify(gateway));
}

function buildGatewayTemplate(code = '') {
  const currentTenant = tenantStore.state.current;
  return {
    code,
    title: '',
    icon: '',
    disabledIcon: '',
    description: '',
    enabled: true,
    sortOrder: 0,
    language: 'EN',
    paymentAction: 'Authorize & Capture',
    updatedAt: new Date().toISOString(),
    countries: [currentTenant],
    debug: false,
    feeSettings: {
      priceType: 'Fixed price',
      minAmount: 0,
      maxAmount: 9999,
      refundable: false,
      amount: 0
    },
    details: { ...DETAIL_DEFAULTS }
  };
}

export default {
  name: 'PaymentMethodsOverview',
  components: { draggable, EmptyState, GatewayCard, OverviewTableHeader, PageHeader, Modal, ModalCard, StatusCard, TertiaryButton, Label, HintText },
  data() {
    return {
      search: '',
      showEnabledOnly: false,
      metadata: [],
      configDialog: false,
      editedGateway: null,
      originalCode: null,
      isCreating: false,
      dialogDirty: false,
      suspendDialogDirty: false,
      showDeleteConfirmation: false,
      snackbar: { show: false, text: '' },
      localGatewaysOrder: [],
      orderDirty: false,
      loading: false
    };
  },
  async created() {
    this.loading = true;
    try {
      const response = await fetch(getAssetPath('payment-methods.json'));
      if (response.ok) {
        const payload = await response.json();
        const methods = Array.isArray(payload.methods) ? payload.methods : [];
        // Transform icon paths to use correct base path
        this.metadata = methods.map(method => ({
          ...method,
          icon: method.icon ? getAssetPath(method.icon) : method.icon
        }));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Unable to load payment method metadata', error);
    } finally {
      this.loading = false;
    }
  },
  computed: {
    canCreate() {
      return roleStore.getters.canCreate();
    },
    canDelete() {
      return roleStore.getters.canDelete();
    },
    isAdminOrDev() {
      return roleStore.getters.canCreate(); // Admin and developer can create
    },
    isGlobalView() {
      return false;
    },
    showCountryBadge() {
      return false;
    },
    breadcrumbs() {
      return [
        { text: 'Payment section', disabled: true },
        { text: 'Payment methods overview', disabled: true }
      ];
    },
    iconOptions() {
      return this.metadata.map(method => ({
        text: method.title,
        value: method.icon,
        code: method.code
      }));
    },
    languages() {
      return ['EN', 'SK', 'IT', 'PL', 'CZ', 'RO', 'SR'];
    },
    actions() {
      return ['Authorize & Capture', 'Authorize only'];
    },
    metadataByCode() {
      return this.metadata.reduce((map, method) => {
        if (method && method.code) {
          map[method.code] = method;
        }
        return map;
      }, {});
    },
    countryOptions() {
      const codes = new Set();
      this.metadata.forEach(method => {
        (method.countries || []).forEach(code => {
          if (code !== 'GLO') codes.add(code);
        });
      });
      const ordered = Array.from(codes).sort((a, b) => a.localeCompare(b));
      return ordered.map(code => ({ label: this.countryLabel(code), value: code }));
    },
    allCountryOptions() {
      const allCountries = [
        { text: 'Austria (AT)', value: 'AT' },
        { text: 'Czechia (CZ)', value: 'CZ' },
        { text: 'Germany (DE)', value: 'DE' },
        { text: 'United Kingdom (GB)', value: 'GB' },
        { text: 'Hungary (HU)', value: 'HU' },
        { text: 'Italy (IT)', value: 'IT' },
        { text: 'Poland (PL)', value: 'PL' },
        { text: 'Romania (RO)', value: 'RO' },
        { text: 'Serbia (RS)', value: 'RS' },
        { text: 'Slovakia (SK)', value: 'SK' },
        { text: 'United States (US)', value: 'US' }
      ];
      return allCountries;
    },
    filteredGateways() {
      const term = (this.search || '').toLowerCase();
      return store.state.gateways.filter(gateway => {
        const title = (gateway.title || '').toLowerCase();
        const code = (gateway.code || '').toLowerCase();
        const matchesSearch = !term || title.includes(term) || code.includes(term);
        const matchesStatus = !this.showEnabledOnly || gateway.enabled;
        const countries =
          (gateway.countries && gateway.countries.length
            ? gateway.countries.filter(c => c !== 'GLO')
            : (this.metadataByCode[gateway.code]?.countries || []).filter(c => c !== 'GLO'));
        const tenantCode = tenantStore.state.current;
        const matchesCountry = countries.includes(tenantCode);

        return matchesSearch && matchesStatus && matchesCountry;
      });
    },
    sortedGateways() {
      return [...this.filteredGateways].sort((a, b) => {
        const orderA = a.sortOrder != null ? a.sortOrder : 999;
        const orderB = b.sortOrder != null ? b.sortOrder : 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.title || '').localeCompare(b.title || '');
      });
    },
    orderedGateways: {
      get() {
        return this.localGatewaysOrder;
      },
      set(newOrder) {
        this.localGatewaysOrder = newOrder;
        this.orderDirty = true;
        store.dirty.set('methodsOrder', true);
      }
    },
    orderHasChanged() {
      return this.orderDirty;
    },
    enabledCount() {
      return this.sortedGateways.filter(g => g.enabled).length;
    },
    enabledFilterCount() {
      return this.filteredGateways.filter(g => g.enabled).length;
    },
    dialogTitle() {
      if (this.isCreating) return 'Create gateway';
      return `Configure ${this.editedGateway?.title || this.editedGateway?.code || ''}`;
    },
    requiredRule() {
      return v => !!(v && String(v).trim()) || 'Required field';
    },
    urlRule() {
      return v => {
        if (!this.editedGateway?.enabled) return true;
        if (!v) return 'URL is required when payment method is enabled';
        return /^https?:\/\//i.test(v) || 'Must be a valid URL';
      };
    }
  },
  watch: {
    sortedGateways: {
      handler(newVal) {
        if (!newVal || !newVal.length) return;
        const currentCodes = (this.localGatewaysOrder || []).map(g => g.code).sort().join(',');
        const newCodes = newVal.map(g => g.code).sort().join(',');
        const setChanged = currentCodes !== newCodes;
        if (setChanged || !this.orderDirty) {
          this.localGatewaysOrder = [...newVal];
          if (setChanged) {
            this.orderDirty = false;
            store.dirty.clear('methodsOrder');
          }
        }
      },
      immediate: true
    },
    editedGateway: {
      deep: true,
      handler() {
        if (this.suspendDialogDirty) return;
        if (this.configDialog) this.dialogDirty = true;
      }
    }
  },
  methods: {
    saveOrder() {
      if (!this.orderHasChanged) return;
      store.actions.reorderPaymentMethods(this.localGatewaysOrder);
      this.orderDirty = false;
      store.dirty.clear('methodsOrder');
      this.snackbar = { show: true, text: 'Sort order saved' };
    },
    setShowEnabledOnly(val) {
      this.showEnabledOnly = val;
    },
    countryFilter(item, queryText) {
      const text = item.text || '';
      const value = item.value || '';
      const query = queryText.toLowerCase();
      return text.toLowerCase().includes(query) || value.toLowerCase().includes(query);
    },
    getGatewayIcon(code) {
      // Use icon from gateway if set, otherwise fall back to metadata
      const gateway = this.sortedGateways.find(g => g.code === code);
      if (gateway) {
        // If payment method is disabled and has a disabled icon, use it
        if (!gateway.enabled && gateway.disabledIcon) {
          return getAssetPath(typeof gateway.disabledIcon === 'string' ? gateway.disabledIcon : gateway.disabledIcon.value);
        }
        // Otherwise use regular icon
        if (gateway.icon) {
          return getAssetPath(typeof gateway.icon === 'string' ? gateway.icon : gateway.icon.value);
        }
      }
      const iconPath = this.metadataByCode[code]?.icon || '/icons/default.svg';
      return getAssetPath(iconPath);
    },
    getCountryFlag(countryCode) {
      if (!countryCode) return null;
      const option = tenantStore.state.options.find(opt => opt.code === countryCode);
      return option ? option.flag : null;
    },
    getCountryAbbreviation(countryCode) {
      const abbreviations = {
        'IT': 'ITA',
        'SK': 'SVK',
        'CZ': 'CZE',
        'RO': 'ROU',
        'PL': 'POL',
        'RS': 'SRB'
      };
      return abbreviations[countryCode] || countryCode;
    },
    countryLabel(code) {
      const tenantOption = tenantStore.state.options.find(option => option.code === code);
      if (tenantOption) return tenantOption.label;
      return code;
    },
    formatUpdated(value) {
      if (!value) return 'never';
      const date = new Date(value);
      return isNaN(date.getTime()) ? 'unknown' : date.toLocaleString();
    },
    ensureDetails(gateway) {
      gateway.details = { ...DETAIL_DEFAULTS, ...(gateway.details || {}) };
      if (!gateway.icon) gateway.icon = '';
      if (!gateway.disabledIcon) gateway.disabledIcon = '';
      if (!gateway.feeSettings) {
        gateway.feeSettings = {
          priceType: 'Fixed price',
          minAmount: 0,
          maxAmount: 9999,
          refundable: false,
          amount: 0
        };
      }
      return gateway;
    },
    openConfigure(gateway) {
      // Navigate to detail page instead of opening modal
      this.$router.push({ name: 'PaymentMethodDetail', params: { code: gateway.code } });
    },
    createGateway() {
      // Navigate to create page
      this.$router.push({ name: 'PaymentMethodCreate' });
    },
    handleDialogClose() {
      if (this.dialogDirty) {
        const proceed = window.confirm('Discard unsaved changes?');
        if (!proceed) return;
      }
      this.resetDialogState();
    },
    resetDialogState() {
      this.configDialog = false;
      this.showDeleteConfirmation = false;
      this.$nextTick(() => {
        if (this.$refs.gatewayForm && this.$refs.gatewayForm.resetValidation) {
          this.$refs.gatewayForm.resetValidation();
        }
      });
      this.editedGateway = null;
      this.originalCode = null;
      this.dialogDirty = false;
      this.isCreating = false;
    },
    validateForm() {
      if (!this.$refs.gatewayForm || !this.$refs.gatewayForm.validate) return true;
      return this.$refs.gatewayForm.validate();
    },
    preparePayload() {
      const payload = cloneGateway(this.editedGateway);
      payload.details = this.ensureDetails(payload).details;
      if (!payload.countries || !payload.countries.length) {
        const defaultCountries = (this.metadataByCode[payload.code]?.countries || []).filter(c => c !== 'GLO');
        payload.countries = defaultCountries.length ? defaultCountries : [tenantStore.state.current];
      }
      return payload;
    },
    saveGateway() {
      if (!this.validateForm()) return;
      this.loading = true;
      const payload = this.preparePayload();
      const trimmedTitle = (payload.title || '').trim();
      if (!trimmedTitle) {
        this.loading = false;
        this.snackbar = { show: true, text: 'Title is required' };
        return;
      }
      payload.title = trimmedTitle;
      // Code is auto-generated for new gateways, or preserved for existing ones
      if (!payload.code && this.isCreating) {
        payload.code = `new-${Math.random().toString(36).slice(2, 7)}`;
      }

      try {
        if (this.isCreating) {
          store.actions.createGateway(payload);
        } else {
          store.actions.updateGateway(this.originalCode, payload);
        }
        this.snackbar = { show: true, text: `Gateway ${this.isCreating ? 'created' : 'updated'}` };
        this.resetDialogState();
      } catch (error) {
        this.suspendDialogDirty = true;
        this.snackbar = { show: true, text: error.message || 'Unable to save gateway' };
        this.$nextTick(() => {
          this.suspendDialogDirty = false;
        });
      } finally {
        this.loading = false;
      }
    },
    initiateDelete() {
      if (!this.editedGateway || this.isCreating) return;
      this.showDeleteConfirmation = true;
    },
    confirmDelete() {
      if (!this.editedGateway || this.isCreating) return;
      this.loading = true;
      try {
        store.actions.deleteGateway(this.originalCode);
        this.snackbar = { show: true, text: 'Gateway deleted' };
        this.resetDialogState();
      } catch (error) {
        this.snackbar = { show: true, text: error.message || 'Unable to delete gateway' };
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;
@use '@/styles/form-fields.scss';

.gateways-page-wrapper {
  min-height: calc(100vh - 64px);
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

.search-field :deep(.v-input__slot) {
  background-color: white !important;
}

.breadcrumbs-text :deep(.v-breadcrumbs__item) {
  color: tokens.$color-text-secondary !important;
}

.breadcrumbs-text :deep(.v-breadcrumbs__divider) {
  color: tokens.$color-text-secondary !important;
}

.filter-wrapper {
  border-radius: 4px;
  padding: 11px 16px 15px 16px;
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.country-filter {
  min-width: 180px;
}

.country-filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.country-filter-item .country-flag {
  font-size: 16px;
  line-height: 1;
}

.section-heading {
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.modal-content {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}

.modal-form {
  display: flex;
  flex-direction: column;
}

.modal-footer-wrapper {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.modal-card {
  border-radius: 12px;
  padding: tokens.$space-xl;
  margin-bottom: 20px;
  background-color: tokens.$color-surface-muted;
}

.destructive-card {
  background-color: rgba(255, 0, 0, 0.04) !important;
  border-color: rgba(255, 0, 0, 0.12) !important;
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
  padding: tokens.$space-lg;
  margin-bottom: tokens.$space-lg;
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

.modal-footer {
  padding: 16px 24px;
  min-height: 64px;
}

.destructive-actions {
  padding: 0;
}


.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: tokens.$space-lg;
}

.fee-input-field :deep(.v-input) {
  max-width: 320px;
}

.gateways-hint-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: tokens.$space-md;
  padding: tokens.$space-lg tokens.$space-lg 0;

  .save-order-btn {
    flex-shrink: 0;
  }
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

.modal-section {
  margin-top: 24px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.54);
  margin-bottom: 4px;
}

.state-switch {
  margin: 0;
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

:deep(.gateway-card--ghost) {
  opacity: 0.5;
}

:deep(.gateway-card--drag) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.v-expansion-panels) {
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.v-expansion-panel) {
  box-shadow: none !important;
  border: 1px solid tokens.$color-border-subtle !important;
  border-radius: 12px !important;
  margin-bottom: tokens.$space-lg !important;
  background-color: tokens.$color-surface-muted !important;
}

:deep(.v-expansion-panel:before) {
  box-shadow: none !important;
}

:deep(.v-expansion-panel-header) {
  padding: tokens.$space-xl !important;
  min-height: auto !important;
  background-color: transparent !important;
}

:deep(.v-expansion-panel-header__icon) {
  margin-left: auto;
  margin-right: 0;
}

:deep(.v-expansion-panel-content__wrap) {
  padding: 0 tokens.$space-xl tokens.$space-xl tokens.$space-xl !important;
}
</style>


