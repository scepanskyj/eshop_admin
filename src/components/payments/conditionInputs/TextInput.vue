<template>
  <input
    type="text"
    :value="value"
    @input="$emit('input', $event.target.value || null)"
    class="native-input"
    :placeholder="placeholder"
  />
</template>

<script>
export default {
  name: 'TextInput',
  props: {
    value: {
      type: [String, Number],
      default: null
    },
    placeholder: {
      type: String,
      default: 'Enter value'
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.native-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  font-size: 13px;
  background-color: white;
  color: rgba(0, 0, 0, 0.87);
  transition: border-color 0.2s ease;
}

.native-input:hover {
  border-color: rgba(0, 0, 0, 0.6);
}

.native-input:focus {
  outline: none;
  border-color: tokens.$color-green;
  border-width: 2px;
  padding: 7px 11px;
}

.native-input::placeholder {
  color: rgba(0, 0, 0, 0.38);
}
</style>
