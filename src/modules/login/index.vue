<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import request from '@/api/request'
import { loginEasemob } from '@/sdk/easemob'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ username: '', password: '' })
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    const res = await request.post('/admin/auth/login', form.value)
    if (res.code === 0) {
      userStore.setUser(res.data)
      try {
        await loginEasemob(res.data.userId, res.data.easemobToken)
      } catch (e: any) {
        console.warn('console im login failed', e)
      }
      router.push('/workbench')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h2>环信客服控制台</h2>
      <el-form :model="form" label-position="top">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width: 100%" @click="login">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-box {
  width: 360px;
  padding: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}
h2 {
  text-align: center;
  margin-bottom: 24px;
}
</style>
