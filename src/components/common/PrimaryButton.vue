<template>
  <v-btn
    v-bind="$attrs"
    :class="['primary-button', $attrs.class]"
    v-on="$listeners"
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

<style lang="scss">
@use '@/styles/tokens.scss' as tokens;

.primary-button.v-btn {
  background-color: tokens.$color-green-500 !important;
  border-color: tokens.$color-green-500 !important;
  
  .v-btn__content {
    color: white !important;
  }
  
  &:not(.v-btn--disabled):hover {
    background-color: tokens.$color-green-600 !important;
    border-color: tokens.$color-green-600 !important;
  }
  
  &.v-btn--disabled {
    background-color: rgba(tokens.$color-green-500, 0.38) !important;
    border-color: rgba(tokens.$color-green-500, 0.38) !important;
    
    .v-btn__content {
      color: rgba(255, 255, 255, 0.38) !important;
    }
  }
  
  // Override Vuetify's default button styles
  &.v-btn:not(.v-btn--text):not(.v-btn--outlined) {
    background-color: tokens.$color-green-500 !important;
  }
  
  &.v-btn--has-bg {
    background-color: tokens.$color-green-500 !important;
  }
}
</style>
