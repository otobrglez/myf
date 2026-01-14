import {defineStore} from 'pinia'
import {ref} from 'vue'
// @ts-ignore
import config from '@/config/categories.yaml'

export interface Category {
  id: string
  name: string
}

export const useCategoryStore =
  defineStore('categories', () => {
    const allCategories = ref<Category[]>(config.categories)
    return {allCategories}
  })
