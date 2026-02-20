<template>
  <v-breadcrumbs :items="normalizedItems" class="no-left-padding" />
</template>

<script>
export default {
  name: 'Breadcrumbs',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  computed: {
    normalizedItems() {
      // Vuetify 3 v-breadcrumbs expects 'title'; support both 'title' and 'text'
      return (this.items || []).map(item => ({
        ...item,
        title: item.title ?? item.text ?? '',
        disabled: item.disabled ?? false
      }));
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;


// Breadcrumb items - visible text (secondary), links in primary green
:deep(.v-breadcrumbs-item) {
  font-size: 16px !important;
  font-weight: 400 !important;
  color: tokens.$color-text-primary !important;
}

:deep(.v-breadcrumbs-item a:hover),
:deep(.v-breadcrumbs-item .v-breadcrumbs-item__link:hover) {
  color: tokens.$color-green-600 !important;
}

// Current (disabled) item - primary text weight
:deep(.v-breadcrumbs-item--disabled),
:deep(.v-breadcrumbs-item[aria-current]) {
  color: tokens.$color-text-primary !important;
}

:deep(.v-breadcrumbs-item--disabled .v-breadcrumbs-item__link),
:deep(.v-breadcrumbs-item[aria-current] .v-breadcrumbs-item__link) {
  color: tokens.$color-text-primary !important;
  font-weight: 500 !important;
}

// Divider between items (Vuetify 3 may use either class)
:deep(.v-breadcrumbs-divider),
:deep(.v-breadcrumbs__divider) {
  color: tokens.$color-text-primary !important;
  opacity: 1 !important;
}
</style>
