<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCategoriesStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const store = useCategoriesStore()
const showModal = ref(false)
const confirmDelete = ref<string | null>(null)
const contentTypeFilter = ref('LANDING_PAGE')

const form = ref({
  name: '',
  contentType: 'LANDING_PAGE' as 'LANDING_PAGE' | 'BLOG_POST',
})

const contentTypeOptions = [
  { value: 'LANDING_PAGE', label: 'Landing Page' },
  { value: 'BLOG_POST', label: 'Blog Post' },
]

onMounted(() => {
  store.fetchCategories(contentTypeFilter.value)
})

function handleFilterChange() {
  store.fetchCategories(contentTypeFilter.value)
}

function openCreate() {
  form.value = { name: '', contentType: contentTypeFilter.value as any }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.name) return
  await store.createCategory(form.value)
  showModal.value = false
  store.fetchCategories(contentTypeFilter.value)
}

async function handleDelete(id: string) {
  await store.deleteCategory(id)
  confirmDelete.value = null
  store.fetchCategories(contentTypeFilter.value)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
        <p class="mt-1 text-sm text-gray-500">จัดการหมวดหมู่เนื้อหา</p>
      </div>
      <BaseButton @click="openCreate">＋ สร้างหมวดหมู่ใหม่</BaseButton>
    </div>

    <!-- Filter -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <label class="text-sm font-medium text-gray-700">Content Type:</label>
      <div class="flex gap-2">
        <button
          v-for="opt in contentTypeOptions"
          :key="opt.value"
          @click="contentTypeFilter = opt.value; handleFilterChange()"
          :class="[
            'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
            contentTypeFilter === opt.value
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          ]"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <div v-if="store.loading" class="p-8 text-center text-gray-500">กำลังโหลด...</div>

      <table v-else class="w-full min-w-[500px]">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="cat in store.categories" :key="cat.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ cat.name }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ cat.slug }}</td>
            <td class="px-6 py-4">
              <span class="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                {{ cat.contentType === 'LANDING_PAGE' ? 'Landing Page' : 'Blog Post' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-block px-2 py-0.5 text-xs font-medium rounded-full',
                  cat.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500',
                ]"
              >
                {{ cat.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button
                @click="confirmDelete = cat.id"
                class="text-sm text-red-600 hover:text-red-500"
              >
                ลบ
              </button>
            </td>
          </tr>
          <tr v-if="store.categories.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">ไม่พบข้อมูลหมวดหมู่</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create Modal -->
    <BaseModal :open="showModal" title="สร้างหมวดหมู่ใหม่" @close="showModal = false">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อหมวดหมู่</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="ชื่อหมวดหมู่"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
          <select
            v-model="form.contentType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="LANDING_PAGE">Landing Page</option>
            <option value="BLOG_POST">Blog Post</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="secondary" @click="showModal = false">ยกเลิก</BaseButton>
          <BaseButton type="submit">บันทึก</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="confirmDelete" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="confirmDelete = null" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
          <p class="mt-2 text-sm text-gray-500">คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?</p>
          <div class="flex justify-end gap-3 mt-6">
            <BaseButton variant="secondary" @click="confirmDelete = null">ยกเลิก</BaseButton>
            <BaseButton variant="danger" @click="handleDelete(confirmDelete!)">ยืนยันลบ</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
