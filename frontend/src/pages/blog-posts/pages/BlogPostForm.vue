<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogPostsStore, useCategoriesStore, useTagsStore } from '@/stores'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogPostsStore()
const categoriesStore = useCategoriesStore()
const tagsStore = useTagsStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const error = ref('')

const form = ref({
  title: '',
  content: '',
  excerpt: '',
  description: '',
  status: 'DRAFT',
  isFeatured: false,
  isPinned: false,
  readingTime: '',
  thumbnail: '',
  coverImage: '',
  banner: '',
  // SEO
  metaTitle: '',
  metaDescription: '',
  keyword: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
  // Relations
  categoryIds: [] as string[],
  tagIds: [] as string[],
})

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'PUBLIC', label: 'Public' },
]

onMounted(async () => {
  await Promise.all([
    categoriesStore.fetchCategories('BLOG_POST'),
    tagsStore.fetchTags(),
  ])

  if (isEdit.value) {
    const post = await blogStore.getPost(route.params.id as string)
    form.value.title = post.title
    form.value.content = post.content
    form.value.excerpt = post.excerpt || ''
    form.value.description = post.description || ''
    form.value.status = post.status
    form.value.isFeatured = post.isFeatured
    form.value.isPinned = post.isPinned
    form.value.readingTime = post.readingTime || ''
    form.value.thumbnail = post.thumbnail || ''
    form.value.coverImage = post.coverImage || ''
    form.value.banner = post.banner || ''
    form.value.categoryIds = (post.categories ?? []).map((cc: any) => cc.categoryId ?? cc.category?.id)
    form.value.tagIds = (post.tags ?? []).map((ct: any) => ct.tagId ?? ct.tag?.id)
    if (post.seo) {
      form.value.metaTitle = post.seo.metaTitle || ''
      form.value.metaDescription = post.seo.metaDescription || ''
      form.value.keyword = post.seo.keyword || ''
      form.value.ogTitle = post.seo.ogTitle || ''
      form.value.ogDescription = post.seo.ogDescription || ''
      form.value.ogImage = post.seo.ogImage || ''
      form.value.canonicalUrl = post.seo.canonicalUrl || ''
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
    excerpt: form.value.excerpt || undefined,
    description: form.value.description || undefined,
    status: form.value.status,
    isFeatured: form.value.isFeatured,
    isPinned: form.value.isPinned,
    readingTime: form.value.readingTime ? Number(form.value.readingTime) : undefined,
    thumbnail: form.value.thumbnail || undefined,
    coverImage: form.value.coverImage || undefined,
    banner: form.value.banner || undefined,
    categoryIds: form.value.categoryIds,
    tagIds: form.value.tagIds,
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
      await blogStore.updatePost(route.params.id as string, payload)
    } else {
      await blogStore.createPost(payload)
    }
    router.push('/blog-posts')
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
        {{ isEdit ? 'แก้ไขบทความ' : 'สร้างบทความใหม่' }}
      </h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Main content -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 class="text-lg font-semibold text-gray-900">ข้อมูลหลัก</h2>

        <BaseInput v-model="form.title" label="Title" placeholder="ชื่อบทความ" required />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
          <textarea
            v-model="form.excerpt"
            rows="2"
            placeholder="คำอธิบายสั้นๆ"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Content (HTML)</label>
          <textarea
            v-model="form.content"
            rows="15"
            required
            placeholder="เนื้อบทความ (HTML)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseSelect v-model="form.status" label="Status" :options="statusOptions" />
          <BaseInput v-model="form.readingTime" label="Reading Time (min)" type="number" />
          <BaseInput v-model="form.thumbnail" label="Thumbnail URL" placeholder="https://..." />
        </div>

        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.isFeatured" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span class="text-sm text-gray-700">Featured Post</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.isPinned" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span class="text-sm text-gray-700">Pinned Post</span>
          </label>
        </div>
      </div>

      <!-- Categories & Tags -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 class="text-lg font-semibold text-gray-900">Categories & Tags</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="cat in categoriesStore.categories"
              :key="cat.id"
              class="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100"
            >
              <input type="checkbox" :value="cat.id" v-model="form.categoryIds" class="w-3.5 h-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <span class="text-xs text-gray-700">{{ cat.name }}</span>
            </label>
            <span v-if="categoriesStore.categories.length === 0" class="text-xs text-gray-400">ยังไม่มี Category</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div class="flex flex-wrap gap-2">
            <label
              v-for="tag in tagsStore.tags"
              :key="tag.id"
              class="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100"
            >
              <input type="checkbox" :value="tag.id" v-model="form.tagIds" class="w-3.5 h-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <span class="text-xs text-gray-700">#{{ tag.name }}</span>
            </label>
            <span v-if="tagsStore.tags.length === 0" class="text-xs text-gray-400">ยังไม่มี Tag</span>
          </div>
        </div>
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
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างบทความ' }}
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/blog-posts')">ยกเลิก</BaseButton>
      </div>
    </form>
  </div>
</template>
