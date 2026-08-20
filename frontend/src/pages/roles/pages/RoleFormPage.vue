<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRolesStore } from '@/stores'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const store = useRolesStore()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const error = ref('')

const form = ref({
  name: '',
  description: '',
  permissionIds: [] as string[],
})

onMounted(async () => {
  await store.fetchPermissions()
  if (isEdit.value) {
    const role = await store.getRole(route.params.id as string)
    form.value.name = role.name
    form.value.description = role.description || ''
    form.value.permissionIds = (role.permissions ?? []).map((p: any) => p.id)
  } else {
    await store.fetchRoles()
  }
})

function permissionGroups() {
  const groups: Record<string, any[]> = {}
  for (const p of store.permissions) {
    const group = p.key.split('.')[0]
    if (!groups[group]) groups[group] = []
    groups[group].push(p)
  }
  return groups
}

async function handleSubmit() {
  if (!form.value.name) return
  loading.value = true
  error.value = ''
  try {
    if (isEdit.value) {
      await store.updateRole(route.params.id as string, {
        name: form.value.name,
        description: form.value.description,
      })
    } else {
      await store.createRole(form.value)
    }
    router.push('/roles')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        {{ isEdit ? 'แก้ไข Role' : 'สร้าง Role ใหม่' }}
      </h1>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <BaseInput v-model="form.name" label="ชื่อ Role" placeholder="เช่น Admin, Editor" required />
      <BaseInput v-model="form.description" label="คำอธิบาย" placeholder="คำอธิบาย (ไม่บังคับ)" />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
        <div v-for="(perms, group) in permissionGroups()" :key="group" class="mb-4">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">{{ group }}</p>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="perm in perms"
              :key="perm.id"
              class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
            >
              <input
                type="checkbox"
                :value="perm.id"
                v-model="form.permissionIds"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div>
                <span class="text-sm text-gray-700">{{ perm.key }}</span>
                <span v-if="perm.description" class="block text-xs text-gray-400">{{ perm.description }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {{ error }}
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
        <BaseButton :loading="loading" type="submit">
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้าง Role' }}
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/roles')">ยกเลิก</BaseButton>
      </div>
    </form>
  </div>
</template>
