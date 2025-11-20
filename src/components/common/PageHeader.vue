<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs" class="pa-0 breadcrumbs-spacing breadcrumbs-text" />

    <div class="d-flex align-center heading-spacing">
      <h1 class="text-h5 page-title">{{ pageTitle }}</h1>
      <v-spacer />
      <slot name="actions"></slot>
    </div>

    <slot name="filters"></slot>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    breadcrumbs: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    pageTitle() {
      // Use explicit title if provided (for backward compatibility or special cases),
      // otherwise derive from last breadcrumb item
      if (this.title) return this.title;
      const lastBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];
      return lastBreadcrumb?.text || '';
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.breadcrumbs-spacing {
  margin-bottom: tokens.$space-lg;
}

.heading-spacing {
  margin-bottom: tokens.$space-lg;
}

.breadcrumbs-text :deep(.v-breadcrumbs__item) {
  color: tokens.$color-text-secondary !important;
}

.breadcrumbs-text :deep(.v-breadcrumbs__divider) {
  color: tokens.$color-text-secondary !important;
}

:deep(.filters-section) {
  margin-bottom: tokens.$space-md;
}

.page-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 200px); // Leave space for action buttons
  min-width: 0; // Allow flex item to shrink
}

:deep(.v-breadcrumbs__item:last-child) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}
</style>

