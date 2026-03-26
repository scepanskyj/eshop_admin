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
      <v-row>
        <v-col cols="12" md="8" offset-md="0" class="content-col">
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

            <ModalCard title="Condition Builder">
              <PaymentRestrictionBuilder v-model="ruleForm.groups" />
            </ModalCard>

            <ModalCard title="Preview" class="preview-section">
              <PaymentRestrictionPreview
                :payment-methods="ruleForm.paymentMethods"
                :groups="ruleForm.groups"
              />
            </ModalCard>
          </v-form>
        </v-col>
      </v-row>
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
import PrimaryButton from '@/components/common/PrimaryButton.vue';
import TertiaryButton from '@/components/common/TertiaryButton.vue';
import Label from '@/components/common/Label.vue';
import HintText from '@/components/common/HintText.vue';
import IconButton from '@/components/common/IconButton.vue';
import store from '@/store/paymentsStore';
import tenantStore from '@/store/tenantStore';
import { createConditionGroup, createCondition } from '@/utils/paymentRestrictionTypes';
import { addUserExample } from '@/data/userExampleRules';

export default {
  name: 'PaymentRestrictionDetail',
  components: { RichTextStub, PageHeader, Modal, ModalCard, StatusCard, PaymentRestrictionBuilder, PaymentRestrictionPreview, PrimaryButton, TertiaryButton, Label, HintText, IconButton },
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
      // Ensure groups exist (for migrated rules)
      if (!this.ruleForm.groups || !Array.isArray(this.ruleForm.groups) || this.ruleForm.groups.length === 0) {
        this.ruleForm.groups = [createConditionGroup()];
      }
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
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    resetRuleForm() {
      this.setRuleForm(this.buildRuleForm());
    },
    buildRuleForm() {
      return {
        active: true,
        name: '',
        sortOrder: this.nextSortOrder(),
        paymentMethods: [],
        description: '',
        showWhenApplied: false,
        showInTooltip: false,
        reason: '',
        updatedBy: 'you',
        groups: [createConditionGroup()]
      };
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
          const preset = JSON.parse(raw);
          sessionStorage.removeItem(PRESET_STORAGE_KEY);
          this.ruleForm.name = preset.name || '';
          this.ruleForm.description = preset.description || '';
          this.ruleForm.paymentMethods = Array.isArray(preset.paymentMethods) ? [...preset.paymentMethods] : [];
          this.ruleForm.groups = preset.groups && preset.groups.length
            ? JSON.parse(JSON.stringify(preset.groups))
            : this.ruleForm.groups;
          if (preset.showWhenApplied !== undefined) this.ruleForm.showWhenApplied = preset.showWhenApplied;
          if (preset.showInTooltip !== undefined) this.ruleForm.showInTooltip = preset.showInTooltip;
          if (preset.reason !== undefined) this.ruleForm.reason = preset.reason;
          if (!this.ruleForm.showWhenApplied) this.ruleForm.showInTooltip = false;
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
          groups: this.ruleForm.groups && this.ruleForm.groups.length
            ? JSON.parse(JSON.stringify(this.ruleForm.groups))
            : [],
          showWhenApplied: this.ruleForm.showWhenApplied,
          showInTooltip: this.ruleForm.showInTooltip,
          reason: this.ruleForm.reason || ''
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
        groups: this.ruleForm.groups,
        showWhenApplied: this.ruleForm.showWhenApplied,
        showInTooltip: this.ruleForm.showInTooltip,
        reason: this.ruleForm.reason
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
      // Keep reasonDisplayMode in sync for backward compatibility
      this.ruleForm.reasonDisplayMode = !this.ruleForm.showWhenApplied ? 'none' : (this.ruleForm.showInTooltip ? 'tooltip' : 'direct');
      // Validate that at least one group has at least one condition
      const hasValidConditions = this.ruleForm.groups && this.ruleForm.groups.some(group =>
        group.conditions && group.conditions.some(cond => {
          if (!cond.type || !cond.operator) return false;
          if (cond.operator === 'equals_zero') return true; // value is implicitly 0
          return cond.value !== null && cond.value !== undefined && cond.value !== '';
        })
      );
      if (!hasValidConditions) {
        this.snackbar = { show: true, text: 'At least one condition is required' };
        return;
      }
      
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
}

.content-col {
  /* Allow column to shrink with grid; avoid overflow when md="8" is narrower than 800px (e.g. 960–1200px viewport) */
  min-width: min(800px, 100%);
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

.preview-section {
  margin-top: tokens.$space-lg;
}

.rich-text-stub-field {
  width: 100%;
}

</style>
