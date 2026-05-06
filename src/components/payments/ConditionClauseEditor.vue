<template>
  <div
    class="clause-editor"
    :class="{ 'clause-editor--nested': depth > 0 }"
  >
    <div
      v-for="(part, i) in clause.parts"
      :key="partKey(part, i)"
      class="clause-part"
    >
      <div v-if="i > 0" class="join-row">
        <button
          type="button"
          class="join-chip"
          :aria-label="`Combine with ${clause.joins[i - 1] === 'AND' ? 'OR' : 'AND'} instead`"
          @click.prevent="toggleJoin(i - 1)"
        >
          {{ clause.joins[i - 1] }}
        </button>
      </div>

      <div v-if="isClauseNode(part)" class="nested-group">
        <div class="nested-header">
          <span class="nested-label">Group</span>
          <v-btn
            variant="text"
            color="red"
            class="nested-delete"
            @click="removePart(i)"
          >
            <v-icon start size="small">mdi-trash-can-outline</v-icon>
            Remove group
          </v-btn>
        </div>
        <ConditionClauseEditor
          :model-value="part"
          :depth="depth + 1"
          @update:model-value="updateNestedPart(i, $event)"
        />
      </div>
      <ConditionRow
        v-else
        :condition="part"
        @update="updateLeafPart(i, $event)"
        @remove="removePart(i)"
      />
    </div>

    <div class="clause-actions">
      <v-btn variant="outlined" class="clause-action-btn" @click="addCondition">
        <v-icon start>mdi-plus</v-icon>
        Add condition
      </v-btn>
      <v-btn variant="outlined" class="clause-action-btn" @click="addGroup">
        <v-icon start>mdi-folder-plus-outline</v-icon>
        Add group
      </v-btn>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { createCondition } from '@/utils/paymentRestrictionTypes';
import { createClause, isClauseNode } from '@/utils/conditionClause';
import ConditionRow from './ConditionRow.vue';

export default {
  name: 'ConditionClauseEditor',
  components: {
    ConditionRow,
    ConditionClauseEditor: defineAsyncComponent(() => import('./ConditionClauseEditor.vue'))
  },
  props: {
    modelValue: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue'],
  computed: {
    clause() {
      return this.modelValue;
    }
  },
  methods: {
    isClauseNode,
    partKey(part, i) {
      return part && part.id ? part.id : `idx-${i}`;
    },
    emitClause(nextParts, nextJoins) {
      this.$emit('update:modelValue', {
        ...this.clause,
        parts: nextParts,
        joins: nextJoins
      });
    },
    addCondition() {
      const parts = [...this.clause.parts];
      const joins = [...this.clause.joins];
      if (parts.length > 0) joins.push('AND');
      parts.push(createCondition());
      this.emitClause(parts, joins);
    },
    addGroup() {
      const parts = [...this.clause.parts];
      const joins = [...this.clause.joins];
      if (parts.length > 0) joins.push('AND');
      parts.push(createClause());
      this.emitClause(parts, joins);
    },
    removePart(i) {
      const parts = [...this.clause.parts];
      const joins = [...this.clause.joins];
      parts.splice(i, 1);
      if (i === 0 && joins.length > 0) joins.splice(0, 1);
      else if (i > 0) joins.splice(i - 1, 1);
      this.emitClause(parts, joins);
    },
    toggleJoin(j) {
      const joins = [...this.clause.joins];
      joins[j] = joins[j] === 'AND' ? 'OR' : 'AND';
      this.$emit('update:modelValue', { ...this.clause, joins });
    },
    updateLeafPart(i, updated) {
      const parts = [...this.clause.parts];
      parts[i] = updated;
      this.emitClause(parts, [...this.clause.joins]);
    },
    updateNestedPart(i, updated) {
      const parts = [...this.clause.parts];
      parts[i] = updated;
      this.emitClause(parts, [...this.clause.joins]);
    }
  }
};
</script>

<style lang="scss" scoped>
@use '@/styles/tokens.scss' as tokens;

.clause-editor {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;

  &--nested {
    border: 1px solid tokens.$color-border-subtle;
    border-radius: 12px;
    padding: tokens.$space-lg;
    background-color: tokens.$color-surface-muted;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

    :deep(.v-field) {
      background-color: white !important;
    }
    :deep(input.native-input),
    :deep(select.native-select) {
      background-color: white !important;
    }
  }
}

.clause-part {
  margin-bottom: tokens.$space-sm;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.join-row {
  display: flex;
  justify-content: center;
  margin: tokens.$space-md 0;
}

.join-chip {
  cursor: pointer;
  background: tokens.$color-surface-default;
  padding: 6px 16px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
  border-radius: 16px;
  border: 1px solid tokens.$color-border-subtle;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: rgba(71, 133, 10, 0.08);
    border-color: tokens.$color-green;
  }
}

.nested-group {
  margin-bottom: tokens.$space-sm;
}

.nested-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: tokens.$space-md;
  padding-bottom: tokens.$space-sm;
  border-bottom: 1px solid tokens.$color-border-subtle;
}

.nested-label {
  font-weight: 600;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nested-delete {
  margin: 0;
  text-transform: none;
  letter-spacing: 0;
}

.clause-actions {
  display: flex;
  flex-wrap: wrap;
  gap: tokens.$space-sm;
  margin-top: tokens.$space-md;
}

.clause-action-btn {
  text-transform: none;
  letter-spacing: 0;
}
</style>
