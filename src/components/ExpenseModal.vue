<script setup lang="ts">
import {ref, watch} from "vue";
import {collection, addDoc, deleteDoc, doc, serverTimestamp} from "firebase/firestore";
import {db} from "@/firebase.ts";
import {useAuthStore} from "@/stores/auth.ts";
import type {Category} from "@/stores/categories";
import type {YearMonth} from "@/clock.ts";
import type {UserSetting} from "@/stores/settings.ts";
import {getMonthName} from "@/clock.ts";
import type {Expense} from "@/views/GridView.vue";
import {formatCurrency} from "@/currency.ts";

const props = defineProps<{
  isOpen: boolean;
  context: { yearMonth: YearMonth; category: Category } | null;
  userSettings: UserSetting[];
  expenses: Expense[];
}>();

const emit = defineEmits(["close", "saved"]);

const authStore = useAuthStore();
const expenseAmount = ref<number | null>(null);
const selectedUserId = ref<string>("");

// Sync defaults when the modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    expenseAmount.value = null;
    const currentUser = props.userSettings.find(u => u.id === authStore.user?.uid);
    selectedUserId.value = currentUser ? currentUser.id : (props.userSettings[0]?.id || "");
  }
});

const saveExpense = async () => {
  if (!props.context || !expenseAmount.value) return;

  const {yearMonth, category} = props.context;
  const [year, month] = yearMonth;

  try {
    await addDoc(collection(db, "expenses"), {
      amount: expenseAmount.value,
      year,
      month,
      categoryId: category.id,
      targetUserId: selectedUserId.value,
      targetUserName: props.userSettings.find(u => u.id === selectedUserId.value)?.name,
      creatorUid: authStore.user?.uid,
      creatorEmail: authStore.user?.email,
      createdAt: serverTimestamp(),
      createdBy: authStore.user?.email,
      createdByName: props.userSettings.find(u => u.id === authStore.user?.uid)?.name
    });
    emit("saved");
    emit("close");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const deleteExpense = async (id: string) => {
  if (!confirm("Ali ste prepričani, da želite izbrisati ta strošek?")) return;
  try {
    await deleteDoc(doc(db, "expenses", id));
  } catch (e) {
    console.error("Napaka pri brisanju dokumenta: ", e);
  }
};

</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>{{ $t('add_expense') }}</h3>
      <p v-if="context">
        {{ context.category.name }} - {{ getMonthName(context.yearMonth) }} {{
          context.yearMonth[0]
        }}
      </p>

      <div v-if="expenses.length > 0" class="existing-expenses">
        <label>{{ $t('existing_expenses') }}</label>
        <ul>
          <li v-for="expense in expenses" :key="expense.id" class="expense-item">
          <span class="user-badge"
                :style="{ backgroundColor: userSettings.find(u => u.id === expense.targetUserId)?.color }">
            {{ expense.targetUserName || '?' }}
          </span>
            <span class="expense-amount">{{ formatCurrency(expense.amount) }}</span>
            <button @click="deleteExpense(expense.id!)" class="btn-delete">×</button>
          </li>
        </ul>
      </div>

      <div class="divider" v-if="expenses.length > 0"></div>

      <div class="form-group">
        <label>{{ $t('amount_currency') }}</label>
        <input type="number" v-model="expenseAmount" placeholder="0.00" step="1.00" autofocus/>
      </div>

      <div class="form-group">
        <label>{{ $t('pick_user') }}</label>
        <select v-model="selectedUserId" class="user-select">
          <option v-for="user in userSettings" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="btn-secondary">{{ $t('close') }}</button>
        <button @click="saveExpense" class="btn-primary" :disabled="!expenseAmount">
          {{ $t('save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.8rem;
  margin-bottom: 4px;
  color: #666;
}

.form-group input, .user-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  background: #ccc;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}


.existing-expenses {
  margin-bottom: 15px;
}

.existing-expenses ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.existing-expenses label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #777;
  display: block;
  margin-bottom: 8px;
}

.expense-item {
  display: flex;
  align-items: center;
  padding: 2px 0;
  border-bottom: 1px solid #f1f3f4;
}

.expense-item:last-child {
  border-bottom: none;
}

.user-badge {
  margin-right: 10px;
}

.expense-amount {
  flex-grow: 1;
  font-variant-numeric: tabular-nums;
}

.btn-delete {
  background: none;
  border: none;
  color: #d93025;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
}

.btn-delete:hover {
  color: #a50e0e;
}

.divider {
  height: 1px;
  background-color: #e8eaed;
  margin: 10px 0;
}


</style>
