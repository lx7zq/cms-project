<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores'
import {
  DocumentTextIcon,
  UsersIcon,
  EyeIcon,
  FolderIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()

const stats = ref([
  { name: 'Landing Pages', value: '—', icon: DocumentTextIcon, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Users', value: '—', icon: UsersIcon, color: 'bg-green-50 text-green-600' },
  { name: 'Page Views', value: '—', icon: EyeIcon, color: 'bg-amber-50 text-amber-600' },
  { name: 'Categories', value: '—', icon: FolderIcon, color: 'bg-rose-50 text-rose-600' },
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">สวัสดี {{ auth.user?.name }}, ยินดีต้อนรับสู่ CMS Admin</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.name" class="bg-white rounded-xl border border-gray-200 p-5">
        <div class="flex items-center gap-4">
          <div :class="['p-3 rounded-lg', stat.color]">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ stat.name }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="flex flex-wrap gap-3">
        <router-link
          to="/landing-pages/create"
          class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <DocumentTextIcon class="w-4 h-4" />
          สร้าง Landing Page ใหม่
        </router-link>
        <router-link
          to="/users"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <UsersIcon class="w-4 h-4" />
          จัดการผู้ใช้งาน
        </router-link>
        <router-link
          to="/categories"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <FolderIcon class="w-4 h-4" />
          จัดการหมวดหมู่
        </router-link>
      </div>
    </div>
  </div>
</template>
