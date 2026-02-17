<template>
  <div class="reason-editor">
    <div class="toolbar">
      <v-btn
        small
        text
        :class="{ 'primary--text': isBold }"
        @click="execBold"
      >
        <v-icon small>mdi-format-bold</v-icon>
      </v-btn>
      <v-btn
        small
        text
        :class="{ 'primary--text': hasLink }"
        @click="toggleLink"
      >
        <v-icon small>mdi-link</v-icon>
      </v-btn>
    </div>
    <div
      ref="editor"
      class="editor body-2"
      contenteditable
      data-placeholder="Enter reason shown to customer when payment method is disabled..."
      @input="emitValue"
      @focus="updateToolbarState"
      @keyup="updateToolbarState"
      @mouseup="updateToolbarState"
    />
  </div>
</template>

<script>
export default {
  name: 'RichTextStub',
  props: { value: String },
  data() {
    return { isBold: false, hasLink: false };
  },
  mounted() {
    if (this.value) this.$refs.editor.innerHTML = this.value;
  },
  watch: {
    value(newVal) {
      if (!this.$refs.editor) return;
      const incoming = newVal || '';
      if (this.$refs.editor.innerHTML !== incoming) {
        this.$refs.editor.innerHTML = incoming;
      }
    }
  },
  methods: {
    execBold() {
      this.$refs.editor.focus();
      document.execCommand('bold', false, null);
      this.updateToolbarState();
      this.emitValue();
    },
    toggleLink() {
      this.$refs.editor.focus();
      const selection = window.getSelection();
      const hasSelection = selection && selection.toString().trim().length > 0;

      if (this.hasLink) {
        document.execCommand('unlink', false, null);
      } else if (hasSelection) {
        const url = window.prompt('Enter URL:', 'https://');
        if (url) {
          document.execCommand('createLink', false, url);
        }
      } else {
        const text = window.prompt('Link text:', '');
        const url = text ? window.prompt('Enter URL:', 'https://') : null;
        if (text && url) {
          document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener">${text}</a>`);
        }
      }
      this.updateToolbarState();
      this.emitValue();
    },
    updateToolbarState() {
      this.$nextTick(() => {
        if (!this.$refs.editor) return;
        const sel = window.getSelection();
        if (sel && sel.anchorNode && this.$refs.editor.contains(sel.anchorNode)) {
          this.isBold = document.queryCommandState('bold');
          this.hasLink = !!document.queryCommandState('createLink') || this.findLinkInSelection();
        }
      });
    },
    findLinkInSelection() {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return false;
      let node = sel.anchorNode;
      while (node && node !== this.$refs.editor) {
        if (node.nodeName === 'A') return true;
        node = node.parentNode;
      }
      return false;
    },
    emitValue() {
      this.$emit('input', this.$refs.editor.innerHTML);
    }
  }
};
</script>

<style lang="scss" scoped>
.reason-editor {
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  background-color: white;
  overflow: hidden;
}

.toolbar {
  display: flex;
  gap: 2px;
  padding: 4px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background-color: rgba(0, 0, 0, 0.02);
}

.editor {
  min-height: 100px;
  padding: 12px 16px;
  outline: none;
}

.editor:empty::before {
  content: attr(data-placeholder);
  color: rgba(0, 0, 0, 0.38);
}

.editor :deep(a) {
  color: #1976d2;
  text-decoration: underline;
}

.editor :deep(a:hover) {
  text-decoration: none;
}
</style>
