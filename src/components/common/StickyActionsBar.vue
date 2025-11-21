<template>
  <v-sheet class="sticky-actions">
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
  padding: 12px 16px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0;
}
</style>


