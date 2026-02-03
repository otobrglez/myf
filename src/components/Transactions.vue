<script setup lang="ts">
import {onMounted, onUnmounted, ref, type UnwrapRef} from "vue";
import {collection, onSnapshot, query, orderBy} from "firebase/firestore";
import {db} from "@/firebase.ts";
import type {Expense} from "@/expenses.ts";
import {type Category, useCategoryStore} from "@/stores/categories.ts";
import {formatCurrency} from "@/currency.ts";

type ExpenseCategory = [Expense, Category?]

const expenses = ref<ExpenseCategory[]>([]);
const categories = useCategoryStore().allCategories

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  const expensesRef = collection(db, "expenses");
  const q = query(expensesRef, orderBy('year', 'desc'), orderBy('month', 'desc'));
  unsubscribe = onSnapshot(q, (snapshot) => {
    expenses.value = snapshot.docs.map(doc => ([{
      id: doc.id,
      ...doc.data()
    } as Expense, categories.find(c => c.id === doc.data().categoryId)])) as ExpenseCategory[];
  })
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

function formatDate(dateRef: UnwrapRef<Expense["createdAt"]>) {
  let date = (dateRef as any)?.toDate();
  return date?.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})
}

</script>

<template>

  <table class="transactions">
    <thead>
    <tr>
      <th>Year / Month</th>
      <th>Amount</th>
      <th></th>
      <th>Added by</th>
      <th>Added</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="[expense, category] in expenses" :key="expense.id">
      <td class="col-2">{{ expense.year }} - {{ expense.month }}</td>
      <td class="col-2 amount">{{ formatCurrency(expense.amount) }}</td>
      <td>{{ category?.name }}</td>
      <td>

        <div v-if="expense.creatorUid != expense.targetUserId">
          {{ expense.targetUserName }} ({{ $t('added_by') }} {{ expense.createdByName }})
        </div>
        <div v-else>
          {{ expense.createdByName }}
        </div>

      </td>
      <td>
        {{ formatDate(expense.createdAt) }}
        <!-- {{ expense.createdAt?.toDate()?.toLocaleString() }} -->
      </td>
    </tr>
    </tbody>
  </table>

</template>

<style scoped>

table.transactions {
  border-collapse: collapse;
  width: 100%;
}

table.transactions th,
table.transactions td {
  border-bottom: 1px solid #EEE;
  padding: 0.3rem;
}

table.transactions th {
  font-weight: bold;
}

table.transactions td.col-1 {
  width: 100px;
}

table.transactions td.col-2 {
  width: 130px;
}

table.transactions td.amount {
  text-align: right;
}

</style>
