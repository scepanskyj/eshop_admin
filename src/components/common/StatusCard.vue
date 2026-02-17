<template>
  <v-sheet class="status-card" :class="{ 'status-card--enabled': enabled }" outlined>
    <div v-if="!hideLabel" class="status-card__header">
      <span>{{ label || 'Status' }}</span>
      <StatusChip
        :active="enabled"
        :active-label="enabledLabel || 'Enabled'"
        :inactive-label="disabledLabel || 'Disabled'"
      />
    </div>
    <div class="status-card__body" :class="{ 'status-card__body--no-header': hideLabel }">
      <div class="switch-control">
        <span class="switch-state" :class="{ 'switch-state--on': enabled }">
          {{ enabled ? enabledLabel || 'Enabled' : disabledLabel || 'Disabled' }}
        </span>
        <v-switch
          v-model="enabled"
          inset
          hide-details
          class="state-switch"
        />
      </div>
    </div>
  </v-sheet>
</template>

<script>
import StatusChip from '@/components/common/StatusChip.vue';

export default {
  name: 'StatusCard',
  components: { StatusChip },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'Status'
    },
    enabledLabel: {
      type: String,
      default: 'Enabled'
    },
    disabledLabel: {
      type: String,
      default: 'Disabled'
    },
    hideLabel: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    enabled: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.status-card {
  border-radius: 12px;
  padding: tokens.$space-md;
  margin-bottom: tokens.$space-md;
  background-color: tokens.$color-surface-default;
  border: 1px solid tokens.$color-border-subtle;
}

.status-card--enabled {
  background-color: tokens.$color-green-50;
  border-color: rgba(tokens.$color-green-500, 0.2);
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

.status-card__body--no-header {
  margin-top: 0;
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
  color: tokens.$color-green-500;
}

.state-switch {
  margin: 0;
  
  :deep(.v-input--selection-controls__input .v-input--switch__thumb) {
    color: white !important;
  }
  
  :deep(.v-input--is-label-active .v-input--switch__track) {
    background-color: tokens.$color-green-500 !important;
  }
}

</style>

