<template>
  <v-btn
    v-bind="$attrs"
    :class="['secondary-button', $attrs.class]"
    :outlined="outlined"
    :text="text"
    v-on="$listeners"
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
  }
};
</script>

<style lang="scss">
@use '@/styles/tokens.scss' as tokens;

.secondary-button.v-btn {
  color: tokens.$color-green-500 !important;
  border-color: tokens.$color-green-500 !important;
  background-color: white !important;
  
  .v-btn__content {
    color: tokens.$color-green-500 !important;
  }
  
  &:not(.v-btn--disabled):hover {
    background-color: tokens.$color-green-50 !important;
    border-color: tokens.$color-green-600 !important;
  }
  
  &.v-btn--disabled {
    color: rgba(tokens.$color-green-500, 0.38) !important;
    border-color: rgba(tokens.$color-green-500, 0.38) !important;
    
    .v-btn__content {
      color: rgba(tokens.$color-green-500, 0.38) !important;
    }
  }
  
  &.v-btn--text {
    border: none !important;
    color: tokens.$color-green-500 !important;
    
    .v-btn__content {
      color: tokens.$color-green-500 !important;
    }
    
    &:not(.v-btn--disabled):hover {
      background-color: tokens.$color-green-50 !important;
    }
  }
  
  &.v-btn--outlined {
    border-color: tokens.$color-green-500 !important;
    color: tokens.$color-green-500 !important;
    
    .v-btn__content {
      color: tokens.$color-green-500 !important;
    }
  }
}
</style>
