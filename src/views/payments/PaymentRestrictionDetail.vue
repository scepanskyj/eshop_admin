<template>
  <div class="payment-restriction-detail-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <TertiaryButton variant="text" @click="handleCancel">Cancel</TertiaryButton>
        <PrimaryButton @click="handleSave" :loading="saving" class="ml-2">
          <v-icon start>mdi-check</v-icon>
          Save
        </PrimaryButton>
        <v-menu location="start bottom">
          <template v-slot:activator="{ props }">
            <IconButton class="ml-2" v-bind="props" aria-label="More actions">
              <v-icon>mdi-dots-vertical</v-icon>
            </IconButton>
          </template>
          <v-list density="compact">
            <v-list-item @click="handleDuplicate" prepend-icon="mdi-content-copy">
              <v-list-item-title>Duplicate</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleSaveAsExample" prepend-icon="mdi-bookmark-plus-outline">
              <v-list-item-title>Save as example</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="!isCreate" @click="deleteDialog = true" class="red--text" prepend-icon="mdi-delete-outline">
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </PageHeader>

    <div v-if="ruleForm" class="payment-restriction-content">
      <div class="payment-restriction-detail-layout">
        <div class="payment-restriction-form-column">
          <v-form ref="ruleFormRef" v-model="formValid">
            <ModalCard title="Status">
              <StatusCard
                v-model="ruleForm.active"
                hide-label
                enabled-label="Active"
                disabled-label="Inactive"
              />
            </ModalCard>

            <ModalCard title="Restriction overview">
              <div class="field-block">
                <Label>Name <span class="required-asterisk">*</span></Label>
                <v-text-field
                  class="form-field"
                  v-model="ruleForm.name"
                  :rules="[v=>!!v||'Required']"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </div>

              <div class="field-block">
                <Label>Priority order</Label>
                <HintText>
                  Lower numbers are evaluated first. This matches the order on the restrictions list; you can also drag rows there and use Save sort order.
                </HintText>
                <v-text-field
                  class="form-field"
                  v-model.number="ruleForm.sortOrder"
                  type="number"
                  min="0"
                  step="1"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  :rules="[sortOrderRule]"
                />
              </div>

              <div class="field-block">
                <Label>Payment method <span class="required-asterisk">*</span></Label>
                <HintText>Selected payment method codes are affected by this restriction.</HintText>
                <v-autocomplete
                  class="form-field"
                  v-model="ruleForm.paymentMethods"
                  :items="availablePaymentMethods"
                  item-title="text"
                  item-value="value"
                  :rules="[v => (Array.isArray(v) && v.length > 0) || 'At least one payment method is required']"
                  multiple
                  chips
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </div>

              <div class="field-block">
                <Label>Description</Label>
                <HintText>This is only internal and will serve for your purposes</HintText>
                <v-textarea
                  class="form-field description-textarea"
                  v-model="ruleForm.description"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </div>

              <div v-if="showShopTypeField" class="field-block">
                <Label>Shop type</Label>
                <HintText>Applies only to shop types available for your market.</HintText>
                <v-select
                  class="form-field"
                  v-model="ruleForm.shopType"
                  :items="shopTypeSelectItems"
                  item-title="title"
                  item-value="value"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                />
              </div>

              <div class="field-block reason-field-block">
                <Label>Reason</Label>
                <HintText>This text is shown to customers when a payment method is disabled by this restriction.</HintText>
                <RichTextStub v-model="ruleForm.reason" class="rich-text-stub-field" />
                <v-checkbox
                  v-model="ruleForm.showWhenApplied"
                  label="Display reason to customer"
                  color="primary"
                  hide-details
                />
                <v-checkbox
                  v-model="ruleForm.showInTooltip"
                  label="Show reason in tooltip"
                  color="primary"
                  hide-details
                  class="mt-2"
                  :disabled="!ruleForm.showWhenApplied"
                />
              </div>
            </ModalCard>

            <ModalCard
              title="Condition Builder"
              subtitle="Add conditions or one group. Nested groups are not available. Click the chips between rows to switch between AND and OR."
            >
              <PaymentRestrictionBuilder v-model="ruleForm.conditionRoot" />
              <PaymentRestrictionPreview
                class="restriction-condition-preview mt-4"
                :payment-methods="ruleForm.paymentMethods"
                :condition-root="ruleForm.conditionRoot"
              />
            </ModalCard>
          </v-form>
        </div>

        <aside class="payment-restriction-preview-column" aria-label="Restriction checkout preview">
          <div class="payment-restriction-preview-inner">
            <ModalCard title="Checkout preview" class="restriction-preview-modal">
              <HintText class="restriction-preview-hint">
                Lists all methods for this country. Restricted targets use disabled styling and your reason settings.
              </HintText>
              <RestrictionMethodsListPreview
                :gateways="sortedGatewaysForPreview"
                :restricted-codes="ruleForm.paymentMethods"
                :reason="ruleForm.reason"
                :show-when-applied="ruleForm.showWhenApplied"
                :show-in-tooltip="ruleForm.showInTooltip"
                :assume-rule-applies="true"
              />
            </ModalCard>
          </div>
        </aside>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Modal v-model="deleteDialog" title="Delete restriction" max-width="520" @close="cancelDelete">
      <template v-slot:content>
        <div class="text-body-1 mb-2">
          Are you sure you want to delete <strong>{{ ruleForm && ruleForm.name }}</strong>?
        </div>
      </template>
      
      <template v-slot:footer>
        <v-spacer />
        <TertiaryButton variant="text" @click="cancelDelete">Cancel</TertiaryButton>
        <v-btn color="red" variant="plain" @click="doDelete">
          <v-icon start>mdi-delete-outline</v-icon>
          Delete
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
import RichTextStub from '@/components/common/RichTextStub.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import Modal from '@/components/common/Modal.vue';
import ModalCard from '@/components/common/ModalCard.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import PaymentRestrictionBuilder from '@/components/payments/PaymentRestrictionBuilder.vue';
import PaymentRestrictionPreview from '@/components/payments/PaymentRestrictionPreview.vue';
import RestrictionMethodsListPreview from '@/components/payments/RestrictionMethodsListPreview.vue';
import PrimaryButton from '@/components/common/PrimaryButton.vue';
import TertiaryButton from '@/components/common/TertiaryButton.vue';
import Label from '@/components/common/Label.vue';
import HintText from '@/components/common/HintText.vue';
import IconButton from '@/components/common/IconButton.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';
import { createClause, ensureConditionRoot, clauseHasAnyComplete } from '@/utils/conditionClause';
import { addUserExample } from '@/data/userExampleRules';
import {
  showShopTypeForTenant,
  shopTypeOptionsForTenant,
  defaultShopTypeForTenant
} from '@/utils/shopTypeByTenant';
import {
  scopedPaymentMethods,
  normalizeConditionRootForCountry
} from '@/utils/paymentMethodCountryScope';
import { expandLegacyPaymentMethodCodes } from '@/utils/ruleMigration';

