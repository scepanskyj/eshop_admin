<template>
  <v-btn
    v-bind="$attrs"
    color="primary"
    :variant="computedVariant"
    :class="['secondary-button', $attrs.class]"
  >
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: 'SecondaryButton',
  inheritAttrs: false,
  props: {
    outlined: {
      type: Boolean,
      default: true
    },
    text: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedVariant() {
      if (this.text) return 'text';
      if (this.outlined) return 'outlined';
      return 'elevated';
    }
  }
};
</script>
