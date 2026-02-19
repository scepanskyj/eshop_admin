<template>
  <v-sheet class="quick-filter-wrapper" @click="handleClick">
    <v-checkbox
      v-model="localValue"
      :label="label"
      hide-details
      class="ma-0"
      @update:model-value="onChange"
      @click.stop
    />
  </v-sheet>
</template>

<script>
export default {
  name: 'QuickFilter',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      localValue: this.modelValue
    };
  },
  watch: {
    modelValue(newVal) {
      this.localValue = newVal;
    }
  },
  methods: {
    onChange() {
      this.$emit('update:modelValue', this.localValue);
      this.$emit('change', this.localValue);
    },
    handleClick() {
      this.localValue = !this.localValue;
      this.onChange();
    }
  }
};
</script>

<style lang="scss" scoped>
.quick-filter-wrapper {
  border-radius: 4px;
  padding: 11px 16px 15px 16px;
  display: inline-flex;
  align-items: center;
  width: fit-content;
  cursor: pointer;
  user-select: none;
}
</style>
