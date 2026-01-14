<script setup lang="ts">
import {type Category, useCategoryStore} from '@/stores/categories' // Import the store
import {useSettingsStore} from "@/stores/settings.ts";
import {computed, onMounted, onUnmounted, ref} from "vue";
import CellEditor from "@/components/CellEditor.vue";
import {hasVisibleMonths, isFuture, monthsForYear, getMonthName, type YearMonth} from "@/clock.ts";
import {db} from "@/firebase.ts";
import {collection, addDoc, serverTimestamp, query, onSnapshot} from "firebase/firestore";
import {useAuthStore} from "@/stores/auth.ts";
import type {FieldValue} from 'firebase/firestore';
import ExpenseModal from "@/components/ExpenseModal.vue";
import {formatCurrency} from "@/currency.ts";

export interface Expense {
  id?: string;
  amount: number;
  year: number;
  month: number;
  categoryId: string;
  targetUserId: string;
  targetUserName: string;
  creatorUid: string;
  creatorEmail: string | null;
  createdAt: FieldValue;
  createdBy: string;
  createdByName: string;
}

const authStore = useAuthStore()
const categories = useCategoryStore().allCategories
const {availableYears, userSettings} = useSettingsStore()

// Editor
const isModalOpen = ref(false)
const editingContext = ref<{ yearMonth: YearMonth; category: Category } | null>(null)

const openEditModal = (yearMonth: YearMonth, category: Category) => {
  editingContext.value = {yearMonth, category}
  isModalOpen.value = true
}


