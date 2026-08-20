<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'
import {
  HomeIcon,
  UsersIcon,
  KeyIcon,
  DocumentTextIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(true)
const userMenuOpen = ref(false)

const navigation = computed(() => [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon, show: true },
  { name: 'Users', to: '/users', icon: UsersIcon, show: auth.hasPermission('user.manage') },
  { name: 'Roles & Permissions', to: '/roles', icon: KeyIcon, show: auth.hasPermission('role.manage') },
  { name: 'Landing Pages', to: '/landing-pages', icon: DocumentTextIcon, show: auth.hasPermission('landing_page.view') },
  { name: 'Blog Posts', to: '/blog-posts', icon: DocumentTextIcon, show: auth.hasPermission('blog.view') },
  { name: 'Categories', to: '/categories', icon: FolderIcon, show: auth.hasPermission('category.manage') },
  { name: 'Tags', to: '/tags', icon: TagIcon, show: auth.hasPermission('tag.manage') },
  { name: 'Media Library', to: '/media', icon: PhotoIcon, show: auth.hasPermission('media.manage') },
])

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

onMounted(async () => {
  await auth.fetchMe()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <span class="text-xl font-bold text-indigo-600">CMS Admin</span>
        <button @click="sidebarOpen = false" class="lg:hidden p-1 rounded hover:bg-gray-100">
          <XMarkIcon class="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <nav class="p-4 space-y-1">
        <router-link
          v-for="item in navigation.filter(n => n.show)"
          :key="item.to"
          :to="item.to"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            route.path.startsWith(item.to)
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex-1 lg:pl-64">
      <!-- Top bar -->
      <header class="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
        <button @click="sidebarOpen = !sidebarOpen" class="lg:hidden p-2 rounded hover:bg-gray-100">
          <Bars3Icon class="w-5 h-5 text-gray-600" />
        </button>

        <div class="flex-1" />

        <!-- User menu -->
        <div class="relative">
          <button
            @click="userMenuOpen = !userMenuOpen"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() ?? '?' }}
            </div>
            <span class="text-sm font-medium text-gray-700 hidden sm:block">{{ auth.user?.name }}</span>
          </button>
          <div
            v-if="userMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
            @click="userMenuOpen = false"
          >
            <div class="px-4 py-2 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ auth.user?.name }}</p>
              <p class="text-xs text-gray-500">{{ auth.user?.email }}</p>
            </div>
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftOnRectangleIcon class="w-4 h-4" />
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-6">
        <router-view v-slot="{ Component }">
          <transition mode="out-in" name="fade">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
