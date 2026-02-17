<template>
  <div class="icon-upload">
    <div v-if="!hasPreview" class="icon-upload__placeholder">
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
    </div>
    <div v-else class="icon-upload__preview">
      <div class="icon-preview-container">
        <div class="icon-preview">
          <img :src="displayPreviewUrl" alt="Icon preview" class="icon-preview__image" />
          <div v-if="showGeneratedPreview && !value" class="icon-preview__badge">Auto-generated</div>
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
import { getAssetPath } from '@/utils/paths';

function resolveIconPath(value) {
  if (!value) return '';
  // If it's a data URL (starts with data:), return as is
  if (value.startsWith('data:')) {
    return value;
  }
  // If it's a path (starts with /), resolve it through getAssetPath
  if (value.startsWith('/')) {
    return getAssetPath(value);
  }
  // Otherwise return as is
  return value;
}

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
    },
    previewUrl: {
      type: String,
      default: null
    },
    showGeneratedPreview: {
      type: Boolean,
      default: false
    },
    generatedFileName: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      currentFileName: null
    };
  },
  computed: {
    displayPreviewUrl() {
      // Use previewUrl prop if provided and showGeneratedPreview is true
      if (this.showGeneratedPreview && this.previewUrl) {
        return this.previewUrl;
      }
      // Otherwise use value
      return resolveIconPath(this.value);
    },
    hasPreview() {
      return this.value || (this.showGeneratedPreview && this.previewUrl);
    },
    fileName() {
      // If showing generated preview and we have a generated filename, use it
      if (this.showGeneratedPreview && this.generatedFileName && !this.value) {
        return this.generatedFileName;
      }
      
      if (this.currentFileName) {
        return this.currentFileName;
      }
      // Extract filename from path or data URL
      if (!this.value) {
        if (this.showGeneratedPreview && this.previewUrl) {
          return this.generatedFileName || 'auto-generated.svg';
        }
        return '';
      }
      
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
      if (!newVal) {
        this.currentFileName = null;
      }
    },
    previewUrl() {
      // Preview URL changed, update if showing generated preview
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
        // Emit filename change event
        this.$emit('filename-changed', file.name);
      };
      reader.onerror = () => {
        this.$emit('error', 'Failed to read file');
      };
      reader.readAsDataURL(file);

      // Reset input
      event.target.value = '';
    },
    handleRemove() {
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
  position: relative;
}

.icon-preview__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
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

