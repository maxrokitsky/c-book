<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BookLayout from '@/layouts/BookLayout.vue'
import LandingLayout from '@/layouts/LandingLayout.vue'
import { usePreferencesStore } from '@/stores/preferences'

const route = useRoute()
const preferences = usePreferencesStore()

const layout = computed(() => (route.meta.layout === 'landing' ? 'landing' : 'book'))

preferences.initTheme()
</script>

<template>
  <LandingLayout v-if="layout === 'landing'">
    <RouterView />
  </LandingLayout>
  <BookLayout v-else>
    <RouterView />
  </BookLayout>
</template>

<style scoped></style>
