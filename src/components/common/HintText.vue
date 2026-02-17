<template>
  <div class="hint-text">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'HintText'
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.hint-text {
  font-size: 14px !important;
  font-weight: 400;
  color: tokens.$color-text-tertiary;
  margin-bottom: tokens.$space-sm;
}
</style>
