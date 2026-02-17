<template>
  <v-chip small :class="chipClass" text-color="white">
    {{ label }}
  </v-chip>
</template>

<script>
export default {
  name: 'StatusChip',
  props: {
    active: {
      type: Boolean,
      default: true
    },
    activeLabel: {
      type: String,
      default: 'Active'
    },
    inactiveLabel: {
      type: String,
      default: 'Inactive'
    }
  },
  computed: {
    label() {
      return this.active ? this.activeLabel : this.inactiveLabel;
    },
    chipClass() {
      return this.active ? 'status-chip status-chip--active' : 'status-chip status-chip--inactive';
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.status-chip {
  &.status-chip--active {
    background-color: tokens.$color-green-50 !important;
    color: tokens.$color-green-700 !important;
    font-size: 13px !important;
    font-weight: 500 !important;
  }

  &.status-chip--inactive {
    background-color: tokens.$color-gray-50 !important;
    color: tokens.$color-gray-700 !important;
    font-size: 13px !important;
    font-weight: 500 !important;
  }
}
</style>
