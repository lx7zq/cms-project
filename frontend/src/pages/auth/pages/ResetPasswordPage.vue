<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthProvider from '@/resources/providers/auth.provider'

const route = useRoute()
const router = useRouter()
const authProvider = new AuthProvider()

const token = ref((route.query.token as string) || '')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

async function handleSubmit() {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await authProvider.resetPassword(token.value, newPassword.value)
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h1 class="text-center text-3xl font-bold text-indigo-600">CMS Admin</h1>
      <h2 class="mt-2 text-center text-sm text-gray-600">ตั้งรหัสผ่านใหม่</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
        <div v-if="success" class="text-center space-y-4">
          <div class="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm text-gray-600">เปลี่ยนรหัสผ่านสำเร็จ</p>
          <button
            @click="router.push('/login')"
            class="text-sm text-indigo-600 hover:text-indigo-500"
          >
            → ไปเข้าสู่ระบบ
          </button>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Token</label>
            <input
              v-model="token"
              type="text"
              placeholder="ใส่ token จากอีเมล"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {{ loading ? 'กำลังดำเนินการ...' : 'เปลี่ยนรหัสผ่าน' }}
          </button>

          <div class="text-center">
            <router-link to="/login" class="text-sm text-indigo-600 hover:text-indigo-500">
              ← กลับไปเข้าสู่ระบบ
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
