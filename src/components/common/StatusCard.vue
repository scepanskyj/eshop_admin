<template>
  <v-sheet class="status-card" :class="{ 'status-card--enabled': enabled }" outlined>
    <div class="status-card__header">
      <span>{{ label || 'Status' }}</span>
      <v-chip small :class="enabled ? 'chip-enabled' : 'chip-disabled'" text-color="white">
        {{ enabled ? enabledLabel || 'Enabled' : disabledLabel || 'Disabled' }}
      </v-chip>
    </div>
    <div class="status-card__body">
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
export default {
  name: 'StatusCard',
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

.state-switch {
  margin: 0;
}

.chip-enabled {
  background-color: tokens.$color-green !important;
}

.chip-disabled {
  background-color: #757575 !important;
}
</style>

