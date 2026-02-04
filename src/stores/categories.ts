import {defineStore} from 'pinia'
import {ref} from 'vue'
import {collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, setDoc, writeBatch} from 'firebase/firestore'
import {db} from '@/firebase'
// @ts-ignore
import config from '@/config/categories.yaml'

export interface Category {
  id: string
  name: string
  order?: number
}

const normalizeCategoryId = (value: string) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'category'
}

export const useCategoryStore =
  defineStore('categories', () => {
    const allCategories = ref<Category[]>(
      config.categories.map((category, index) => ({...category, order: index}))
    )
    const isReady = ref(false)
    const isSeeding = ref(false)
    let seedPromise: Promise<void> | null = null
    let unsubscribe: (() => void) | null = null

    const seedDefaultsIfEmpty = () => {
      if (seedPromise) return seedPromise

      seedPromise = (async () => {
        isSeeding.value = true
        try {
          const snapshot = await getDocs(collection(db, 'categories'))
          if (snapshot.empty) {
            const batch = writeBatch(db)
            config.categories.forEach((category, index) => {
              batch.set(doc(db, 'categories', category.id), {
                name: category.name,
                order: index,
                createdAt: serverTimestamp()
              })
            })
            await batch.commit()
          }
        } catch (error) {
          console.error('Failed to seed categories:', error)
        } finally {
          isSeeding.value = false
          seedPromise = null
        }
      })()

      return seedPromise
    }

    const startSync = async () => {
      if (unsubscribe) return
      await seedDefaultsIfEmpty()

      const categoriesRef = collection(db, 'categories')
      unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
        const list = snapshot.docs.map((docRef) => ({
          id: docRef.id,
          name: docRef.data().name as string,
          order: docRef.data().order as number | undefined
        }))

        list.sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER
          if (orderA !== orderB) return orderA - orderB
          return a.name.localeCompare(b.name)
        })

        allCategories.value = list
        isReady.value = true
      }, (error) => {
        console.error('Failed to load categories:', error)
        isReady.value = true
      })
    }

    startSync()

    const addCategory = async (name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return

      await seedDefaultsIfEmpty()

      const baseId = normalizeCategoryId(trimmed)
      const existingIds = new Set(allCategories.value.map((category) => category.id))
      let candidateId = baseId
      let suffix = 2

      while (existingIds.has(candidateId)) {
        candidateId = `${baseId}-${suffix}`
        suffix += 1
      }

      const maxOrder = allCategories.value.reduce((max, category, index) => {
        const order = category.order ?? index
        return order > max ? order : max
      }, -1)

      await setDoc(doc(db, 'categories', candidateId), {
        name: trimmed,
        order: maxOrder + 1,
        createdAt: serverTimestamp()
      })
    }

    const updateCategoryName = async (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      await seedDefaultsIfEmpty()
      await setDoc(doc(db, 'categories', id), {name: trimmed}, {merge: true})
    }

    const deleteCategory = async (id: string) => {
      await seedDefaultsIfEmpty()
      await deleteDoc(doc(db, 'categories', id))
    }

    return {allCategories, isReady, addCategory, updateCategoryName, deleteCategory}
  })
