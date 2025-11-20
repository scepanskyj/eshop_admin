<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs" class="pa-0 breadcrumbs-spacing breadcrumbs-text" />

    <div class="d-flex align-center heading-spacing">
      <h1 class="text-h5">{{ title }}</h1>
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
      required: true
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
</style>

