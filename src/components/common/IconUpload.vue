<template>
  <div class="icon-upload">
    <div v-if="!modelValue" class="icon-upload__placeholder">
      <v-btn
        variant="outlined"
        color="primary"
        @click="$refs.fileInput.click()"
        :disabled="disabled"
      >
        <v-icon start>mdi-upload</v-icon>
        Upload icon
      </v-btn>
      <input
        ref="fileInput"
        type="file"
        accept="image/svg+xml,.svg"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>
    <div v-else class="icon-upload__preview">
      <div class="icon-preview-container">
        <div class="icon-preview">
          <img :src="previewUrl" alt="Icon preview" class="icon-preview__image" />
        </div>
        <div class="icon-preview__info">
          <div class="icon-preview__filename">{{ fileName }}</div>
          <div class="icon-preview__actions">
            <v-btn
              variant="text"
              size="small"
              @click="$refs.fileInput.click()"
              :disabled="disabled"
              class="action-btn"
            >
              <v-icon start size="small">mdi-upload</v-icon>
              Upload new
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              color="error"
              @click="handleRemove"
              :disabled="disabled"
              class="action-btn"
            >
              <v-icon start size="small">mdi-delete</v-icon>
              Delete
            </v-btn>
          </div>
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/svg+xml,.svg"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>

<script>
import { resolveIconPath } from '@/utils/iconPath';

export default {
  name: 'IconUpload',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:modelValue', 'error'],
  data() {
    return {
      currentFileName: null
    };
  },
  computed: {
    previewUrl() {
      return resolveIconPath(this.modelValue);
    },
    fileName() {
      if (this.currentFileName) {
        return this.currentFileName;
      }
      if (!this.modelValue) return '';
      if (this.modelValue.startsWith('/')) {
        const parts = this.modelValue.split('/');
        return parts[parts.length - 1] || 'icon.svg';
      }
      return 'uploaded-icon.svg';
    }
  },
  watch: {
    modelValue(newVal) {
      if (!newVal) {
        this.currentFileName = null;
      }
    }
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
        this.$emit('error', 'Please select an SVG file');
        return;
      }

      this.currentFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        this.$emit('update:modelValue', dataUrl);
      };
      reader.onerror = () => {
        this.$emit('error', 'Failed to read file');
      };
      reader.readAsDataURL(file);

      event.target.value = '';
    },
    handleRemove() {
      this.currentFileName = null;
      this.$emit('update:modelValue', '');
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.icon-upload {
  width: 100%;
}

.icon-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: tokens.$space-xs;
}

.icon-preview-container {
  display: flex;
  align-items: flex-start;
  gap: tokens.$space-md;
}

.icon-preview {
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: tokens.$space-xs;
  background: white;
}

.icon-preview__image {
  width: 64px;
  height: 64px;
  object-fit: contain;
  display: block;
}

.icon-preview__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: tokens.$space-xs;
}

.icon-preview__filename {
  font-size: 14px;
  font-weight: 500;
  color: tokens.$color-text-primary;
  word-break: break-all;
}

.icon-preview__actions {
  display: flex;
  gap: tokens.$space-xs;
  flex-wrap: wrap;
}

.action-btn {
  margin: 0 !important;
  min-width: auto !important;
  padding: 0 tokens.$space-xs !important;
}
</style>
