import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/about'
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView/index.vue')
  },
  {
    path: '/map/:id?',
    name: 'Map',
    component: () => import('../views/MapView/index.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
