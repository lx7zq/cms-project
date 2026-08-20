<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBlogPostsStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { DocumentDuplicateIcon, TrashIcon } from '@heroicons/vue/24/outline'

const store = useBlogPostsStore()
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
  store.fetchPosts()
})

async function handleDelete(id: string) {
  await store.deletePost(id)
  confirmDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <p class="mt-1 text-sm text-gray-500">จัดการบทความ</p>
      </div>
      <router-link to="/blog-posts/create">
        <BaseButton>＋ สร้างบทความใหม่</BaseButton>
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
      <input
        :value="store.search"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="ค้นหาชื่อบทความ..."
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

      <table v-else class="w-full min-w-[700px]">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="post in store.posts" :key="post.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ post.title }}</p>
                <p class="text-xs text-gray-400">/{{ post.slug }}</p>
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="['inline-block px-2 py-0.5 text-xs font-medium rounded-full', statusColors[post.status] ?? 'bg-gray-100 text-gray-700']">
                {{ post.status }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span v-if="post.isFeatured" class="text-amber-500 text-xs font-medium">★ Featured</span>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ post.viewCount }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ new Date(post.updatedAt).toLocaleDateString('th-TH') }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <router-link :to="`/blog-posts/${post.id}/edit`" class="p-1.5 rounded hover:bg-gray-100" title="แก้ไข">
                  <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </router-link>
                <button
                  v-if="post.status === 'DRAFT'"
                  @click="store.publishPost(post.id)"
                  class="p-1.5 rounded hover:bg-green-50"
                  title="Publish"
                >
                  <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  v-if="post.status === 'PUBLIC'"
                  @click="store.unpublishPost(post.id)"
                  class="p-1.5 rounded hover:bg-amber-50"
                  title="Unpublish"
                >
                  <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </button>
                <button @click="store.duplicatePost(post.id)" class="p-1.5 rounded hover:bg-gray-100" title="Duplicate">
                  <DocumentDuplicateIcon class="w-4 h-4 text-gray-500" />
                </button>
                <button @click="confirmDelete = post.id" class="p-1.5 rounded hover:bg-red-50" title="Delete">
                  <TrashIcon class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="store.posts.length === 0">
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
          <p class="mt-2 text-sm text-gray-500">คุณต้องการลบบทความนี้ใช่หรือไม่?</p>
          <div class="flex justify-end gap-3 mt-6">
            <BaseButton variant="secondary" @click="confirmDelete = null">ยกเลิก</BaseButton>
            <BaseButton variant="danger" @click="handleDelete(confirmDelete!)">ยืนยันลบ</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
