<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLandingPagesStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import {
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const store = useLandingPagesStore()
const confirmDelete = ref<string | null>(null)

const statusOptions = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'ARCHIVE', label: 'Archive' },
]

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLIC: 'bg-green-100 text-green-700',
  PRIVATE: 'bg-amber-100 text-amber-700',
  ARCHIVE: 'bg-red-100 text-red-700',
}

onMounted(() => {
  store.fetchPages()
})

async function handleDelete(id: string) {
  await store.deletePage(id)
  confirmDelete.value = null
}

async function handleDuplicate(id: string) {
  await store.duplicatePage(id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Landing Pages</h1>
        <p class="mt-1 text-sm text-gray-500">จัดการหน้า Landing Page</p>
      </div>
      <router-link to="/landing-pages/create">
        <BaseButton>＋ สร้างหน้าใหม่</BaseButton>
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
      <input
        :value="store.search"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="ค้นหาชื่อหน้า..."
        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <BaseSelect
        :model-value="store.statusFilter"
        @update:model-value="store.setStatusFilter($event)"
        :options="statusOptions"
        class="w-full sm:w-40"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <div v-if="store.loading" class="p-8 text-center text-gray-500">กำลังโหลด...</div>

      <table v-else class="w-full min-w-[800px]">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Public</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="page in store.pages" :key="page.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ page.title }}</p>
                <p class="text-xs text-gray-400">/{{ page.slug }}</p>
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="['inline-block px-2 py-0.5 text-xs font-medium rounded-full', statusColors[page.status] ?? 'bg-gray-100 text-gray-700']">
                {{ page.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span :class="['text-xs font-medium', page.isPublic ? 'text-green-600' : 'text-gray-400']">
                {{ page.isPublic ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ page.viewCount }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ new Date(page.updatedAt).toLocaleDateString('th-TH') }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <router-link :to="`/landing-pages/${page.id}/edit`" class="p-1.5 rounded hover:bg-gray-100" title="แก้ไข">
                  <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </router-link>
                <button
                  v-if="page.status === 'DRAFT'"
                  @click="store.publishPage(page.id)"
                  class="p-1.5 rounded hover:bg-green-50"
                  title="Publish"
                >
                  <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  v-if="page.status === 'PUBLIC'"
                  @click="store.unpublishPage(page.id)"
                  class="p-1.5 rounded hover:bg-amber-50"
                  title="Unpublish"
                >
                  <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
                  </svg>
                </button>
                <button @click="handleDuplicate(page.id)" class="p-1.5 rounded hover:bg-gray-100" title="Duplicate">
                  <DocumentDuplicateIcon class="w-4 h-4 text-gray-500" />
                </button>
                <button @click="confirmDelete = page.id" class="p-1.5 rounded hover:bg-red-50" title="Delete">
                  <TrashIcon class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="store.pages.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">ไม่พบข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="confirmDelete" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="confirmDelete = null" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
          <p class="mt-2 text-sm text-gray-500">คุณต้องการลบหน้านี้ใช่หรือไม่? (Soft Delete)</p>
          <div class="flex justify-end gap-3 mt-6">
            <BaseButton variant="secondary" @click="confirmDelete = null">ยกเลิก</BaseButton>
            <BaseButton variant="danger" @click="handleDelete(confirmDelete!)">ยืนยันลบ</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
