import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref<'dark' | 'light'>('dark')
  const fontSize = ref(16)

  function initTheme() {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      theme.value = saved
    }
    const savedSize = localStorage.getItem('fontSize')
    if (savedSize) {
      const parsed = Number(savedSize)
      if (parsed >= 14 && parsed <= 22) {
        fontSize.value = parsed
      }
    }
    applyThemeClass()
  }

  function applyThemeClass() {
    if (theme.value === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', theme.value)
    applyThemeClass()
  }

  function setFontSize(size: number) {
    if (size >= 14 && size <= 22) {
      fontSize.value = size
      localStorage.setItem('fontSize', String(size))
    }
  }

  return { theme, fontSize, initTheme, toggleTheme, setFontSize }
})
