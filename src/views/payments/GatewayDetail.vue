<template>
  <div class="gateway-detail-wrapper">
    <PageHeader :breadcrumbs="breadcrumbs">
      <template v-slot:actions>
        <v-btn text @click="onCancel">Cancel</v-btn>
        <v-btn v-if="!isCreate && canDelete" text color="red" @click="confirmDelete = true" class="ml-2">
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-btn>
        <v-btn color="primary" @click="onSave" :loading="saving" class="ml-2">
          <v-icon left>mdi-check</v-icon>
          Save
        </v-btn>
      </template>
    </PageHeader>

    <v-row>
      <v-col cols="12" md="8">
        <ModalCard title="General settings">
          <div class="field-block">
            <div class="control-label">Title *</div>
            <v-text-field class="form-field" v-model="form.title" :rules="[v=>!!v||'Required']" outlined hide-details="auto" />
          </div>

          <StatusCard v-model="form.enabled" />

          <div class="field-block">
            <div class="control-label">ID gateway *</div>
            <v-text-field class="form-field" v-model="form.code" :rules="[v=>!!v||'Required']" outlined hide-details="auto" :disabled="!isCreate" />
          </div>
        </ModalCard>

        <ModalCard :title="gatewaySettingsTitle">
          <div class="field-block">
            <div class="control-label">Configuration (JSON) *</div>
            <v-textarea
              class="form-field json-editor"
              v-model="jsonConfig"
              outlined
              rows="20"
              hide-details="auto"
              placeholder='{"key": "value"}'
            />
            <div class="field-hint">Enter gateway configuration as JSON</div>
          </div>
        </ModalCard>
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
import PageHeader from '@/components/common/PageHeader.vue';
import ModalCard from '@/components/common/ModalCard.vue';
import StatusCard from '@/components/common/StatusCard.vue';
import store from '@/store/paymentsStore';
import roleStore from '@/store/roleStore';

export default {
  name: 'GatewayDetail',
  components: { PageHeader, ModalCard, StatusCard },
  props: { code: String },
  data() {
    return {
      form: this.buildForm(),
      confirmDelete: false,
      deleteConfirmText: '',
      snackbar: { show: false, text: '' },
      suspendDirty: true,
      jsonConfig: '',
      saving: false
    };
  },
  created() {
    this.jsonConfig = JSON.stringify(this.form.details || {}, null, 2);
    this.$nextTick(() => { this.suspendDirty = false; });
  },
  computed: {
    isCreate() { return !this.code || !store.state.gatewaysOnly.some(g => g.code === this.code); },
    breadcrumbs() {
      const baseTitle = this.isCreate ? 'Create gateway' : 'Gateway configuration';
      const title = this.form && this.form.title ? `${baseTitle} - ${this.form.title}` : baseTitle;
      return [
        { text: 'Payment section', disabled: true },
        { text: 'Gateways', to: { name: 'GatewaysList' } },
        { text: title, disabled: true }
      ];
    },
    gatewaySettingsTitle() {
      if (!this.form.title) return 'Gateway Settings';
      return `Gateway Settings - ${this.form.title}`;
    },
    canDelete() {
      return roleStore.getters.canDelete();
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
    jsonConfig() {
      if (this.suspendDirty) return;
      try {
        this.form.details = JSON.parse(this.jsonConfig);
        store.dirty.set('gatewayDetail', true);
      } catch (e) {
        // Invalid JSON, ignore for now
      }
    },
    code() {
      this.resetForm();
    }
  },
  methods: {
    buildForm() {
      const existing = store.state.gatewaysOnly.find(g => g.code === this.code);
      const base = existing || {
        code: this.code || '',
        title: '',
        enabled: true,
        updatedAt: new Date().toISOString(),
        details: {}
      };
      return JSON.parse(JSON.stringify(base));
    },
    resetForm() {
      this.suspendDirty = true;
      this.form = this.buildForm();
      this.jsonConfig = JSON.stringify(this.form.details || {}, null, 2);
      this.deleteConfirmText = '';
      this.confirmDelete = false;
      store.dirty.clear('gatewayDetail');
      this.$nextTick(() => { this.suspendDirty = false; });
    },
    async onSave() {
      // Validate JSON
      try {
        JSON.parse(this.jsonConfig);
      } catch (e) {
        this.snackbar = { show: true, text: 'Invalid JSON format' };
        return;
      }

      // simple validation
      if (!this.form.code) { this.snackbar = { show: true, text: 'Code is required' }; return; }
      if (!this.form.title) { this.snackbar = { show: true, text: 'Title is required' }; return; }
      
      this.saving = true;
      try {
        this.form.details = JSON.parse(this.jsonConfig);
        if (this.isCreate) {
          store.actions.createGateway(this.form);
        } else {
          store.actions.updateGateway(this.code, this.form);
        }
        store.dirty.clear('gatewayDetail');
        this.snackbar = { show: true, text: 'Gateway saved' };
        setTimeout(() => {
          this.$router.push({ name: 'GatewaysList' });
        }, 1000);
      } catch (e) {
        this.snackbar = { show: true, text: e.message || 'Save failed' };
      } finally {
        this.saving = false;
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

.gateway-detail-wrapper {
  background-color: tokens.$color-surface-muted;
  min-height: calc(100vh - 64px);
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

.json-editor :deep(textarea) {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.field-hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  margin-top: 4px;
}

// Truncate breadcrumb title if too long
:deep(.v-breadcrumbs__item:last-child) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
</style>
