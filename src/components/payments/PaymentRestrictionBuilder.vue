<template>
  <div class="payment-restriction-builder">
    <div class="builder-header">
      <p class="helper-text">
        <v-icon small class="mr-1">mdi-information</v-icon>
        If any group is true, this rule applies. Conditions within a group are combined with AND.
      </p>
    </div>

    <div class="groups-container">
      <template v-for="(group, groupIndex) in groups">
        <div
          :key="group.id"
          class="condition-group"
        >
          <div class="group-header">
            <span class="group-label">Group {{ groupIndex + 1 }}</span>
            <v-btn
              v-if="groups.length > 1"
              icon
              small
              @click="removeGroup(groupIndex)"
              class="remove-group-btn"
            >
              <v-icon small color="red">mdi-close</v-icon>
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
              small
              outlined
              @click="addCondition(groupIndex)"
              class="add-condition-btn"
            >
              <v-icon left small>mdi-plus</v-icon>
              Add condition
            </v-btn>
          </div>
        </div>

        <!-- OR divider between groups (not after the last one) -->
        <div v-if="groupIndex < groups.length - 1" :key="`or-${groupIndex}`" class="or-divider">
          <div class="or-line"></div>
          <span class="or-label">OR</span>
          <div class="or-line"></div>
        </div>
      </template>

      <v-btn
        outlined
        @click="addGroup"
        class="add-group-btn"
      >
        <v-icon left>mdi-plus</v-icon>
        Add OR group
      </v-btn>
    </div>

    <v-alert v-if="groups.length === 0" type="warning" outlined class="mt-4">
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
    value: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    groups: {
      get() {
        return this.value && this.value.length > 0 ? this.value : [createConditionGroup()];
      },
      set(newValue) {
        this.$emit('input', newValue);
      }
    }
  },
  methods: {
    addGroup() {
      const newGroups = [...this.groups, createConditionGroup()];
      this.$emit('input', newGroups);
    },
    removeGroup(index) {
      if (this.groups.length <= 1) return;
      const newGroups = this.groups.filter((_, i) => i !== index);
      this.$emit('input', newGroups);
    },
    addCondition(groupIndex) {
      const newGroups = [...this.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        conditions: [...newGroups[groupIndex].conditions, createCondition()]
      };
      this.$emit('input', newGroups);
    },
    removeCondition(groupIndex, conditionIndex) {
      const newGroups = [...this.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        conditions: newGroups[groupIndex].conditions.filter((_, i) => i !== conditionIndex)
      };
      this.$emit('input', newGroups);
    },
    updateCondition(groupIndex, conditionIndex, updatedCondition) {
      const newGroups = [...this.groups];
      newGroups[groupIndex] = {
        ...newGroups[groupIndex],
        conditions: newGroups[groupIndex].conditions.map((cond, i) =>
          i === conditionIndex ? updatedCondition : cond
        )
      };
      this.$emit('input', newGroups);
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
  gap: tokens.$space-lg;
}

.condition-group {
  border: 1px solid tokens.$color-border-subtle;
  border-radius: 12px;
  padding: tokens.$space-lg;
  background-color: tokens.$color-surface-muted;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
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

.remove-group-btn {
  margin: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.remove-group-btn:hover {
  opacity: 1;
}

.conditions-list {
  display: flex;
  flex-direction: column;
}

.condition-item {
  margin-bottom: tokens.$space-md;
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
  gap: tokens.$space-md;
  margin: tokens.$space-lg 0;
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
  margin-top: tokens.$space-sm;
}
</style>
