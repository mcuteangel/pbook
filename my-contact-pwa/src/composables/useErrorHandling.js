import { useNotificationStore } from '@/store/notificationStore'

export function useErrorHandling() {
  const notificationStore = useNotificationStore()
  
  const handleAsyncError = async (asyncFn, errorMessage = 'An error occurred') => {
    try {
      return await asyncFn()
    } catch (error) {
      console.error(`${errorMessage}:`, error)
      notificationStore.showError(errorMessage)
      throw error
    }
  }

  return {
    handleAsyncError
  }
}
