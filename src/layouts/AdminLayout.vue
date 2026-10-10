<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const menus = [
  { path: '/workbench', title: '坐席工作台', icon: 'ChatDotRound' },
  { path: '/account', title: '账号管理', icon: 'User' },
  { path: '/assignment', title: '分配策略', icon: 'Share' },
  { path: '/ai', title: 'AI 管理', icon: 'Cpu' },
  { path: '/dashboard', title: '数据看板', icon: 'DataLine' }
]

const activePath = computed(() => route.path)

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="200px" class="aside">
      <div class="logo">环信客服</div>
      <el-menu :default-active="activePath" router class="menu">
        <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
          <span>{{ m.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="title">{{ route.meta.title || '管理控制台' }}</div>
        <div class="user">
          <span>{{ userStore.nickname }} ({{ userStore.role }})</span>
          <el-button text @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}
.aside {
  background: #001529;
  color: #fff;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.menu {
  border-right: none;
  background: transparent;
}
.menu :deep(.el-menu-item),
.menu :deep(.el-menu-item span) {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500;
}
.menu :deep(.el-menu-item:hover),
.menu :deep(.el-menu-item:hover span) {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #fff !important;
}
.menu :deep(.el-menu-item.is-active),
.menu :deep(.el-menu-item.is-active span) {
  background: #1890ff !important;
  color: #fff !important;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.main {
  background: #f5f6f8;
}
</style>
