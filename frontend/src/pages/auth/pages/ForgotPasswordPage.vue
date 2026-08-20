<script setup lang="ts">
import { ref } from 'vue'
import AuthProvider from '@/resources/providers/auth.provider'

const authProvider = new AuthProvider()
const email = ref('')
const sent = ref(false)
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authProvider.forgotPassword(email.value)
    sent.value = true
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
      <h2 class="mt-2 text-center text-sm text-gray-600">รีเซ็ตรหัสผ่าน</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200">
        <div v-if="sent" class="text-center space-y-4">
          <div class="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm text-gray-600">
            หากอีเมลนี้มีอยู่ในระบบ จะได้รับลิงก์รีเซ็ตรหัสผ่านทางอีเมล
          </p>
          <router-link to="/login" class="inline-block text-sm text-indigo-600 hover:text-indigo-500">
            ← กลับไปเข้าสู่ระบบ
          </router-link>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-5">
          <p class="text-sm text-gray-600">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@example.com"
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
            {{ loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }}
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
