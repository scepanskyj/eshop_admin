<template>
  <div class="label">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Label'
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.label {
  font-size: 15px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);

  :deep(.required-asterisk) {
    color: #d32f2f;
  }
}
</style>
