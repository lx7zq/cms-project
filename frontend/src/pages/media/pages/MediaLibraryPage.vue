<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useMediaStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const store = useMediaStore()
const confirmDelete = ref<string | null>(null)
const uploadMode = ref<'image' | 'file'>('image')
const dragOver = ref(false)

const fileTypeOptions = [
  { value: '', label: 'ทั้งหมด' },
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
]

const fileIcons: Record<string, string> = {
  PNG: '🖼️', JPG: '🖼️', JPEG: '🖼️', SVG: '🖼️', WebP: '🖼️',
  PDF: '📄', DOCX: '📝', XLSX: '📊', ZIP: '📦',
}

onMounted(() => {
  store.fetchFiles()
})

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (uploadMode.value === 'image') {
    store.uploadImage(file)
  } else {
    store.uploadFile(file)
  }
  input.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (!file) return

  if (file.type.startsWith('image/')) {
    store.uploadImage(file)
  } else {
    store.uploadFile(file)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleDelete(id: string) {
  await store.deleteFile(id)
  confirmDelete.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Media Library</h1>
      <p class="mt-1 text-sm text-gray-500">จัดการไฟル์รูปภาพและเอกสาร</p>
    </div>

    <!-- Upload area -->
    <div
      :class="[
        'bg-white rounded-xl border-2 border-dashed p-8 text-center transition-colors',
        dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-gray-400',
      ]"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <div class="space-y-3">
        <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-gray-600">ลากและวางไฟล์ที่นี่ หรือ</p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <label class="cursor-pointer">
            <input type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
            <BaseButton @click="">อัปโหลดรูปภาพ</BaseButton>
          </label>
          <label class="cursor-pointer">
            <input type="file" accept=".pdf,.docx,.xlsx,.zip" class="hidden" @change="handleFileSelect" />
            <BaseButton variant="secondary" @click="">อัปโหลดไฟล์</BaseButton>
          </label>
        </div>

        <p class="text-xs text-gray-400">PNG, JPG, SVG, WebP, PDF, DOCX, XLSX, ZIP — สูงสุด 10MB</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <BaseSelect
        :model-value="store.fileTypeFilter"
        @update:model-value="store.setFileTypeFilter($event)"
        :options="fileTypeOptions"
        class="w-40"
      />
      <span class="text-sm text-gray-500">{{ store.total }} ไฟล์</span>
    </div>

    <!-- Files grid -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div v-if="store.loading" class="text-center text-gray-500 py-8">กำลังโหลด...</div>

      <div v-else-if="store.files.length === 0" class="text-center py-8 text-gray-500">ยังไม่มีไฟล์</div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div
          v-for="file in store.files"
          :key="file.id"
          class="group relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <!-- Image preview -->
          <div v-if="['PNG','JPG','JPEG','SVG','WebP'].includes(file.fileType)" class="aspect-square">
            <img :src="file.url" :alt="file.altText || file.fileName" class="w-full h-full object-cover" />
          </div>

          <!-- File icon -->
          <div v-else class="aspect-square flex items-center justify-center bg-gray-100">
            <span class="text-4xl">{{ fileIcons[file.fileType] ?? '📁' }}</span>
          </div>

          <!-- Info -->
          <div class="p-2">
            <p class="text-xs font-medium text-gray-700 truncate" :title="file.fileName">{{ file.fileName }}</p>
            <p class="text-xs text-gray-400">{{ formatFileSize(file.fileSize) }}</p>
          </div>

          <!-- Actions overlay -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <a :href="file.url" target="_blank" class="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100" title="Open">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button @click="confirmDelete = file.id" class="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50" title="Delete">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm delete -->
    <Teleport to="body">
      <div v-if="confirmDelete" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="confirmDelete = null" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
          <p class="mt-2 text-sm text-gray-500">คุณต้องการลบไฟล์นี้ใช่หรือไม่?</p>
          <div class="flex justify-end gap-3 mt-6">
            <BaseButton variant="secondary" @click="confirmDelete = null">ยกเลิก</BaseButton>
            <BaseButton variant="danger" @click="handleDelete(confirmDelete!)">ยืนยันลบ</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
