<template>
  <div class="rte-stub">
    <div class="toolbar mb-2">
      <v-btn small text @click="toggleCmd('bold')"><v-icon left>mdi-format-bold</v-icon>Bold</v-btn>
      <v-btn small text @click="toggleCmd('italic')"><v-icon left>mdi-format-italic</v-icon>Italic</v-btn>
      <v-btn small text @click="toggleList"><v-icon left>mdi-format-list-bulleted</v-icon>Bullets</v-btn>
    </div>
    <div
      ref="editor"
      class="editor body-2"
      contenteditable
      :class="{ bold: isBold, italic: isItalic, bullets: isBullets }"
      @input="emitValue"
    ></div>
  </div>
 </template>

<script>
export default {
  name: 'RichTextStub',
  props: { value: String },
  data() {
    return { isBold: false, isItalic: false, isBullets: false };
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
    toggleCmd(type) {
      if (type === 'bold') this.isBold = !this.isBold;
      if (type === 'italic') this.isItalic = !this.isItalic;
      this.emitValue();
    },
    toggleList() {
      this.isBullets = !this.isBullets;
      if (this.isBullets) {
        const text = this.$refs.editor.innerText || '';
        const items = text.split(/\n+/).filter(Boolean).map(t => `<li>${t}</li>`).join('');
        this.$refs.editor.innerHTML = `<ul>${items}</ul>`;
      }
      this.emitValue();
    },
    emitValue() {
      this.$emit('input', this.$refs.editor.innerHTML);
    }
  }
};
</script>

<style scoped>
.editor {
  min-height: 120px;
  border: 1px solid #e0e0e0;
  padding: 8px;
  border-radius: 4px;
  background-color: white;
}
.editor.bold { font-weight: bold; }
.editor.italic { font-style: italic; }
.toolbar { display: flex; gap: 8px; }
</style>


