<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {type Category, useCategoryStore} from "@/stores/categories";

const {t} = useI18n();
const categoryStore = useCategoryStore();
const {allCategories, isReady} = categoryStore;

const newCategoryName = ref("");
const errorMessage = ref("");
const isWorking = ref(false);
const draftNames = ref<Record<string, string>>({});

watch(allCategories, (list) => {
  const nextDrafts: Record<string, string> = {};
  list.forEach((category) => {
    nextDrafts[category.id] = draftNames.value[category.id] ?? category.name;
  });
  draftNames.value = nextDrafts;
}, {immediate: true});

const canAdd = computed(() => newCategoryName.value.trim().length > 0);

const isDirty = (category: Category) => {
  const draft = (draftNames.value[category.id] ?? "").trim();
  return draft.length > 0 && draft !== category.name;
};

const handleAdd = async () => {
  const name = newCategoryName.value.trim();
  if (!name) return;

  errorMessage.value = "";
  isWorking.value = true;
  try {
    await categoryStore.addCategory(name);
    newCategoryName.value = "";
  } catch (error) {
    console.error("Failed to add category:", error);
    errorMessage.value = t("categories_error");
  } finally {
    isWorking.value = false;
  }
};

const saveCategory = async (category: Category) => {
  const nextName = (draftNames.value[category.id] ?? "").trim();
  if (!nextName) {
    errorMessage.value = t("category_name_required");
    return;
  }

  if (nextName === category.name) return;

  errorMessage.value = "";
  isWorking.value = true;
  try {
    await categoryStore.updateCategoryName(category.id, nextName);
  } catch (error) {
    console.error("Failed to update category:", error);
    errorMessage.value = t("categories_error");
  } finally {
    isWorking.value = false;
  }
};

const removeCategory = async (category: Category) => {
  if (!confirm(t("delete_category_confirm", {name: category.name}))) return;

  errorMessage.value = "";
  isWorking.value = true;
  try {
    await categoryStore.deleteCategory(category.id);
  } catch (error) {
    console.error("Failed to delete category:", error);
    errorMessage.value = t("categories_error");
  } finally {
    isWorking.value = false;
  }
};
</script>

<template>
  <div class="categories-view">
    <h1>{{ $t("categories") }}</h1>
    <p class="hint">{{ $t("categories_hint") }}</p>

    <form class="add-category" @submit.prevent="handleAdd">
      <input
        v-model="newCategoryName"
        :placeholder="$t('new_category_placeholder')"
        type="text"
        autocomplete="off"
      />
      <button class="btn-primary" type="submit" :disabled="!canAdd || isWorking">
        {{ $t("add_category") }}
      </button>
    </form>

    <div v-if="!isReady" class="loading">{{ $t("loading_categories") }}</div>

    <table v-else class="category-table">
      <thead>
      <tr>
        <th>{{ $t("category_name") }}</th>
        <th>{{ $t("category_id") }}</th>
        <th>{{ $t("actions") }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="category in allCategories" :key="category.id">
        <td class="name-cell">
          <input v-model="draftNames[category.id]" type="text"/>
        </td>
        <td class="id-cell">{{ category.id }}</td>
        <td class="actions-cell">
          <button
            class="btn-secondary"
            type="button"
            :disabled="!isDirty(category) || isWorking"
            @click="saveCategory(category)"
          >
            {{ $t("save") }}
          </button>
          <button
            class="btn-danger"
            type="button"
            :disabled="isWorking"
            @click="removeCategory(category)"
          >
            {{ $t("delete") }}
          </button>
        </td>
      </tr>
      <tr v-if="allCategories.length === 0">
        <td colspan="3" class="empty">{{ $t("categories_empty") }}</td>
      </tr>
      </tbody>
    </table>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.categories-view {
  max-width: 900px;
}

.hint {
  margin-top: 6px;
  color: #666;
}

.add-category {
  display: flex;
  gap: 10px;
  margin: 18px 0;
}

.add-category input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading {
  color: #666;
  margin-top: 10px;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.category-table th,
.category-table td {
  border-bottom: 1px solid #eee;
  padding: 8px;
  text-align: left;
  vertical-align: middle;
}

.category-table input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions-cell {
  white-space: nowrap;
}

.actions-cell button + button {
  margin-left: 8px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  border-radius: 4px;
  padding: 6px 12px;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn-primary {
  background: #1a73e8;
  color: #fff;
}

.btn-secondary {
  background: #f1f3f4;
  color: #333;
}

.btn-danger {
  background: #d93025;
  color: #fff;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-danger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.empty {
  color: #666;
  padding: 12px 8px;
}

.error {
  margin-top: 10px;
  color: #d93025;
}
</style>
