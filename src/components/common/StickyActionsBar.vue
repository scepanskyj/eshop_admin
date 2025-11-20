<template>
  <v-sheet class="sticky-actions" elevation="2">
    <div class="actions">
      <slot />
    </div>
  </v-sheet>
 </template>

<script>
export default {
  name: 'StickyActionsBar'
};
</script>

<style scoped>
.sticky-actions {
  position: sticky;
  top: 64px; /* app bar height */
  z-index: 3;
  background: white;
  padding: 8px 16px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>


