<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRolesStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const store = useRolesStore()
const showModal = ref(false)
const confirmDelete = ref<string | null>(null)

const form = ref({
  name: '',
  description: '',
  permissionIds: [] as string[],
})

onMounted(() => {
  store.fetchRoles()
  store.fetchPermissions()
})

function openCreate() {
  form.value = { name: '', description: '', permissionIds: [] }
  showModal.value = true
}

function openEdit(role: any) {
  form.value = {
    name: role.name,
    description: role.description || '',
    permissionIds: (role.permissions ?? []).map((p: any) => p.id),
  }
  showModal.value = true
}

async function handleSubmit() {
  if (!form.value.name) return
  await store.createRole(form.value)
  showModal.value = false
}

async function handleDelete(id: string) {
  await store.deleteRole(id)
  confirmDelete.value = null
}

function permissionGroups(permissions: any[]) {
  const groups: Record<string, any[]> = {}
  for (const p of permissions) {
    const group = p.key.split('.')[0]
    if (!groups[group]) groups[group] = []
    groups[group].push(p)
  }
  return groups
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p class="mt-1 text-sm text-gray-500">จัดการบทบาทและสิทธิ์การใช้งาน</p>
      </div>
      <BaseButton @click="openCreate">＋ สร้าง Role ใหม่</BaseButton>
    </div>

    <!-- Roles list -->
    <div v-if="store.loading" class="text-center text-gray-500 py-8">กำลังโหลด...</div>

    <div v-else class="grid gap-4">
      <div
        v-for="role in store.roles"
        :key="role.id"
        class="bg-white rounded-xl border border-gray-200 p-5"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ role.name }}</h3>
            <p v-if="role.description" class="text-sm text-gray-500 mt-1">{{ role.description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openEdit(role)" class="text-sm text-indigo-600 hover:text-indigo-500">แก้ไข</button>
            <button @click="confirmDelete = role.id" class="text-sm text-red-600 hover:text-red-500">ลบ</button>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="perm in (role.permissions ?? [])"
            :key="perm.id ?? perm.key"
            class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium"
          >
            {{ perm.key }}
          </span>
          <span v-if="!(role.permissions ?? []).length" class="text-xs text-gray-400 italic">ไม่มีสิทธิ์</span>
        </div>
      </div>

      <div v-if="store.roles.length === 0" class="text-center py-8 text-gray-500">ยังไม่มี Role</div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal :open="showModal" title="สร้าง Role ใหม่" @close="showModal = false" max-width="lg">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ Role</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="เช่น Admin, Editor"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
          <input
            v-model="form.description"
            type="text"
            placeholder="คำอธิบาย (ไม่บังคับ)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
          <div v-for="(perms, group) in permissionGroups(store.permissions)" :key="group" class="mb-3">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ group }}</p>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="perm in perms"
                :key="perm.id"
                class="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input
                  type="checkbox"
                  :value="perm.id"
                  v-model="form.permissionIds"
                  class="w-3.5 h-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-xs text-gray-700">{{ perm.key }}</span>
              </label>
            </div>
          </div>
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
          <p class="mt-2 text-sm text-gray-500">คุณต้องการลบ Role นี้ใช่หรือไม่?</p>
          <div class="flex justify-end gap-3 mt-6">
            <BaseButton variant="secondary" @click="confirmDelete = null">ยกเลิก</BaseButton>
            <BaseButton variant="danger" @click="handleDelete(confirmDelete!)">ยืนยันลบ</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
