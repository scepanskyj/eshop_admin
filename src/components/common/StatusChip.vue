<template>
  <v-chip 
    size="small" 
    variant="default"
    :color="active ? 'green' : 'grey'"
    :class="chipClass"
  >
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
  font-size: 13px !important;
  font-weight: 500 !important;
  
  &.status-chip--active {
    // Tonal variant handles background, ensure text color
    color: tokens.$color-green-700 !important;
    background-color: tokens.$color-green-50 !important;
  }

  &.status-chip--inactive {
    // Tonal variant handles background, ensure text color  
    color: tokens.$color-gray-700 !important;
  }
}
</style>
