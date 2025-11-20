<template>
  <v-dialog
    :value="value"
    :max-width="maxWidth"
    :persistent="persistent"
    scrollable
    :retain-focus="false"
    @input="handleInput"
    @keydown.esc="handleEsc"
  >
    <v-card
      ref="modalCard"
      @keydown.tab="handleTab"
      @keydown.shift.tab="handleShiftTab"
    >
      <v-toolbar flat>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          @click="handleClose"
          :aria-label="`Close ${title}`"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider />
      
      <div class="modal-content" ref="modalContent">
        <slot name="content"></slot>
      </div>
      
      <div v-if="hasFooter" class="modal-footer-wrapper" ref="modalFooter">
        <v-divider />
        <v-card-actions class="modal-footer">
          <slot name="footer">
            <v-spacer />
            <v-btn text @click="handleClose">Cancel</v-btn>
            <v-btn color="primary" @click="handleSave">Save</v-btn>
          </slot>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    maxWidth: {
      type: [String, Number],
      default: 800
    },
    persistent: {
      type: Boolean,
      default: true
    },
    hasFooter: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.focusFirstElement();
        });
      }
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value);
    },
    handleClose() {
      // Always allow closing via button click
      this.$emit('input', false);
      this.$emit('close');
    },
    handleEsc(e) {
      // ESC should always close the modal
      e.preventDefault();
      e.stopPropagation();
      this.$emit('input', false);
      this.$emit('close');
    },
    handleSave() {
      this.$emit('save');
    },
    getFocusableElements() {
      if (!this.$refs.modalCard) return [];
      
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ');
      
      return Array.from(this.$refs.modalCard.querySelectorAll(selectors)).filter(
        el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }
      );
    },
    focusFirstElement() {
      const focusable = this.getFocusableElements();
      if (focusable.length > 0) {
        // Skip the close button, focus the second element (usually first input)
        const elementToFocus = focusable.length > 1 ? focusable[1] : focusable[0];
        elementToFocus.focus();
      }
    },
    handleTab(e) {
      const focusable = this.getFocusableElements();
      if (focusable.length === 0) return;
      
      const currentIndex = focusable.indexOf(document.activeElement);
      
      if (currentIndex === focusable.length - 1) {
        // Last element, wrap to first
        e.preventDefault();
        focusable[0].focus();
      }
    },
    handleShiftTab(e) {
      const focusable = this.getFocusableElements();
      if (focusable.length === 0) return;
      
      const currentIndex = focusable.indexOf(document.activeElement);
      
      if (currentIndex === 0 || currentIndex === -1) {
        // First element or not found, wrap to last
        e.preventDefault();
        focusable[focusable.length - 1].focus();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.modal-content {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding: tokens.$space-lg;
}

.modal-footer-wrapper {
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.modal-footer {
  padding: tokens.$space-md tokens.$space-lg;
  min-height: 64px;
}
</style>

