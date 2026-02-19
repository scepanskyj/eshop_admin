<template>
  <v-btn
    v-bind="$attrs"
    color="neutral"
    :variant="computedVariant"
    :class="['tertiary-button', $attrs.class]"
  >
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: 'TertiaryButton',
  inheritAttrs: false,
  props: {
    outlined: {
      type: Boolean,
      default: false
    },
    text: {
      type: Boolean,
      default: true
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
