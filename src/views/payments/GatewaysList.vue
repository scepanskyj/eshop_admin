<template>
  <div class="gateways-page-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs" title="Gateway configuration">
      <template v-slot:actions>
        <v-btn color="primary" @click="createGateway" :disabled="loading">
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
      icon="mdi-credit-card-outline"
      title="No gateways match"
      subtitle="Adjust filters or create a new gateway to get started."
      cta-label="Create gateway"
      @cta="createGateway"
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
      />
    </div>

    <Modal v-model="configDialog" :title="dialogTitle" max-width="720" @close="handleDialogClose">
      <template v-slot:content>
        <v-form ref="gatewayForm" lazy-validation v-if="editedGateway">
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
              title="Gateway overview"
              subtitle="Control availability and high level behaviour for this gateway."
            >
              <StatusCard v-model="editedGateway.enabled" />

                    <div class="field-block">
                      <div class="control-label">Title *</div>
                      <v-text-field
                        class="form-field"
                        v-model="editedGateway.title"
                        outlined
                        hide-details="auto"
                        :rules="[requiredRule]"
                      />
                    </div>
                    <div class="field-block">
                      <div class="control-label">Code *</div>
                      <v-text-field
                        class="form-field"
                        v-model="editedGateway.code"
                        outlined
                        hide-details="auto"
                        :rules="[requiredRule]"
                      />
                    </div>
                    <div class="field-block">
                      <div class="control-label">Sort order</div>
                      <v-text-field
                        class="form-field"
                        v-model.number="editedGateway.sortOrder"
                        outlined
                        type="number"
                        hide-details="auto"
                      />
                    </div>
                    <div class="field-block">
                      <div class="control-label">Gateway language</div>
                      <v-select
                        class="form-field"
                        v-model="editedGateway.language"
                        outlined
                        :items="languages"
                        hide-details="auto"
                      />
                    </div>
                    <div class="field-block">
                      <div class="control-label">Payment action</div>
                      <v-select
                        class="form-field"
                        v-model="editedGateway.paymentAction"
                        outlined
                        :items="actions"
                        hide-details="auto"
                      />
                    </div>
                    <div class="field-block">
                      <div class="control-label">Applicable countries</div>
                      <v-autocomplete
                        class="form-field"
                        v-model="editedGateway.countries"
                        outlined
                        :items="allCountryOptions"
                        multiple
                        chips
                        hide-details="auto"
                        :filter="countryFilter"
                      />
                    </div>
            </ModalCard>

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
                            <div class="control-label">Endpoint</div>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaApiEndpoint"
                              outlined
                              :items="['Klarna Payments (Europe)', 'Klarna Payments (US)']"
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Klarna API username</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.klarnaApiUsername"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Klarna API password</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.klarnaApiPassword"
                              outlined
                              type="password"
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Mode</div>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaMode"
                              outlined
                              :items="['Playground', 'Production']"
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Logging</div>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaLogging"
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
                            <div class="control-label">Allowed countries</div>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaPaymentsAllowedCountries"
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
                            <div class="control-label">Placement</div>
                            <v-select
                              class="form-field"
                              v-model="editedGateway.details.klarnaMessagingPlacement"
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
                        <div class="control-label">Bank account prefix</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.bankAccountPrefix"
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <div class="control-label">Bank account number</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.bankAccountNumber"
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <div class="control-label">Bank code</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.bankCode"
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <div class="control-label">Constant symbol</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.constantSymbol"
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <div class="control-label">Safe key</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.safeKey"
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <div class="control-label">Currency</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.currency"
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <div class="control-label">Payment target url</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.paymentTargetUrl"
                          outlined
                          hide-details="auto"
                        />
                      </div>
                      <div class="field-block">
                        <div class="control-label">Payment return url</div>
                        <v-text-field
                          class="form-field"
                          v-model="editedGateway.details.paymentReturnUrl"
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
                        <div class="control-label">Payment from applicable countries</div>
                        <v-select
                          class="form-field"
                          v-model="editedGateway.details.allowedCountries"
                          outlined
                          :items="['All Allowed Countries', 'Specific Countries']"
                          hide-details="auto"
                        />
                      </div>
              </ModalCard>
            </template>

              <v-expansion-panels>
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    <div>
                      <div class="modal-card__title">Technical details</div>
                      <div class="modal-card__subtitle">
                        Credentials and callback URLs used by the payment gateway.
                      </div>
                    </div>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div class="modal-card__body">
                          <div class="field-block">
                            <div class="control-label">Merchant ID</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.mid"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Gateway URL</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.url"
                              outlined
                              hide-details="auto"
                              :rules="[urlRule]"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Keys path</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.keysPath"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Private key filename</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.privateKey"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Public key filename</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.publicKey"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Success page URL</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.successUrl"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Fail page URL</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.failUrl"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">Terminal page domain</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.terminalDomain"
                              outlined
                              hide-details="auto"
                            />
                          </div>
                          <div class="field-block">
                            <v-checkbox
                              v-model="editedGateway.details.sendCartDescription"
                              label="Send cart description"
                              hide-details
                            />
                          </div>
                          <div class="field-block">
                            <v-checkbox
                              v-model="editedGateway.details.allowPrelive"
                              label="Allow pre-live integration controller"
                              hide-details
                            />
                          </div>
                          <div class="field-block">
                            <div class="control-label">External GUID</div>
                            <v-text-field
                              class="form-field"
                              v-model="editedGateway.details.externalGuid"
                              outlined
                              hide-details="auto"
                              :readonly="!!editedGateway.details.externalGuid"
                            />
                          </div>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>

            <!-- Destructive action section - at end of content -->
            <template v-if="!isCreating">
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
                    <v-btn text @click="showDeleteConfirmation = false">Cancel</v-btn>
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
        <v-btn text @click="handleDialogClose">Cancel</v-btn>
        <v-btn color="primary" @click="saveGateway">Save</v-btn>
      </template>
    </Modal>

    <v-snackbar v-model="snackbar.show">
      {{ snackbar.text }}
      <v-btn text @click="snackbar.show=false">Close</v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import EmptyState from '@/components/common/EmptyState.vue';
