<template>
  <v-btn
    icon
    variant="plain"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<script>
export default {
  name: 'IconButton',
  inheritAttrs: false
};
</script>
