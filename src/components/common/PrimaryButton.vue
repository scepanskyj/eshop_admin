<template>
  <v-btn
    v-bind="$attrs"
    color="primary"
    variant="elevated"
    :class="['primary-button', $attrs.class]"
  >
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: 'PrimaryButton',
  inheritAttrs: false
};
</script>
