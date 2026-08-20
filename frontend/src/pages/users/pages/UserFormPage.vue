<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore, useRolesStore } from '@/stores'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const rolesStore = useRolesStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const error = ref('')

const form = ref({
  name: '',
  email: '',
  password: '',
  roleIds: [] as string[],
})

onMounted(async () => {
  await rolesStore.fetchRoles()

  if (isEdit.value) {
    const user = await usersStore.getUser(route.params.id as string)
    form.value.name = user.name
    form.value.email = user.email
    form.value.roleIds = (user.userRoles ?? []).map((ur: any) => ur.roleId ?? ur.role?.id)
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    if (isEdit.value) {
      await usersStore.updateUser(route.params.id as string, {
        name: form.value.name,
        email: form.value.email,
      })
    } else {
      if (!form.value.password || form.value.password.length < 8) {
        error.value = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
        loading.value = false
        return
      }
      await usersStore.createUser({
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        roleIds: form.value.roleIds,
      })
    }
    router.push('/users')
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
        {{ isEdit ? 'แก้ไขผู้ใช้งาน' : 'สร้างผู้ใช้ใหม่' }}
      </h1>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <BaseInput v-model="form.name" label="ชื่อ" placeholder="ชื่อ-นามสกุล" required />

      <BaseInput v-model="form.email" label="อีเมล" type="email" placeholder="user@example.com" required />

      <BaseInput
        v-if="!isEdit"
        v-model="form.password"
        label="รหัสผ่าน"
        type="password"
        placeholder="อย่างน้อย 8 ตัวอักษร"
        required
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Roles</label>
        <div class="space-y-2">
          <label
            v-for="role in rolesStore.roles"
            :key="role.id"
            class="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="role.id"
              v-model="form.roleIds"
              class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">{{ role.name }}</span>
            <span v-if="role.description" class="text-xs text-gray-400">— {{ role.description }}</span>
          </label>
        </div>
      </div>

      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {{ error }}
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
        <BaseButton :loading="loading" type="submit">
          {{ isEdit ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้' }}
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/users')">ยกเลิก</BaseButton>
      </div>
    </form>
  </div>
</template>
