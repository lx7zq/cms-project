import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IAuthUser } from '@/models/auth.model'
import AuthProvider from '@/resources/providers/auth.provider'
import { clearTokens, setAuthToken, setRefreshToken } from '@/utils/Storage'

const authProvider = new AuthProvider()

export const useAuthStore = defineStore('auth', () => {
  const user = ref<IAuthUser | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userRoles = computed(() => user.value?.roles ?? [])
  const userPermissions = computed(() => user.value?.permissions ?? [])

  function hasPermission(permission: string) {
    return userPermissions.value.includes(permission)
  }

  function hasRole(role: string) {
    return userRoles.value.includes(role)
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data = await authProvider.login({ email, password })
      user.value = data.user
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken
      setAuthToken(data.accessToken)
      setRefreshToken(data.refreshToken)
      return data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return
    try {
      const data = await authProvider.getMe()
      user.value = data.user
    } catch {
      logout()
    }
  }

  async function logout() {
    try {
      await authProvider.logout()
    } catch {
      // ignore
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      clearTokens()
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    await authProvider.changePassword(oldPassword, newPassword)
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    userRoles,
    userPermissions,
    hasPermission,
    hasRole,
    login,
    fetchMe,
    logout,
    changePassword,
  }
})
