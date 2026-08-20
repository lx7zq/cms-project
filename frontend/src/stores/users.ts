import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { IUser } from '@/models/user.model'
import UsersProvider from '@/resources/providers/users.provider'

const usersProvider = new UsersProvider()

export const useUsersStore = defineStore('users', () => {
  const users = ref<IUser[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const search = ref('')

  async function fetchUsers() {
    loading.value = true
    try {
      const data = await usersProvider.getAll({
        search: search.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      })
      users.value = data.data ?? data
      total.value = data.total ?? users.value.length
    } finally {
      loading.value = false
    }
  }

  async function getUser(id: string) {
    const data = await usersProvider.getById(id)
    return data.data ?? data
  }

  async function createUser(payload: { email: string; password: string; name: string; roleIds: string[] }) {
    await usersProvider.create(payload)
    await fetchUsers()
  }

  async function updateUser(id: string, payload: { name?: string; email?: string }) {
    await usersProvider.update(id, payload)
    await fetchUsers()
  }

  async function toggleActive(id: string, isActive: boolean) {
    await usersProvider.update(id, { isActive })
    await fetchUsers()
  }

  async function deleteUser(id: string) {
    await usersProvider.delete(id)
    await fetchUsers()
  }

  function setPage(p: number) {
    page.value = p
    fetchUsers()
  }

  function setSearch(s: string) {
    search.value = s
    page.value = 1
    fetchUsers()
  }

  return {
    users, total, page, pageSize, loading, search,
    fetchUsers, getUser, createUser, updateUser, toggleActive, deleteUser, setPage, setSearch,
  }
})
