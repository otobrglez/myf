import {defineStore} from 'pinia'
import {computed} from 'vue'
// @ts-ignore
import settingsData from '@/config/settings.yaml'

export type UserSetting = {
  id: string;
  name: string;
  color: string;
}

export type AppSetting = {
  yearsBack: number;
  currency: string;
}

export const useSettingsStore =
  defineStore('settings', () => {
    const appSettings = computed(() => settingsData.app_settings as AppSetting)

    const availableYears = computed(() => {
      const currentYear = new Date().getFullYear()
      const yearsBack = appSettings.value.yearsBack || 3
      return Array.from({length: yearsBack + 1}, (_, i) => currentYear - i)
    })

    const userSettings = computed(() => settingsData.users_settings as UserSetting[]);

    return {appSettings, availableYears, userSettings}
  })
