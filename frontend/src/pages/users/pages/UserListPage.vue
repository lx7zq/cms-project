<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useUsersStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'

const store = useUsersStore()
const confirmDelete = ref<string | null>(null)

onMounted(() => {
  store.fetchUsers()
})

async function handleDelete(id: string) {
  await store.deleteUser(id)
  confirmDelete.value = null
}

async function handleToggleActive(id: string, current: boolean) {
  await store.toggleActive(id, !current)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Users</h1>
        <p class="mt-1 text-sm text-gray-500">จัดการผู้ใช้งานในระบบ</p>
      </div>
      <router-link to="/users/create">
        <BaseButton>＋ สร้างผู้ใช้ใหม่</BaseButton>
      </router-link>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <input
        :value="store.search"
        @input="store.setSearch(($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="ค้นหาชื่อ หรือ อีเมล..."
        class="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <div v-if="store.loading" class="p-8 text-center text-gray-500">กำลังโหลด...</div>

      <table v-else class="w-full min-w-[640px]">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="user in store.users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-medium text-indigo-600">
                  {{ user.name?.charAt(0)?.toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-gray-900">{{ user.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ user.email }}</td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in (user as any).roles ?? []"
                  :key="role"
                  class="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium"
                >
                  {{ typeof role === 'string' ? role : role.name ?? role }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex px-2 py-0.5 text-xs font-medium rounded-full',
                  user.isActive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700',
                ]"
              >
                {{ user.isActive ? 'Active' : 'Suspended' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <router-link :to="`/users/${user.id}/edit`" class="text-sm text-indigo-600 hover:text-indigo-500">
                  แก้ไข
                </router-link>
                <button
                  @click="handleToggleActive(user.id, user.isActive)"
                  class="text-sm text-amber-600 hover:text-amber-500"
                >
                  {{ user.isActive ? 'ระงับ' : 'เปิดใช้งาน' }}
                </button>
                <button
                  @click="confirmDelete = user.id"
                  class="text-sm text-red-600 hover:text-red-500"
                >
                  ลบ
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="store.users.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">ไม่พบข้อมูลผู้ใช้งาน</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm delete modal -->
    <Teleport to="body">
      <div v-if="confirmDelete" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="confirmDelete = null" />
        <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
          <h3 class="text-lg font-semibold text-gray-900">ยืนยันการลบ</h3>
          <p class="mt-2 text-sm text-gray-500">คุณต้องการระงับบัญชีผู้ใช้งานนี้ใช่หรือไม่?</p>
          <div class="flex justify-end gap-3 mt-6">
            <BaseButton variant="secondary" @click="confirmDelete = null">ยกเลิก</BaseButton>
            <BaseButton variant="danger" @click="handleDelete(confirmDelete!)">ยืนยันลบ</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
