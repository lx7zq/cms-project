<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
        disabled && 'bg-gray-50 text-gray-500',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="mt-1 text-xs text-red-500">{{ error }}</p>
  </div>
</template>
