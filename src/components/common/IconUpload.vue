<template>
  <div class="icon-upload">
    <div v-if="!value" class="icon-upload__placeholder">
      <v-btn
        outlined
        color="primary"
        @click="$refs.fileInput.click()"
        :disabled="disabled"
      >
        <v-icon left>mdi-upload</v-icon>
        Upload icon
      </v-btn>
      <input
        ref="fileInput"
        type="file"
        accept="image/svg+xml,.svg"
        style="display: none"
        @change="handleFileSelect"
      />
      <div class="icon-upload__hint">
        SVG format, 1:1 ratio recommended
      </div>
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
              text
              small
              @click="$refs.fileInput.click()"
              :disabled="disabled"
              class="action-btn"
            >
              <v-icon left small>mdi-upload</v-icon>
              Upload new
            </v-btn>
            <v-btn
              text
              small
              color="error"
              @click="handleRemove"
              :disabled="disabled"
              class="action-btn"
            >
              <v-icon left small>mdi-delete</v-icon>
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
export default {
  name: 'IconUpload',
  props: {
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      previewUrl: this.value || '',
      currentFileName: null
    };
  },
  computed: {
    fileName() {
      if (this.currentFileName) {
        return this.currentFileName;
      }
      // Extract filename from path or data URL
      if (!this.value) return '';
      
      // If it's a path like /icons/cardonline.svg
      if (this.value.startsWith('/')) {
        const parts = this.value.split('/');
        return parts[parts.length - 1] || 'icon.svg';
      }
      
      // If it's a data URL, try to get filename from previous upload
      // Otherwise return a generic name
      return 'uploaded-icon.svg';
    }
  },
  watch: {
    value(newVal) {
      this.previewUrl = newVal || '';
      if (!newVal) {
        this.currentFileName = null;
      }
    }
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
        this.$emit('error', 'Please select an SVG file');
        return;
      }

      // Store filename
      this.currentFileName = file.name;

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        this.previewUrl = dataUrl;
        this.$emit('input', dataUrl);
      };
      reader.onerror = () => {
        this.$emit('error', 'Failed to read file');
      };
      reader.readAsDataURL(file);

      // Reset input
      event.target.value = '';
    },
    handleRemove() {
      this.previewUrl = '';
      this.currentFileName = null;
      this.$emit('input', '');
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

.icon-upload__hint {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
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

