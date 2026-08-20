export type ToastSeverity = 'success' | 'info' | 'warn' | 'error'

interface ToastOptions {
  description?: string
  duration?: number
}

// Simple toast implementation using DOM
function showToast(severity: ToastSeverity, message: string, _options?: ToastOptions) {
  const colors: Record<ToastSeverity, string> = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warn: 'bg-amber-500',
    error: 'bg-red-500',
  }

  const icons: Record<ToastSeverity, string> = {
    success: '✓',
    info: 'ℹ',
    warn: '⚠',
    error: '✕',
  }

  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div')
    el.id = 'toast-container'
    el.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2'
    document.body.appendChild(el)
    return el
  })()

  const toast = document.createElement('div')
  toast.className = `${colors[severity]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px] transform transition-all duration-300 translate-x-full opacity-0`
  toast.innerHTML = `
    <span class="text-lg">${icons[severity]}</span>
    <span class="text-sm font-medium">${message}</span>
  `

  container.appendChild(toast)

  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full', 'opacity-0')
  })

  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0')
    setTimeout(() => toast.remove(), 300)
  }, _options?.duration ?? 3000)
}

export function useAppToast() {
  return {
    show: showToast,
    success: (message: string, options?: ToastOptions) => showToast('success', message, options),
    error: (message: string, options?: ToastOptions) => showToast('error', message, options),
    warn: (message: string, options?: ToastOptions) => showToast('warn', message, options),
    info: (message: string, options?: ToastOptions) => showToast('info', message, options),
  }
}