export default {
  name: 'PaymentRestrictionDetail',
  components: {
    RichTextStub,
    PageHeader,
    Modal,
    ModalCard,
    StatusCard,
    PaymentRestrictionBuilder,
    PaymentRestrictionPreview,
    RestrictionMethodsListPreview,
    PrimaryButton,
    TertiaryButton,
    Label,
    HintText,
    IconButton
  },
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
      deleteDialog: false
    };
  },
  computed: {
    tenantCode() {
      return tenantStore.state.current;
    },
    showShopTypeField() {
      return showShopTypeForTenant(this.tenantCode);
    },
    shopTypeSelectItems() {
      return shopTypeOptionsForTenant(this.tenantCode);
    },
    sortedGatewaysForPreview() {
      const t = this.tenantCode;
      return store.state.gateways
        .filter(g => g && (g.countries || []).includes(t))
        .slice()
        .sort((a, b) => (a.title || a.code || '').localeCompare(b.title || b.code || '', undefined, { sensitivity: 'base' }));
    },
    isCreate() {
      return !this.id || this.id === 'create';
    },
    breadcrumbs() {
      const crumbs = [
        { title: 'Payment methods', disabled: false, to: { name: 'PaymentRestrictions' } },
        { title: 'Payment restrictions', disabled: false, to: { name: 'PaymentRestrictions' } }
      ];
      if (this.isCreate) {
        crumbs.push({ title: this.ruleForm?.name || 'New restriction', disabled: true });
      } else {
        crumbs.push({ title: this.ruleForm?.name || 'Edit restriction', disabled: true });
      }
      return crumbs;
    },
    availablePaymentMethods() {
      const currentTenant = tenantStore.state.current;
      return store.state.gateways
        .filter(g => g && (g.countries || []).includes(currentTenant))
        .map(g => ({
          text: g.code,
          value: g.code
        }));
    },
  },
  watch: {
    id: {
      handler() {
        this.initializeForm();
        if (this.isCreate && this.$route.query.loadPreset) {
          this.$nextTick(() => this.loadPresetFromStorage());
        }
      }
    },
    ruleForm: {
      deep: true,
      handler() {
        if (this.suspendDirty) return;
        store.dirty.set('rulesForm', true);
      }
    },
    'ruleForm.showWhenApplied'(val) {
      if (!val && this.ruleForm.showInTooltip) {
        this.ruleForm.showInTooltip = false;
      }
    },
    tenantCode(newVal, oldVal) {
      if (oldVal === undefined || !this.ruleForm) return;
      this.suspendDirty = true;
      this.applyScopedPaymentMethodsToForm();
      this.$nextTick(() => {
        this.suspendDirty = false;
      });
    }
  },
  created() {
    this.initializeForm();
    if (this.isCreate && this.$route.query.loadPreset) {
      this.$nextTick(() => this.loadPresetFromStorage());
    }
  },
  methods: {
    initializeForm() {
      if (this.isCreate) {
        this.resetRuleForm();
      } else {
        const rule = store.state.rules.find(r => String(r.id) === String(this.id));
        if (rule) {
          this.setRuleForm(rule);
        } else {
          this.snackbar = { show: true, text: 'Restriction not found' };
          this.$router.push({ name: 'PaymentRestrictions' });
        }
      }
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    setRuleForm(payload) {
      this.suspendDirty = true;
      this.ruleForm = JSON.parse(JSON.stringify(payload));
      ensureConditionRoot(this.ruleForm);
      delete this.ruleForm.groups;
      // Migrate reasonDisplayMode to showWhenApplied + showInTooltip
      if (this.ruleForm.reasonDisplayMode !== undefined) {
        this.ruleForm.showWhenApplied = this.ruleForm.reasonDisplayMode !== 'none';
        this.ruleForm.showInTooltip = this.ruleForm.reasonDisplayMode === 'tooltip';
      }
      if (this.ruleForm.showInTooltip === undefined) {
        this.ruleForm.showInTooltip = false;
      }
      if (this.ruleForm.showWhenApplied === undefined) {
        this.ruleForm.showWhenApplied = false;
      }
      if (this.ruleForm.sortOrder === undefined || this.ruleForm.sortOrder === null || this.ruleForm.sortOrder === '') {
        this.ruleForm.sortOrder = this.nextSortOrder();
      } else {
        this.ruleForm.sortOrder = Number(this.ruleForm.sortOrder);
      }
      this.normalizeShopTypeOnForm();
      this.applyScopedPaymentMethodsToForm();
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    applyScopedPaymentMethodsToForm() {
      if (!this.ruleForm) return;
      const t = this.tenantCode;
      const gw = store.state.gateways;
      this.ruleForm.paymentMethods = scopedPaymentMethods(
        this.ruleForm.paymentMethods,
        t,
        gw
      );
      this.ruleForm.conditionRoot = normalizeConditionRootForCountry(
        this.ruleForm.conditionRoot,
        t,
        gw
      );
    },
    resetRuleForm() {
      this.setRuleForm(this.buildRuleForm());
    },
    buildRuleForm() {
      const t = this.tenantCode;
      return {
        active: true,
        name: '',
        sortOrder: this.nextSortOrder(),
        paymentMethods: [],
        description: '',
        shopType: showShopTypeForTenant(t) ? defaultShopTypeForTenant(t) : null,
        showWhenApplied: false,
        showInTooltip: false,
        reason: '',
        updatedBy: 'you',
        conditionRoot: createClause()
      };
    },
    normalizeShopTypeOnForm() {
      if (!this.ruleForm) return;
      if (showShopTypeForTenant(this.tenantCode)) {
        if (this.ruleForm.shopType == null || this.ruleForm.shopType === '') {
          this.ruleForm.shopType = defaultShopTypeForTenant(this.tenantCode);
        }
      } else {
        this.ruleForm.shopType = null;
      }
    },
    nextSortOrder() {
      const max = store.state.rules.reduce(
        (m, r) => Math.max(m, r.sortOrder != null ? Number(r.sortOrder) : -1),
        -1
      );
      return max + 1;
    },
    sortOrderRule(v) {
      if (v === null || v === undefined || v === '') return 'Required';
      const n = Number(v);
      if (Number.isNaN(n) || n < 0) return 'Use 0 or a positive number';
      return true;
    },
    loadPresetFromStorage() {
      const PRESET_STORAGE_KEY = 'paymentRestrictionPreset';
      try {
        const raw = sessionStorage.getItem(PRESET_STORAGE_KEY);
        if (raw) {
          const preset = expandLegacyPaymentMethodCodes(JSON.parse(raw));
          sessionStorage.removeItem(PRESET_STORAGE_KEY);
          this.ruleForm.name = preset.name || '';
          this.ruleForm.description = preset.description || '';
          this.ruleForm.paymentMethods = Array.isArray(preset.paymentMethods) ? [...preset.paymentMethods] : [];
          if (preset.conditionRoot && Array.isArray(preset.conditionRoot.parts)) {
            this.ruleForm.conditionRoot = JSON.parse(JSON.stringify(preset.conditionRoot));
          } else if (preset.groups && preset.groups.length) {
            this.ruleForm.groups = JSON.parse(JSON.stringify(preset.groups));
            ensureConditionRoot(this.ruleForm);
            delete this.ruleForm.groups;
          }
          if (preset.showWhenApplied !== undefined) this.ruleForm.showWhenApplied = preset.showWhenApplied;
          if (preset.showInTooltip !== undefined) this.ruleForm.showInTooltip = preset.showInTooltip;
          if (preset.reason !== undefined) this.ruleForm.reason = preset.reason;
          if (preset.shopType !== undefined) this.ruleForm.shopType = preset.shopType;
          if (!this.ruleForm.showWhenApplied) this.ruleForm.showInTooltip = false;
          this.normalizeShopTypeOnForm();
          this.applyScopedPaymentMethodsToForm();
          this.snackbar = { show: true, text: `Loaded example restriction: ${preset.name}` };
        }
        this.$router.replace({ path: this.$route.path, query: {} });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not load preset', e);
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
    handleDuplicate() {
      const PRESET_STORAGE_KEY = 'paymentRestrictionPreset';
      try {
        sessionStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify({
          name: (this.ruleForm.name || '') + ' (duplicate)',
          description: this.ruleForm.description,
          paymentMethods: Array.isArray(this.ruleForm.paymentMethods) ? [...this.ruleForm.paymentMethods] : [],
          conditionRoot: this.ruleForm.conditionRoot
            ? JSON.parse(JSON.stringify(this.ruleForm.conditionRoot))
            : null,
          showWhenApplied: this.ruleForm.showWhenApplied,
          showInTooltip: this.ruleForm.showInTooltip,
          reason: this.ruleForm.reason || '',
          shopType: this.ruleForm.shopType
        }));
      } catch (e) {
        this.snackbar = { show: true, text: 'Could not prepare duplicate' };
        return;
      }
      store.dirty.clear('rulesForm');
      this.$router.push({ name: 'PaymentRestrictionCreate', query: { loadPreset: '1' } });
    },
    handleSaveAsExample() {
      const country = tenantStore.state.current;
      addUserExample(country, {
        name: this.ruleForm.name,
        description: this.ruleForm.description,
        paymentMethods: this.ruleForm.paymentMethods,
        conditionRoot: this.ruleForm.conditionRoot
          ? JSON.parse(JSON.stringify(this.ruleForm.conditionRoot))
          : null,
        showWhenApplied: this.ruleForm.showWhenApplied,
        showInTooltip: this.ruleForm.showInTooltip,
        reason: this.ruleForm.reason,
        shopType: this.ruleForm.shopType
      });
      const opt = tenantStore.state.options.find(o => o.code === country);
      const countryLabel = opt ? opt.label : country;
      this.snackbar = { show: true, text: `Restriction saved as example for ${countryLabel}` };
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
      if (!this.ruleForm.paymentMethods || this.ruleForm.paymentMethods.length === 0) {
        this.snackbar = { show: true, text: 'At least one payment method is required' };
        return;
      }
      this.normalizeShopTypeOnForm();
      // Keep reasonDisplayMode in sync for backward compatibility
      this.ruleForm.reasonDisplayMode = !this.ruleForm.showWhenApplied ? 'none' : (this.ruleForm.showInTooltip ? 'tooltip' : 'direct');
      const hasValidConditions = clauseHasAnyComplete(this.ruleForm.conditionRoot);
      if (!hasValidConditions) {
        this.snackbar = { show: true, text: 'At least one condition is required' };
        return;
      }

      delete this.ruleForm.groups;
      this.saving = true;
      try {
        if (this.isCreate) {
          const created = store.actions.createRule(this.ruleForm);
          this.snackbar = { show: true, text: 'Restriction created' };
          store.dirty.clear('rulesForm');
          this.$router.push({ name: 'PaymentRestrictionDetail', params: { id: created.id } });
        } else {
          store.actions.updateRule(this.id, this.ruleForm);
          this.snackbar = { show: true, text: 'Restriction updated' };
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
    },
    doDelete() {
      if (!this.ruleForm) return;
      try {
        store.actions.deleteRule(this.id);
        this.snackbar = { show: true, text: 'Restriction deleted' };
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
  padding: tokens.$page-padding;
}

.payment-restriction-content {
  margin-top: tokens.$space-lg;
  container-type: inline-size;
  container-name: pr-layout;
}

.payment-restriction-detail-layout {
  display: grid;
  grid-template-columns: minmax(560px, min(800px, 100%)) minmax(328px, min(400px, 100%));
  gap: tokens.$space-lg;
  align-items: stretch;
  justify-content: start;
  width: 100%;
  min-width: 0;
}

.payment-restriction-form-column {
  align-self: start;
  min-width: 0;
  max-width: 800px;
  width: 100%;
}

.payment-restriction-preview-column {
  align-self: stretch;
  min-width: 0;
  max-width: 800px;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.payment-restriction-preview-inner {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
  position: sticky;
  top: calc(var(--v-layout-top, #{tokens.$space-4xl}) + #{tokens.$space-md});
  align-self: flex-start;
  width: 100%;
  z-index: 1;
}

.restriction-preview-modal {
  margin-bottom: 0 !important;
}

.restriction-preview-hint {
  margin: 0 0 tokens.$space-sm 0;
}

/* Stack when 800px form + gap + 328px preview cannot sit side by side */
@container pr-layout (max-width: 1152px) {
  .payment-restriction-detail-layout {
    grid-template-columns: 1fr;
  }

  .payment-restriction-preview-column {
    order: 2;
  }

  .payment-restriction-form-column {
    order: 1;
  }
}

@supports not (container-type: inline-size) {
  @media (max-width: 1152px) {
    .payment-restriction-detail-layout {
      grid-template-columns: 1fr;
    }

    .payment-restriction-preview-column {
      order: 2;
    }

    .payment-restriction-form-column {
      order: 1;
    }
  }
}

.field-block {
  margin-bottom: tokens.$space-xl !important;
  
  &:last-child {
    margin-bottom: 0 !important;
  }
}

.description-textarea {
  min-height: 120px;
  
  :deep(.v-input__control textarea) {
    min-height: 120px !important;
  }
}

.rich-text-stub-field {
  width: 100%;
}

</style>
