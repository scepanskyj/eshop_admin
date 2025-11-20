<template>
  <v-container class="text-center py-12">
    <v-icon x-large class="mb-4">{{ icon || 'mdi-information-outline' }}</v-icon>
    <div class="text-h5 mb-2">{{ title }}</div>
    <div class="text-body-2 mb-6" v-if="subtitle">{{ subtitle }}</div>
    <v-btn color="primary" v-if="ctaLabel" @click="$emit('cta')">{{ ctaLabel }}</v-btn>
  </v-container>
 </template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: String,
    title: { type: String, required: true },
    subtitle: String,
    ctaLabel: String
  }
};
</script>

<style scoped>
</style>


