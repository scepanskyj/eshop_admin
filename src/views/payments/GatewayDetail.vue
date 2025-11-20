<template>
  <div class="page-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs" />

    <StickyActionsBar>
      <v-btn outlined @click="onCancel">Cancel</v-btn>
      <v-btn v-if="!isCreate" outlined color="red" @click="confirmDelete = true">Delete</v-btn>
      <v-btn color="primary" @click="onSave">Save</v-btn>
    </StickyActionsBar>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>General settings</v-card-title>
          <v-card-text>
            <div class="field-block">
              <v-checkbox v-model="form.enabled" label="Enabled" hint="Controls availability in checkout." persistent-hint hide-details />
            </div>
            <div class="field-block">
              <div class="control-label">Code *</div>
              <v-text-field class="form-field" v-model="form.code" :rules="[v=>!!v||'Required']" outlined hide-details="auto" />
            </div>
            <div class="field-block">
              <div class="control-label">Title *</div>
              <v-text-field class="form-field" v-model="form.title" :rules="[v=>!!v||'Required']" outlined hide-details="auto" />
            </div>
            <div class="field-block">
              <div class="control-label">Sort order</div>
              <v-text-field class="form-field" v-model.number="form.sortOrder" type="number" outlined hide-details="auto" />
            </div>
            <div class="field-block">
              <div class="control-label">Gateway language</div>
              <v-select class="form-field" v-model="form.language" :items="['EN','SK','DE','IT','CZ','HU']" outlined hide-details="auto" />
            </div>
            <div class="field-block">
              <div class="control-label">Payment action</div>
              <v-select class="form-field" v-model="form.paymentAction" :items="['Authorize & Capture','Authorize only']" outlined hide-details="auto" />
            </div>
            <div class="field-block">
              <div class="control-label">Applicable countries</div>
              <v-autocomplete class="form-field" v-model="form.countries" :items="['US','GB','DE','IT','SK','CZ','HU','AT']" multiple chips small-chips outlined hide-details="auto" />
            </div>
            <div class="field-block">
              <v-checkbox v-model="form.details.showDescription" label="Show description" hide-details />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-expansion-panels multiple>
          <v-expansion-panel>
            <v-expansion-panel-header>Details</v-expansion-panel-header>
            <v-expansion-panel-content>
              <div class="field-block">
                <div class="control-label">MID</div>
                <v-text-field class="form-field" v-model="form.details.mid" outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <div class="control-label">Gateway URL *</div>
                <v-text-field class="form-field" v-model="form.details.url" :rules="urlRules" outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <v-checkbox v-model="form.details.sendCartDescription" label="Send cart description" hide-details />
              </div>
              <div class="field-block">
                <div class="control-label">Keys path</div>
                <v-text-field class="form-field" v-model="form.details.keysPath" outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <div class="control-label">Private key filename</div>
                <v-text-field class="form-field" v-model="form.details.privateKey" outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <div class="control-label">Public key filename</div>
                <v-text-field class="form-field" v-model="form.details.publicKey" outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <div class="control-label">Success page URL</div>
                <v-text-field class="form-field" v-model="form.details.successUrl" outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <div class="control-label">Fail page URL</div>
                <v-text-field class="form-field" v-model="form.details.failUrl" outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <div class="control-label">Terminal page domain</div>
                <v-text-field class="form-field" v-model="form.details.terminalDomain" hint="Domain for external terminal page" persistent-hint outlined hide-details="auto" />
              </div>
              <div class="field-block">
                <v-checkbox v-model="form.debug" label="Debug" hide-details />
              </div>
              <div class="field-block">
                <v-checkbox v-model="form.details.allowPrelive" label="Allow Pre-live integration controller" hide-details />
              </div>
              <div class="field-block">
                <div class="control-label">External GUID</div>
                <v-text-field class="form-field" v-model="form.details.externalGuid" :readonly="!!form.details.externalGuid" outlined hide-details="auto" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <v-dialog v-model="confirmDelete" max-width="520" persistent>
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>Confirm delete</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="confirmDelete = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider />
        
        <v-card-text class="modal-content">
          <div class="text-body-1 mb-4">
            Type the code to delete: <strong>{{ code }}</strong>
          </div>
          <div class="field-block">
            <div class="control-label">Confirm by typing code</div>
            <v-text-field class="form-field" v-model="deleteConfirmText" outlined hide-details="auto" />
          </div>
        </v-card-text>
        
        <div class="modal-footer-wrapper">
          <v-divider />
          <v-card-actions class="modal-footer">
            <v-spacer />
            <v-btn text @click="confirmDelete = false">Cancel</v-btn>
            <v-btn :disabled="deleteConfirmText !== code" color="red" dark @click="onDelete">
              <v-icon left>mdi-delete</v-icon>
              Delete
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show">{{ snackbar.text }}<v-btn text @click="snackbar.show=false">Close</v-btn></v-snackbar>
  </div>
 </template>

