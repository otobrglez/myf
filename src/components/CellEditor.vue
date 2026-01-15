<script setup lang="ts">
import {computed} from "vue";
import type {Category} from '@/stores/categories';
import type {YearMonth} from "@/clock.ts";
import type {Expense} from "@/views/GridView.vue";
import type {UserSetting} from "@/stores/settings.ts";
import {formatCurrency} from "@/currency.ts";

const {expenses, userSettings, targetAmount, monthProgress} = defineProps<{
  yearMonth: YearMonth;
  category: Category;
  expenses: Expense[];
  userSettings: UserSetting[];
  targetAmount?: number;
  monthProgress?: number;
}>();

defineEmits(['edit']);

const groupedExpenses = computed(() => {
  return expenses.reduce((acc, curr) => {
    const userId = curr.targetUserId || 'unknown';
    if (!acc[userId]) {
      const setting = userSettings.find(s => s.id === userId);
      acc[userId] = {
        name: curr.targetUserName || '?',
        color: setting?.color || '#f1f3f4',
        total: 0
      };
    }
    acc[userId].total += curr.amount;
    return acc;
  }, {} as Record<string, { name: string; color: string; total: number }>);
});

const totalSpent = computed(() => expenses.reduce((sum, e) => sum + e.amount, 0));

const progressStyle = computed(() => {
  if (!targetAmount || targetAmount <= 0) return {};

  const percent = Math.min((totalSpent.value / targetAmount) * 100, 100);
  const isOverPace = percent > (monthProgress || 0) * 100;

  return {
    background: `linear-gradient(90deg, ${isOverPace ? '#fff0f0' : '#f0f7ff'} ${percent}%, transparent ${percent}%)`
  };
});
</script>

<template>
  <div class="cell-editor" @click="$emit('edit')">
    <div class="breakdown" v-if="Object.keys(groupedExpenses).length > 0">
      <div v-for="(data, userId) in groupedExpenses" :key="userId" class="user-row"
           :style="{ backgroundColor: data.color }">
        <span class="amount">{{ formatCurrency(data.total) }}</span>
      </div>
      <div v-if="targetAmount && targetAmount > totalSpent" class="estimation-row">
        <span class="estimate-label">{{ $t('est_short') }}</span>
        <span class="amount">{{ formatCurrency(targetAmount) }}</span>
      </div>
    </div>
    <div v-else-if="targetAmount" class="breakdown estimation-only">
      <div class="estimation-row">
        <span class="estimate-label">{{ $t('est_short') }}</span>
        <span class="amount">{{ formatCurrency(targetAmount) }}</span>
      </div>
    </div>
    <div v-else class="breakdown empty">
          <span class="amount">
          —
          </span>
    </div>
  </div>
</template>

<style scoped>
.cell-editor {
  width: 100%;
  padding: 0;
  cursor: pointer;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: stretch;
  position: relative;
  transition: background 0.3s ease;
}

.breakdown {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 2px;
}

.breakdown.empty .amount {
  color: #d1d1d1;
  text-align: center;
}

.user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1px 5px;
  border-radius: 3px;
  margin-bottom: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.amount {
  text-align: right;
  flex-grow: 1;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

.amount {
  text-align: right;
  flex-grow: 1;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}

.estimation-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: 0.4;
}

.estimate-label {
  color: #666;
  margin-right: 4px;
}

.estimation-only {
  justify-content: center;
}


</style>
