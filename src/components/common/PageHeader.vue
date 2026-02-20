<template>
  <div>
    <Breadcrumbs :items="breadcrumbs" class="breadcrumbs-spacing" />

    <div class="d-flex align-center heading-spacing">
      <h1 class="h1 page-title">{{ pageTitle }}</h1>
      <v-spacer />
      <slot name="actions"></slot>
    </div>

    <slot name="filters"></slot>
  </div>
</template>

<script>
import Breadcrumbs from './Breadcrumbs.vue';

export default {
  name: 'PageHeader',
  components: {
    Breadcrumbs
  },
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
      // otherwise derive from last breadcrumb item (support both 'title' and 'text' for Vuetify 2/3)
      if (this.title) return this.title;
      const lastBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];
      return lastBreadcrumb?.title ?? lastBreadcrumb?.text ?? '';
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.heading-spacing {
  margin-bottom: tokens.$space-lg;
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
</style>