// Expenses
const expenses = ref<Expense[]>([]);
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  const q = query(collection(db, "expenses"));
  unsubscribe = onSnapshot(q, (snapshot) => {
    expenses.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as Expense);
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const getExpensestForCell = (yearMonth: YearMonth, categoryId: string): Expense[] => {
  const [year, month] = yearMonth;
  return expenses.value
    .filter(e => e.year === year && e.month === month && e.categoryId === categoryId)
};

const getRowTotal = (yearMonth: YearMonth): number => {
  const [year, month] = yearMonth;
  return expenses.value
    .filter(e => e.year === year && e.month === month)
    .reduce((sum, e) => sum + (e.amount || 0), 0);
};

const getYearlyAverageCategory = (year: number, categoryId: string): number => {
  const visibleMonths = monthsForYear(year).filter(ym => !isFuture(ym));

  const monthlyTotals = visibleMonths.map(ym =>
    getExpensestForCell(ym, categoryId).reduce((s, e) => s + (e.amount || 0), 0)
  );

  const activeMonths = monthlyTotals.filter(total => total > 0);

  if (activeMonths.length === 0) return 0;

  const sum = activeMonths.reduce((a, b) => a + b, 0);
  return sum / activeMonths.length;
};

// Update yearly average total too if you want it to ignore "zero-expense" months globally
const getYearlyAverageTotal = (year: number): number => {
  const visibleMonths = monthsForYear(year).filter(ym => !isFuture(ym));

  const monthlyTotals = visibleMonths.map(getRowTotal);
  const activeMonths = monthlyTotals.filter(total => total > 0);

  if (activeMonths.length === 0) return 0;

  const sum = activeMonths.reduce((a, b) => a + b, 0);
  return sum / activeMonths.length;
};


</script>
<template>
  <div class="dashboard-container">
    <div class="spreadsheet-grid">

      <!-- Single Global Header Row -->
      <div class="row header-row">
        <div class="cell corner-cell"></div> <!-- Empty top-left cell -->
        <div class="cell header-total">Total</div>

        <div v-for="{id, name} in categories" :key="id" class="cell category-header">
          {{ name }}
        </div>
      </div>

      <!-- Data Rows grouped by Year -->
      <div v-for="year in availableYears" :key="year" class="year-section">

        <!-- Year Title Row (Spans across or acts as a separator) -->
        <div class="row year-separator-row" v-if="hasVisibleMonths(year)">
          <div class="cell year-label">{{ year }}</div>
          <div class="cell empty-filler"></div>
          <div v-for="n in categories.length" :key="n" class="cell empty-filler"></div>
        </div>

        <!-- Month Rows -->
        <template v-for="yearMonth in monthsForYear(year)" :key="yearMonth.join('-')">
          <div v-if="!isFuture(yearMonth)" class="row month-row">
            <div class="cell month-name-cell">{{ getMonthName(yearMonth) }}</div>

            <div class="cell row-total-cell">
              {{ formatCurrency(getRowTotal(yearMonth)) }}
            </div>

            <div v-for="category in categories" :key="category.id" class="cell transaction-cell">
              <CellEditor :yearMonth="yearMonth"
                          :category="category"
                          :expenses="getExpensestForCell(yearMonth, category.id)"
                          :user-settings="userSettings"
                          @edit="openEditModal(yearMonth, category)"></CellEditor>
            </div>
          </div>
        </template>

        <!-- Yearly Average Footer Row -->
        <div class="row year-footer-row" v-if="hasVisibleMonths(year)">
          <div class="cell footer-label">Avg.</div>

          <!-- Average of Total Column -->
          <div class="cell footer-total-cell">
            {{ formatCurrency(getYearlyAverageTotal(year)) }}
          </div>

          <!-- Average for each Category Column -->
          <div v-for="category in categories" :key="'avg-' + category.id"
               class="cell footer-category-cell">
            {{ formatCurrency(getYearlyAverageCategory(year, category.id)) }}
          </div>
        </div>

      </div>
    </div>
  </div>

  <ExpenseModal
    :is-open="isModalOpen"
    :context="editingContext"
    :user-settings="userSettings"
    :expenses="editingContext ? getExpensestForCell(editingContext.yearMonth, editingContext.category.id) : []"
    @close="isModalOpen = false"
  />
</template>

<style scoped>
.dashboard-container {
  margin-top: 20px;
  background-color: #ffffff;
  overflow-x: auto;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.row {
  display: grid;
  /* Added 80px for the Total column */
  grid-template-columns: 100px 80px repeat(v-bind('categories.length'), minmax(90px, 1fr));
}

.cell {
  padding: 1px 2px;
  display: flex;
  align-items: flex-start;
  text-align: center;
  min-height: 32px;
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
}

.cell:last-child {
  border-right: none;
}

.header-row {
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 20;
}


.header-total {
  font-weight: bold;
  justify-content: center;
  background-color: #f1f3f4;
}

.category-header {
  font-weight: 500;
  justify-content: center;
  text-align: center;
  display: flex;
  align-items: center;
  padding: 3px;
  min-height: 40px; /* Ensure there is enough vertical room for 2 lines */

  container-type: inline-size;

  font-size: clamp(9px, 8cqw, 13px);

  inline-size: 100%;
  overflow-wrap: break-word; /* Break long words if necessary */
  hyphens: auto; /* Add hyphens if the language supports it (sl-SI does!) */
  line-height: 1.1; /* Tight line height for multi-line headers */
}

/* Year Separator Styling */
.year-separator-row {
  background-color: #ffffff;
}

.year-separator-row .cell {
  border-bottom: 2px solid #e8e8e8;
  border-right: none;
}

.year-label {
  font-weight: bold;
  /* font-size: 1.1rem; */
  /* color: #202124; */
  text-align: justify;
  /* border-top: 2px solid #999;  Stronger line above the year */
}

.empty-filler {
  background-color: #ffffff;
}

/* Month Column Styling */
.month-name-cell {
  color: #5f6368;
  background-color: #fafbfc;
  text-align: right !important;
  align-items: normal;
}

.row-total-cell {
  background-color: #f8f9fa;
  justify-content: flex-end;
  font-variant-numeric: tabular-nums;
  color: #202124;
}

.month-row:hover {
  background-color: #f1f3f4;
}

/* Footer (Averages) Styling */
.year-footer-row {
  background-color: #fdfdfd;
  margin-bottom: 1.5rem;
}

.footer-label {
  color: #5f6368;
  justify-content: flex-end;
}

.footer-total-cell, .footer-category-cell {
  justify-content: flex-end;
  font-variant-numeric: tabular-nums;
}

.footer-total-cell {
}


</style>
