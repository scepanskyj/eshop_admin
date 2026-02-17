<template>
  <div class="overview-table-header">
    <div class="header-tabs">
      <button
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': !filterActive }"
        @click="$emit('update:filterActive', false)"
      >
        All
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': filterActive }"
        @click="$emit('update:filterActive', true)"
      >
        Active
        <span v-if="activeCount !== undefined" class="tab-badge">{{ activeCount }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OverviewTableHeader',
  props: {
    filterActive: {
      type: Boolean,
      default: false
    },
    activeCount: {
      type: Number,
      default: undefined
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.overview-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background-color: tokens.$color-surface-default;
  border-bottom: 1px solid tokens.$color-border-subtle;
}

.header-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: tokens.$color-text-secondary;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 8px;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    color: tokens.$color-text-primary;
  }

  &--active {
    background-color: rgba(0, 0, 0, 0.08);
    color: tokens.$color-text-primary;
  }
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-left: 6px;
  font-size: 11px;
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.12);
  border-radius: 9px;
  color: tokens.$color-text-primary;
}
</style>
