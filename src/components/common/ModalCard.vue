<template>
  <v-sheet class="modal-card" :class="cardClasses" outlined>
    <div v-if="title || subtitle" class="modal-card__header">
      <div>
        <div v-if="title" class="modal-card__title">{{ title }}</div>
        <div v-if="subtitle" class="modal-card__subtitle">{{ subtitle }}</div>
      </div>
      <slot name="header-actions"></slot>
    </div>
    <div class="modal-card__body">
      <slot></slot>
    </div>
  </v-sheet>
</template>

<script>
export default {
  name: 'ModalCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    destructive: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardClasses() {
      return {
        'destructive-card': this.destructive
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.modal-card {
  border-radius: 12px;
  padding: tokens.$space-lg;
  margin-bottom: tokens.$space-lg;
  background-color: tokens.$color-surface-default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.destructive-card {
  background-color: rgba(255, 0, 0, 0.04) !important;
  border-color: rgba(255, 0, 0, 0.12) !important;
}

.modal-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: tokens.$space-md;
}

.modal-card__title {
  font-weight: 600;
  font-size: 16px;
}

.modal-card__subtitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 2px;
}

.modal-card__body {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
  
  // Remove margin-bottom from direct children to use gap instead
  > * {
    margin-bottom: 0;
  }
}
</style>

