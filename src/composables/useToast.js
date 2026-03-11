import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
    const addToast = (toast) => {
        const id = toastId++
        toasts.value.push({ ...toast, id })

        if (toast.duration !== 0) {
            setTimeout(() => {
                removeToast(id)
            }, toast.duration || 3000)
        }
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (message, title = 'Success') => {
        addToast({ type: 'success', title, message, duration: 3000 })
    }

    const error = (message, title = 'Error') => {
        addToast({ type: 'error', title, message, duration: 4000 })
    }

    const warning = (message, title = 'Warning') => {
        addToast({ type: 'warning', title, message, duration: 4000 })
    }

    const info = (message, title = 'Info') => {
        addToast({ type: 'info', title, message, duration: 3000 })
    }

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    }
}
