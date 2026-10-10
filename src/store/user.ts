import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type Role = 'admin' | 'leader' | 'agent'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('cs_admin_token') || '')
  const userId = ref<string>('')
  const nickname = ref<string>('')
  const role = ref<Role>('agent')
  const permissions = ref<string[]>([])
  const easemobToken = ref<string>('')

  const isLoggedIn = computed(() => !!token.value)

  function setUser(data: { token: string; userId: string; nickname: string; role: Role; permissions: string[]; easemobToken: string }) {
    token.value = data.token
    userId.value = data.userId
    nickname.value = data.nickname
    role.value = data.role
    permissions.value = data.permissions
    easemobToken.value = data.easemobToken
    localStorage.setItem('cs_admin_token', data.token)
  }

  function logout() {
    token.value = ''
    userId.value = ''
    localStorage.removeItem('cs_admin_token')
  }

  return { token, userId, nickname, role, permissions, easemobToken, isLoggedIn, setUser, logout }
})