import GatewayCard from '@/components/payments/GatewayCard.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Modal from '@/components/common/Modal.vue';
import ModalCard from '@/components/common/ModalCard.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';

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
  return {
    code,
    title: '',
    enabled: true,
    sortOrder: 0,
    language: 'EN',
    paymentAction: 'Authorize & Capture',
    updatedAt: new Date().toISOString(),
    countries: ['GLO'],
    debug: false,
    details: { ...DETAIL_DEFAULTS }
  };
}

export default {
  name: 'GatewaysList',
  components: { EmptyState, GatewayCard, PageHeader, Modal, ModalCard, StatusCard },
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
      loading: false,
      filtering: false
    };
  },
  async created() {
    this.loading = true;
    try {
      const response = await fetch('/payment-methods.json');
      if (response.ok) {
        const payload = await response.json();
        this.metadata = Array.isArray(payload.methods) ? payload.methods : [];
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Unable to load payment method metadata', error);
    } finally {
      this.loading = false;
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { text: 'Payment section', disabled: true },
        { text: 'Gateways', disabled: true }
      ];
    },
    languages() {
      return ['EN', 'SK', 'IT', 'PL', 'CZ', 'RO'];
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
      const codes = new Set(['GLO']);
      this.metadata.forEach(method => {
        (method.countries || []).forEach(code => codes.add(code));
      });
      const ordered = Array.from(codes).sort((a, b) => {
        if (a === 'GLO') return -1;
        if (b === 'GLO') return 1;
        return a.localeCompare(b);
      });
      return ordered.map(code => ({ label: this.countryLabel(code), value: code }));
    },
    allCountryOptions() {
      const allCountries = [
        { text: 'ALL', value: 'GLO' },
        { text: 'Austria (AT)', value: 'AT' },
        { text: 'Czechia (CZ)', value: 'CZ' },
        { text: 'Germany (DE)', value: 'DE' },
        { text: 'United Kingdom (GB)', value: 'GB' },
        { text: 'Hungary (HU)', value: 'HU' },
        { text: 'Italy (IT)', value: 'IT' },
        { text: 'Poland (PL)', value: 'PL' },
        { text: 'Romania (RO)', value: 'RO' },
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
            ? gateway.countries
            : (this.metadataByCode[gateway.code]?.countries || ['GLO']));
        const tenantCode = tenantStore.state.current;
        const matchesCountry =
          tenantCode === 'GLO' ||
          countries.includes('GLO') ||
          countries.includes(tenantCode);

        return matchesSearch && matchesStatus && matchesCountry;
      });
    },
    sortedGateways() {
      return [...this.filteredGateways].sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );
    },
    enabledCount() {
      return this.sortedGateways.filter(g => g.enabled).length;
    },
    enabledFilterCount() {
      return store.state.gateways.filter(g => g.enabled).length;
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
        if (!v) return 'URL is required when gateway is enabled';
        return /^https?:\/\//i.test(v) || 'Must be a valid URL';
      };
    }
  },
  watch: {
    editedGateway: {
      deep: true,
      handler() {
        if (this.suspendDialogDirty) return;
        if (this.configDialog) this.dialogDirty = true;
      }
    }
  },
  methods: {
    onFilterChange() {
      this.filtering = true;
      setTimeout(() => {
        this.filtering = false;
      }, 800);
    },
    countryFilter(item, queryText) {
      const text = item.text || '';
      const value = item.value || '';
      const query = queryText.toLowerCase();
      return text.toLowerCase().includes(query) || value.toLowerCase().includes(query);
    },
    getGatewayIcon(code) {
      return this.metadataByCode[code]?.icon || '/icons/default.svg';
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
      return gateway;
    },
    openConfigure(gateway) {
      const snapshot = this.ensureDetails(cloneGateway(gateway));
      this.editedGateway = snapshot;
      this.originalCode = gateway.code;
      this.isCreating = false;
      this.dialogDirty = false;
      this.suspendDialogDirty = true;
      this.configDialog = true;
      this.$nextTick(() => {
        this.suspendDialogDirty = false;
      });
    },
    createGateway() {
      const code = `new-${Math.random().toString(36).slice(2, 7)}`;
      this.editedGateway = buildGatewayTemplate(code);
      this.originalCode = null;
      this.isCreating = true;
      this.dialogDirty = false;
      this.suspendDialogDirty = true;
      this.configDialog = true;
      this.$nextTick(() => {
        this.suspendDialogDirty = false;
      });
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
        payload.countries = this.metadataByCode[payload.code]?.countries || ['GLO'];
      }
      return payload;
    },
    saveGateway() {
      if (!this.validateForm()) return;
      this.loading = true;
      const payload = this.preparePayload();
      const trimmedTitle = (payload.title || '').trim();
      const trimmedCode = (payload.code || '').trim();
      if (!trimmedTitle) {
        this.loading = false;
        this.snackbar = { show: true, text: 'Title is required' };
        return;
      }
      if (!trimmedCode) {
        this.loading = false;
        this.snackbar = { show: true, text: 'Code is required' };
        return;
      }
      payload.title = trimmedTitle;
      payload.code = trimmedCode;

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

.control-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
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

.chip-enabled {
  background-color: tokens.$color-green !important;
}

.chip-disabled {
  background-color: #757575 !important;
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


