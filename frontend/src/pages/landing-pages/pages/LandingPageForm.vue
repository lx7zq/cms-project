<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLandingPagesStore } from '@/stores'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const store = useLandingPagesStore()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const error = ref('')

const form = ref({
  title: '',
  content: '',
  shortDescription: '',
  description: '',
  status: 'DRAFT',
  isPublic: false,
  banner: '',
  thumbnail: '',
  coverImage: '',
  // SEO
  metaTitle: '',
  metaDescription: '',
  keyword: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
})

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'ARCHIVE', label: 'Archive' },
]

onMounted(async () => {
  if (isEdit.value) {
    const page = await store.getPage(route.params.id as string)
    form.value.title = page.title
    form.value.content = page.content
    form.value.shortDescription = page.shortDescription || ''
    form.value.description = page.description || ''
    form.value.status = page.status
    form.value.isPublic = page.isPublic
    form.value.banner = page.banner || ''
    form.value.thumbnail = page.thumbnail || ''
    form.value.coverImage = page.coverImage || ''
    if (page.seo) {
      form.value.metaTitle = page.seo.metaTitle || ''
      form.value.metaDescription = page.seo.metaDescription || ''
      form.value.keyword = page.seo.keyword || ''
      form.value.ogTitle = page.seo.ogTitle || ''
      form.value.ogDescription = page.seo.ogDescription || ''
      form.value.ogImage = page.seo.ogImage || ''
      form.value.canonicalUrl = page.seo.canonicalUrl || ''
    }
  }
})

async function handleSubmit() {
  if (!form.value.title || !form.value.content) {
    error.value = 'กรุณากรอกชื่อและเนื้อหา'
    return
  }

  loading.value = true
  error.value = ''

  const payload: any = {
    title: form.value.title,
    content: form.value.content,
    shortDescription: form.value.shortDescription || undefined,
    description: form.value.description || undefined,
    status: form.value.status,
    isPublic: form.value.isPublic,
    banner: form.value.banner || undefined,
    thumbnail: form.value.thumbnail || undefined,
    coverImage: form.value.coverImage || undefined,
    seo: {
      metaTitle: form.value.metaTitle || undefined,
      metaDescription: form.value.metaDescription || undefined,
      keyword: form.value.keyword || undefined,
      ogTitle: form.value.ogTitle || undefined,
      ogDescription: form.value.ogDescription || undefined,
      ogImage: form.value.ogImage || undefined,
      canonicalUrl: form.value.canonicalUrl || undefined,
    },
  }

  try {
    if (isEdit.value) {
      await store.updatePage(route.params.id as string, payload)
    } else {
      await store.createPage(payload)
    }
    router.push('/landing-pages')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEdit ? 'แก้ไข Landing Page' : 'สร้าง Landing Page ใหม่' }}
      </h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Main content -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 class="text-lg font-semibold text-gray-900">ข้อมูลหลัก</h2>

        <BaseInput v-model="form.title" label="Title" placeholder="ชื่อหน้า" required />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <input
            v-model="form.shortDescription"
            type="text"
            placeholder="คำอธิบายสั้นๆ"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
          <textarea
            v-model="form.content"
            rows="12"
            required
            placeholder="เนื้อหาหน้า (HTML)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseSelect v-model="form.status" label="Status" :options="statusOptions" />
          <BaseInput v-model="form.banner" label="Banner URL" placeholder="https://..." />
          <BaseInput v-model="form.thumbnail" label="Thumbnail URL" placeholder="https://..." />
        </div>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="form.isPublic"
            class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span class="text-sm text-gray-700">เปิดให้บุคคลทั่วไปเข้าชม</span>
        </label>
      </div>

      <!-- SEO -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 class="text-lg font-semibold text-gray-900">SEO</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.metaTitle" label="Meta Title" placeholder="SEO title" />
          <BaseInput v-model="form.keyword" label="Keywords" placeholder="keyword1, keyword2" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
          <textarea
            v-model="form.metaDescription"
            rows="3"
            placeholder="คำอธิบายสำหรับ SEO"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.ogTitle" label="OG Title" placeholder="Open Graph title" />
          <BaseInput v-model="form.ogDescription" label="OG Description" placeholder="Open Graph description" />
          <BaseInput v-model="form.ogImage" label="OG Image URL" placeholder="https://..." />
          <BaseInput v-model="form.canonicalUrl" label="Canonical URL" placeholder="https://..." />
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {{ error }}
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <BaseButton :loading="loading" type="submit">
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างหน้า' }}
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/landing-pages')">ยกเลิก</BaseButton>
      </div>
    </form>
  </div>
</template>