<script>
import StickyActionsBar from '@/components/common/StickyActionsBar.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import store from '@/store/paymentsStore';

export default {
  name: 'GatewayDetail',
  components: { StickyActionsBar, PageHeader },
  props: { code: String },
  data() {
    return {
      form: this.buildForm(),
      confirmDelete: false,
      deleteConfirmText: '',
      snackbar: { show: false, text: '' },
      suspendDirty: true
    };
  },
  created() {
    this.$nextTick(() => { this.suspendDirty = false; });
  },
  computed: {
    isCreate() { return !store.state.gateways.some(g => g.code === this.code); },
    breadcrumbs() {
      return [
        { text: 'Payment methods', disabled: true },
        { text: this.isCreate ? 'Create gateway' : 'Gateway configuration', disabled: true }
      ];
    },
    urlRules() {
      return [v => (!this.form.enabled || /^https?:\/\//i.test(v || '')) || 'Must be a valid URL'];
    }
  },
  watch: {
    form: {
      handler() {
        if (this.suspendDirty) return;
        store.dirty.set('gatewayDetail', true);
      },
      deep: true
    },
    code() {
      this.resetForm();
    }
  },
  methods: {
    buildForm() {
      const existing = store.state.gateways.find(g => g.code === this.code);
      const base = existing || {
        code: this.code,
        title: '',
        enabled: true,
        sortOrder: 0,
        language: 'EN',
        paymentAction: 'Authorize & Capture',
        updatedAt: new Date().toISOString(),
        countries: [],
        debug: false,
        details: {
          mid: '', url: '', keysPath: '', privateKey: '', publicKey: '', successUrl: '', failUrl: '', terminalDomain: '', sendCartDescription: true, allowPrelive: false, externalGuid: '', showDescription: true
        }
      };
      return JSON.parse(JSON.stringify(base));
    },
    resetForm() {
      this.suspendDirty = true;
      this.form = this.buildForm();
      this.deleteConfirmText = '';
      this.confirmDelete = false;
      store.dirty.clear('gatewayDetail');
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    onSave() {
      // simple validation
      if (!this.form.code) { this.snackbar = { show: true, text: 'Code is required' }; return; }
      if (!this.form.title) { this.snackbar = { show: true, text: 'Title is required' }; return; }
      if (this.form.enabled && !/^https?:\/\//i.test(this.form.details.url || '')) { this.snackbar = { show: true, text: 'URL is required when enabled' }; return; }
      try {
        if (this.isCreate) {
          store.actions.createGateway(this.form);
        } else {
          store.actions.updateGateway(this.code, this.form);
        }
        store.dirty.clear('gatewayDetail');
        this.snackbar = { show: true, text: 'Gateway saved' };
        this.$router.push({ name: 'GatewaysList' });
      } catch (e) {
        this.snackbar = { show: true, text: e.message || 'Save failed' };
      }
    },
    onCancel() {
      const proceed = !store.dirty.shouldBlockNavigation() || window.confirm('Discard changes?');
      if (!proceed) return;
      store.dirty.clear('gatewayDetail');
      this.$router.push({ name: 'GatewaysList' });
    },
    onDelete() {
      store.actions.deleteGateway(this.code);
      store.dirty.clear('gatewayDetail');
      this.confirmDelete = false;
      this.$router.push({ name: 'GatewaysList' });
      this.snackbar = { show: true, text: 'Gateway deleted' };
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
</style>


