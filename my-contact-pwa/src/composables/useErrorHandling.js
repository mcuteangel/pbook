import { useNotification } from '@/services/notification.service'

export function useErrorHandling() {
  const notificationService = useNotification()

  const handleError = (error, errorMessage) => {
    console.error(error)
    notificationService.showError(errorMessage)
  }

  return {
    handleError,
  }
}
