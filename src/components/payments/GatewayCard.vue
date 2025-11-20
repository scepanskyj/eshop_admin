<template>
  <v-card outlined class="gateway-card" @click="handleClick">
    <div class="gateway-content">
      <div class="gateway-header">
        <v-avatar size="48" class="gateway-avatar">
          <v-img :src="icon" :alt="`${gateway.title} icon`" contain />
        </v-avatar>
        <div class="gateway-header__meta">
          <div class="d-flex align-center mb-1">
            <div class="gateway-title" role="heading" aria-level="3">{{ gateway.title }}</div>
            <v-chip small :class="[gateway.enabled ? 'chip-enabled' : 'chip-disabled', 'ml-2']" text-color="white">
              {{ gateway.enabled ? 'Enabled' : 'Disabled' }}
            </v-chip>
            <v-chip v-if="showCountryBadge && countryFlag" small outlined class="ml-2 country-chip">
              <span class="country-flag">{{ countryFlag }}</span>
              <span v-if="countryAbbreviation" class="country-code">{{ countryAbbreviation }}</span>
            </v-chip>
          </div>
          <div class="gateway-updated">
            <span class="sr-only">Last updated</span>
            <span aria-hidden="true">Updated {{ updatedLabel }}</span>
          </div>
        </div>
        <v-btn outlined color="primary" @click.stop="onConfigure(gateway)" :aria-label="`Configure ${gateway.title}`" class="ml-auto">
          <v-icon left small>mdi-tune</v-icon>
          Configure
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'GatewayCard',
  props: {
    gateway: { type: Object, required: true },
    icon: { type: String, required: true },
    updatedLabel: { type: String, required: true },
    onConfigure: { type: Function, required: true },
    showCountryBadge: { type: Boolean, default: false },
    countryFlag: { type: String, default: null },
    countryAbbreviation: { type: String, default: null }
  },
  methods: {
    handleClick() {
      this.onConfigure(this.gateway);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.gateway-card {
  padding: tokens.$space-lg;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gateway-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
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
}

.gateway-title {
  font: tokens.$text-h5;
  color: tokens.$color-text-primary;
}

.gateway-updated {
  font: tokens.$text-p2;
  color: tokens.$color-text-secondary;
}

.chip-enabled {
  background-color: tokens.$color-green !important;
}

.chip-disabled {
  background-color: #757575 !important;
}

.country-chip {
  background-color: transparent !important;
  border-color: rgba(0, 0, 0, 0.2) !important;
}

.country-flag {
  font-size: 14px;
  line-height: 1;
  margin-right: 4px;
}

.country-code {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-left: 2px;
}

.sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}
</style>

