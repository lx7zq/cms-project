import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IRole, IPermission } from '@/models/role.model'
import RolesProvider from '@/resources/providers/roles.provider'

const rolesProvider = new RolesProvider()

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<IRole[]>([])
  const permissions = ref<IPermission[]>([])
  const loading = ref(false)

  async function fetchRoles() {
    loading.value = true
    try {
      const data = await rolesProvider.getAll()
      roles.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchPermissions() {
    const data = await rolesProvider.getPermissions()
    permissions.value = data
  }

  async function getRole(id: string) {
    const data = await rolesProvider.getById(id)
    return data.data ?? data
  }

  async function createRole(payload: { name: string; description?: string; permissionIds: string[] }) {
    await rolesProvider.create(payload)
    await fetchRoles()
  }

  async function updateRole(id: string, payload: { name?: string; description?: string }) {
    await rolesProvider.update(id, payload)
    await fetchRoles()
  }

  async function deleteRole(id: string) {
    await rolesProvider.delete(id)
    await fetchRoles()
  }

  return {
    roles, permissions, loading,
    fetchRoles, fetchPermissions, getRole, createRole, updateRole, deleteRole,
  }
})
