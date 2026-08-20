<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  maxWidth?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits(['close'])

const widths = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50" @click="emit('close')" />
      <div :class="['relative bg-white rounded-xl shadow-xl w-full', widths[maxWidth ?? 'md']]">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <button @click="emit('close')" class="p-1 rounded hover:bg-gray-100">
            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <slot />
        </div>
        <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
