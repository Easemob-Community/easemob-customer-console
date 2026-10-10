import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    component: () => import('@/modules/login/index.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/workbench',
    children: [
      {
        path: 'workbench',
        component: () => import('@/modules/workbench/index.vue'),
        meta: { title: '坐席工作台', perm: 'workbench' }
      },
      {
        path: 'account',
        component: () => import('@/modules/account/index.vue'),
        meta: { title: '账号管理', perm: 'account' }
      },
      {
        path: 'assignment',
        component: () => import('@/modules/assignment/index.vue'),
        meta: { title: '分配策略', perm: 'assignment' }
      },
      {
        path: 'ai',
        component: () => import('@/modules/ai/index.vue'),
        meta: { title: 'AI 管理', perm: 'ai' }
      },
      {
        path: 'dashboard',
        component: () => import('@/modules/dashboard/index.vue'),
        meta: { title: '数据看板', perm: 'dashboard' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.path !== '/login' && !userStore.isLoggedIn) {
    next('/login')
  } else {
    next()
  }
})

export default router
