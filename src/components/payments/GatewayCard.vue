<template>
  <v-card variant="outlined" class="gateway-card">
    <div class="gateway-content">
      <div class="gateway-header">
        <div
          v-if="position !== undefined"
          class="card-drag-area"
        >
          <div class="gateway-order-cell">
            <div class="drag-handle">
              <v-icon>mdi-drag</v-icon>
            </div>
            <span class="position-badge">{{ position }}</span>
          </div>
          <v-avatar size="48" class="gateway-avatar">
            <v-img :src="icon" :alt="`${gateway.title} icon`" contain />
          </v-avatar>
          <div class="gateway-header__meta">
            <div class="gateway-title-group">
              <div class="gateway-title-row">
                <div class="gateway-title" role="heading" aria-level="3">{{ gateway.title }}</div>
                <StatusChip :active="gateway.enabled" active-label="Enabled" inactive-label="Disabled" class="ml-2" />
              </div>
              <div v-if="gateway.code" class="gateway-code" aria-label="Method code">{{ gateway.code }}</div>
            </div>
          </div>
        </div>
        <v-btn variant="outlined" color="primary" @click.stop="onConfigure(gateway)" :aria-label="`Configure ${gateway.title}`" class="ml-auto">
          <v-icon start size="small">mdi-tune</v-icon>
          Configure
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
import StatusChip from '@/components/common/StatusChip.vue';

export default {
  name: 'GatewayCard',
  components: { StatusChip },
  props: {
    gateway: { type: Object, required: true },
    icon: { type: String, required: true },
    onConfigure: { type: Function, required: true },
    position: { type: Number, default: undefined }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.gateway-card {
  padding: tokens.$space-lg;
  border-radius: 12px;
  border-color: tokens.$color-border-subtle !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.gateway-content {
  display: flex;
  flex-direction: column;
}

.gateway-header {
  display: flex;
  align-items: center;
  width: 100%;
}

.card-drag-area {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.gateway-order-cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: tokens.$space-sm;
  margin-right: tokens.$space-md;
  flex-shrink: 0;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  color: tokens.$color-text-secondary;
  padding: 6px;
}

.position-badge {
  font-size: 15px;
  font-weight: 500;
  color: tokens.$color-text-secondary;
  min-width: 20px;
}

.gateway-avatar {
  border-radius: 12px;
  background-color: rgba(71, 133, 10, 0.12);
  flex-shrink: 0;
}

.gateway-header__meta {
  flex: 1;
  margin-left: tokens.$space-md;
  display: flex;
  flex-direction: column;
  gap: tokens.$space-xs;
  min-width: 0;
}

.gateway-title-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}

.gateway-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: tokens.$space-xs;
  min-width: 0;
  width: 100%;
}

.gateway-title {
  font: tokens.$text-h5;
  color: tokens.$color-text-primary;
  min-width: 0;
}

.gateway-code {
  font: tokens.$text-p2;
  color: tokens.$color-text-secondary;
  margin-top: 0;
}
</style>

