<template>
  <div>
    <div class="groups-container">
      <div
        v-for="(group, groupIndex) in groups"
        :key="group.id"
        class="group-wrapper"
      >
        <div class="condition-group">
          <div class="group-header">
            <span class="group-label">Group {{ groupIndex + 1 }}</span>
            <v-btn
              v-if="groups.length > 1"
            variant="text"
            color="red"
            @click="removeGroup(groupIndex)"
            class="delete-group-btn"
          >
              <v-icon start size="small">mdi-trash-can-outline</v-icon>
              Delete group
            </v-btn>
          </div>

          <div class="conditions-list">
            <div
              v-for="(condition, conditionIndex) in group.conditions"
              :key="condition.id"
              class="condition-item"
            >
              <div v-if="conditionIndex > 0" class="and-divider">
                <span class="and-label">AND</span>
              </div>
              <ConditionRow
                :condition="condition"
                @update="updateCondition(groupIndex, conditionIndex, $event)"
                @remove="removeCondition(groupIndex, conditionIndex)"
              />
            </div>

            <v-btn
            variant="outlined"
            @click="addCondition(groupIndex)"
            class="add-condition-btn"
          >
              <v-icon start>mdi-plus</v-icon>
              Add condition
            </v-btn>
          </div>
        </div>

        <!-- OR divider between groups (not after the last one) -->
        <div v-if="groupIndex < groups.length - 1" class="or-divider">
          <div class="or-line"></div>
          <span class="or-label">OR</span>
          <div class="or-line"></div>
        </div>
      </div>

      <v-btn
        variant="outlined"
        @click="addGroup"
        class="add-group-btn"
      >
        <v-icon start>mdi-plus</v-icon>
        Add OR group
      </v-btn>
    </div>

    <v-alert v-if="groups.length === 0" type="warning" variant="outlined" class="mt-4">
      At least one condition group is required.
    </v-alert>
  </div>
</template>

<script>
import { createConditionGroup, createCondition } from '@/utils/paymentRestrictionTypes';
import ConditionRow from './ConditionRow.vue';

export default {
  name: 'PaymentRestrictionBuilder',
  components: {
    ConditionRow
  },
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  computed: {
    groups: {
      get() {
        return this.modelValue && this.modelValue.length > 0 ? this.modelValue : [createConditionGroup()];
      },
      set(newValue) {
        this.$emit('update:modelValue', newValue);
      }
    }
  },
  methods: {
    addGroup() {
      const newGroups = [...this.groups, createConditionGroup()];
      this.$emit('update:modelValue', newGroups);
    },
    removeGroup(index) {
      if (this.groups.length <= 1) return;
      const newGroups = this.groups.filter((_, i) => i !== index);
      this.$emit('update:modelValue', newGroups);
    },
    addCondition(groupIndex) {
      const newGroups = [...this.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        conditions: [...newGroups[groupIndex].conditions, createCondition()]
      };
      this.$emit('update:modelValue', newGroups);
    },
    removeCondition(groupIndex, conditionIndex) {
      const newGroups = [...this.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        conditions: newGroups[groupIndex].conditions.filter((_, i) => i !== conditionIndex)
      };
      this.$emit('update:modelValue', newGroups);
    },
    updateCondition(groupIndex, conditionIndex, updatedCondition) {
      const newGroups = [...this.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        conditions: newGroups[groupIndex].conditions.map((cond, i) =>
          i === conditionIndex ? updatedCondition : cond
        )
      };
      this.$emit('update:modelValue', newGroups);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.payment-restriction-builder {
  width: 100%;
}

.builder-header {
  margin-bottom: tokens.$space-lg;
}

.helper-text {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
  display: flex;
  align-items: center;
  padding: tokens.$space-sm tokens.$space-md;
  background-color: rgba(71, 133, 10, 0.05);
  border-radius: 4px;
  border-left: 3px solid tokens.$color-green;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: tokens.$space-md;
}

.group-wrapper {
  display: contents;
}

.condition-group {
  border: 1px solid tokens.$color-border-subtle;
  border-radius: 12px;
  padding: tokens.$space-lg;
  background-color: tokens.$color-surface-muted;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;

  // Ensure all inputs have white background (Vuetify and native)
  :deep(.v-field) {
    background-color: white !important;
  }
  :deep(input.native-input),
  :deep(select.native-select) {
    background-color: white !important;
  }
}

.condition-group:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: tokens.$space-md;
  padding-bottom: tokens.$space-sm;
  border-bottom: 1px solid tokens.$color-border-subtle;
}

.group-label {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.delete-group-btn {
  margin: 0;
  text-transform: none;
  letter-spacing: 0;
}

.conditions-list {
  display: flex;
  flex-direction: column;
}

.condition-item {
  margin-bottom: tokens.$space-sm;
}

.condition-item:last-of-type {
  margin-bottom: 0;
}

.and-divider {
  display: flex;
  align-items: center;
  margin: tokens.$space-md 0;
  position: relative;
  justify-content: center;
}

.and-label {
  background-color: tokens.$color-surface-default;
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  border: 1px solid tokens.$color-border-subtle;
  z-index: 1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-condition-btn {
  margin-top: tokens.$space-md;
  align-self: flex-start;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: tokens.$space-sm;
  margin: tokens.$space-md 0;
  position: relative;
}

.or-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, transparent, tokens.$color-border-subtle, transparent);
}

.or-label {
  background-color: tokens.$color-surface-default;
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  border-radius: 16px;
  border: 2px solid tokens.$color-border-subtle;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.add-group-btn {
  align-self: flex-start;
  margin-top: tokens.$space-md;
}
</style>
