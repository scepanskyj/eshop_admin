<template>
  <v-sheet
    class="status-card"
    :class="{ 'status-card--enabled': enabled, 'status-card--no-header': hideLabel }"
    border
  >
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
        <v-tooltip
          v-if="switchDisabled && switchDisabledHint"
          location="bottom"
          max-width="320"
        >
          <template #activator="{ props: tooltipProps }">
            <span
              v-bind="tooltipProps"
              class="state-switch-tooltip-activator"
              tabindex="0"
            >
              <v-switch
                v-model="enabled"
                inset
                hide-details
                class="state-switch"
                :disabled="switchDisabled"
              />
            </span>
          </template>
          <span class="text-body-2">{{ switchDisabledHint }}</span>
        </v-tooltip>
        <v-switch
          v-else
          v-model="enabled"
          inset
          hide-details
          class="state-switch"
          :disabled="switchDisabled"
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
    modelValue: {
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
    },
    switchDisabled: {
      type: Boolean,
      default: false
    },
    /** Shown as tooltip when the switch is disabled (e.g. hover or keyboard focus on wrapper). */
    switchDisabledHint: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  computed: {
    enabled: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
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

/* Compact bottom when only the switch row is shown (hideLabel) — avoids extra band below the row. */
.status-card--no-header {
  padding-bottom: tokens.$space-sm;
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

.state-switch-tooltip-activator {
  display: inline-flex;
  align-items: center;
  outline: none;
  border-radius: 999px;
  cursor: help;
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
  
  :deep(.v-switch__track) {
    background-color: rgba(0, 0, 0, 0.38);
  }
  
  :deep(.v-selection-control--dirty .v-switch__track) {
    background-color: tokens.$color-green-500;
  }
  
  :deep(.v-switch__thumb) {
    color: white !important;
  }
}
</style>
