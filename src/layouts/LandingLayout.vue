<script setup lang="ts">
import TheTopbar from '@/components/layout/TheTopbar.vue'
</script>

<template>
  <div class="landing-layout">
    <TheTopbar :minimal="true" />
    <main class="landing-layout__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.landing-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-primary);
}

.landing-layout__content {
  flex: 1;
  margin-top: var(--topbar-height);
  padding: var(--spacing-8) var(--spacing-6);
  width: 100%;
}

@media (max-width: 767px) {
  .landing-layout__content {
    padding: var(--spacing-6) var(--spacing-4);
  }
}
</style>
