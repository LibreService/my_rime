import { createRouter, createWebHistory } from 'vue-router'
import MainView from './views/MainView.vue'

const routes = [
  { path: '/', name: 'Main', component: MainView }
]

function findBaseURL (entryPath: string) {
  return entryPath.substring(0, entryPath.lastIndexOf('/'))
}

const router = createRouter({
  history: createWebHistory(findBaseURL(window.location.pathname)),
  routes
})

export default router
