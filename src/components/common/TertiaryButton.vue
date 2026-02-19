<template>
  <v-btn
    v-bind="$attrs"
    :class="['tertiary-button', $attrs.class]"
    :variant="computedVariant"
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

<style lang="scss">
@use '@/styles/tokens.scss' as tokens;

.tertiary-button.v-btn {
  color: tokens.$color-text-primary !important;
  border-color: tokens.$color-text-primary !important;
  background-color: transparent !important;

  .v-btn__content {
    color: tokens.$color-text-primary !important;
  }

  &:not(.v-btn--disabled):hover {
    background-color: rgba(0, 0, 0, 0.04) !important;
    border-color: tokens.$color-text-primary !important;
  }

  &.v-btn--disabled {
    color: rgba(0, 0, 0, 0.38) !important;
    border-color: rgba(0, 0, 0, 0.38) !important;

    .v-btn__content {
      color: rgba(0, 0, 0, 0.38) !important;
    }
  }

  &.v-btn--variant-text {
    border: none !important;
    color: tokens.$color-text-primary !important;

    .v-btn__content {
      color: tokens.$color-text-primary !important;
    }

    &:not(.v-btn--disabled):hover {
      background-color: rgba(0, 0, 0, 0.04) !important;
    }
  }

  &.v-btn--variant-outlined {
    border-color: tokens.$color-text-primary !important;
    color: tokens.$color-text-primary !important;

    .v-btn__content {
      color: tokens.$color-text-primary !important;
    }
  }
}
</style>
