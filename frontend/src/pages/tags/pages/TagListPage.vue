<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTagsStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const store = useTagsStore()
const showModal = ref(false)
const confirmDelete = ref<string | null>(null)
const editTag = ref<{ id: string; name: string } | null>(null)

const tagName = ref('')

onMounted(() => {
  store.fetchTags()
})

function openCreate() {
  editTag.value = null
  tagName.value = ''
  showModal.value = true
}

function openEdit(tag: any) {
  editTag.value = tag
  tagName.value = tag.name
  showModal.value = true
}

async function handleSubmit() {
  if (!tagName.value.trim()) return

  if (editTag.value) {
    await store.updateTag(editTag.value.id, { name: tagName.value })
  } else {
    await store.createTag({ name: tagName.value })
  }
  showModal.value = false
}

async function handleDelete(id: string) {
  await store.deleteTag(id)
  confirmDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tags</h1>
        <p class="mt-1 text-sm text-gray-500">จัดการแท็กสำหรับเนื้อหา</p>
      </div>
      <BaseButton @click="openCreate">＋ สร้าง Tag ใหม่</BaseButton>
    </div>

    <!-- Tags grid -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="store.loading" class="text-center text-gray-500 py-8">กำลังโหลด...</div>

      <div v-else-if="store.tags.length === 0" class="text-center py-8 text-gray-500">ยังไม่มี Tag</div>

      <div v-else class="flex flex-wrap gap-2">
        <div
          v-for="tag in store.tags"
          :key="tag.id"
          class="group flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <span class="text-sm text-gray-700">#{{ tag.name }}</span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openEdit(tag)" class="text-xs text-indigo-600 hover:text-indigo-500">แก้ไข</button>
            <button @click="confirmDelete = tag.id" class="text-xs text-red-500 hover:text-red-400">ลบ</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal
      :open="showModal"
      :title="editTag ? 'แก้ไข Tag' : 'สร้าง Tag ใหม่'"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ Tag</label>
          <input
            v-model="tagName"
            type="text"
            required
            placeholder="เช่น technology, news"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
          <p class="mt-2 text-sm text-gray-500">คุณต้องการลบ Tag นี้ใช่หรือไม่?</p>
          <div class="flex justify-end gap-3 mt-6">
            <BaseButton variant="secondary" @click="confirmDelete = null">ยกเลิก</BaseButton>
            <BaseButton variant="danger" @click="handleDelete(confirmDelete!)">ยืนยันลบ</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
