import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
      meta: { layout: 'landing' },
    },
    {
      path: '/:sectionId',
      name: 'section',
      component: () => import('@/views/SectionOverview.vue'),
      meta: { layout: 'book' },
    },
    {
      path: '/:sectionId/:chapterId',
      name: 'chapter',
      component: () => import('@/views/ChapterView.vue'),
      meta: { layout: 'book' },
    },
  ],
})

export default router
