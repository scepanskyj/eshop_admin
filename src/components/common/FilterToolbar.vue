<template>
  <div class="filter-toolbar">
    <v-toolbar flat color="transparent">
      <v-text-field
        v-model="localSearch"
        :label="searchLabel || 'Search'"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        @input="emitSearch"
      />

      <div class="quick-filters">
        <template v-for="q in quickFilters">
          <v-select
            :key="q.key"
            v-model="localQuick[q.key]"
            :items="q.items"
            :label="q.label"
            clearable
            hide-details
            class="mr-4"
            @change="emitQuick"
          />
        </template>
      </div>

      <v-spacer />
      <v-btn color="primary" outlined @click="dialog = true">
        <v-icon left>mdi-filter-variant</v-icon>
        Filters
      </v-btn>
    </v-toolbar>

    <div v-if="chips && chips.length" class="chips-row">
      <v-chip
        v-for="(chip, i) in chips"
        :key="i"
        class="mr-2 mb-2"
        close
        @click:close="$emit('remove-chip', chip)"
      >
        {{ chip.label }}
      </v-chip>
      <v-btn text small color="primary" @click="$emit('clear-all')">Clear all</v-btn>
    </div>

    <v-dialog v-model="dialog" max-width="900">
      <v-card>
        <v-toolbar flat>
          <v-toolbar-title>Filters</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider />
        
        <v-card-text class="modal-content">
          <v-container>
            <v-row>
              <template v-for="f in dialogFields">
                <v-col :key="f.key" cols="12" md="4">
                  <component
                    :is="fieldComponent(f)"
                    v-model="localDialog[f.key]"
                    :items="f.items || []"
                    :label="f.label"
                    :multiple="f.multiple || false"
                    :chips="f.multiple || false"
                    :type="f.type === 'text' ? 'text' : undefined"
                    clearable
                    hide-details
                  />
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>
        
        <div class="modal-footer-wrapper">
          <v-divider />
          <v-card-actions class="modal-footer">
            <v-spacer />
            <v-btn text @click="resetDialog">Reset</v-btn>
            <v-btn color="primary" @click="applyDialog">Apply</v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-dialog>
  </div>
 </template>

<script>
export default {
  name: 'FilterToolbar',
  props: {
    searchLabel: String,
    search: { type: String, default: '' },
    quickFilters: { type: Array, default: () => [] },
    quickValues: { type: Object, default: () => ({}) },
    dialogFields: { type: Array, default: () => [] },
    dialogValues: { type: Object, default: () => ({}) },
    chips: { type: Array, default: () => [] }
  },
  data() {
    return {
      localSearch: '',
      localQuick: {},
      localDialog: {},
      dialog: false
    };
  },
  watch: {
    search: {
      immediate: true,
      handler(val) {
        this.localSearch = val || '';
      }
    },
    quickValues: {
      immediate: true,
      deep: true,
      handler(val) {
        this.localQuick = { ...(val || {}) };
      }
    },
    dialogValues: {
      immediate: true,
      deep: true,
      handler(val) {
        this.localDialog = { ...(val || {}) };
      }
    }
  },
  methods: {
    fieldComponent(f) {
      if (f.type === 'switch') return 'v-switch';
      if (f.type === 'text') return 'v-text-field';
      return 'v-select';
    },
    normalize(obj = {}) {
      const clone = { ...obj };
      Object.keys(clone).forEach(key => {
        const value = clone[key];
        if (Array.isArray(value)) {
          if (!value.length) delete clone[key];
        } else if (value === '' || value === null || value === undefined) {
          delete clone[key];
        }
      });
      return clone;
    },
    emitSearch() {
      this.$emit('update:search', this.localSearch);
    },
    emitQuick() {
      const payload = this.normalize(this.localQuick || {});
      this.$emit('update:quickValues', payload);
    },
    emitDialog() {
      const payload = this.normalize(this.localDialog || {});
      this.$emit('update:dialogValues', payload);
    },
    applyDialog() {
      this.emitDialog();
      this.dialog = false;
    },
    resetDialog() {
      this.localDialog = {};
      this.applyDialog();
    }
  }
};
</script>

<style lang="scss" scoped>
.filter-toolbar .v-toolbar {
  padding-left: 0;
  padding-right: 0;
}
.quick-filters { display: flex; align-items: center; }
.chips-row { display: flex; align-items: center; flex-wrap: wrap; margin-top: 4px; }

.modal-content {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
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


