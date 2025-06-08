<template>
  <div class="notification-test">
    <h2 class="mb-4">{{ $t('notification.testPageTitle') }}</h2>
    
    <div class="button-group">
      <button 
        class="btn btn-success me-2 mb-2" 
        @click="showSuccess"
      >
        <i class="fas fa-check-circle me-1"></i>
        {{ $t('notification.showSuccess') }}
      </button>
      
      <button 
        class="btn btn-danger me-2 mb-2" 
        @click="showError"
      >
        <i class="fas fa-exclamation-circle me-1"></i>
        {{ $t('notification.showError') }}
      </button>
      
      <button 
        class="btn btn-warning me-2 mb-2" 
        @click="showWarning"
      >
        <i class="fas fa-exclamation-triangle me-1"></i>
        {{ $t('notification.showWarning') }}
      </button>
      
      <button 
        class="btn btn-info me-2 mb-2" 
        @click="showInfo"
      >
        <i class="fas fa-info-circle me-1"></i>
        {{ $t('notification.showInfo') }}
      </button>
      
      <button 
        class="btn btn-primary me-2 mb-2" 
        @click="showConfirm"
      >
        <i class="fas fa-question-circle me-1"></i>
        {{ $t('notification.showConfirm') }}
      </button>
      
      <button 
        class="btn btn-secondary me-2 mb-2" 
        @click="showAlert"
      >
        <i class="fas fa-bell me-1"></i>
        {{ $t('notification.showAlert') }}
      </button>
    </div>
    
    <div class="result mt-4 p-3 bg-light rounded">
      <h5>{{ $t('notification.lastAction') }}</h5>
      <pre class="mb-0">{{ lastAction ? JSON.stringify(lastAction, null, 2) : $t('notification.noActionYet') }}</pre>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotification } from '@/services/notification.service'

export default {
  name: 'NotificationTest',
  
  setup() {
    const { t } = useI18n()
    const notification = useNotification()
    const lastAction = ref(null)
    
    const logAction = (action, result = null) => {
      lastAction.value = {
        action,
        result,
        timestamp: new Date().toLocaleString()
      }
      console.log(`[NotificationTest] ${action}`, result || '')
    }
    
    const showSuccess = () => {
      notification.success(t('notification.testSuccessMessage'))
      logAction('showSuccess')
    }
    
    const showError = () => {
      notification.error(t('notification.testErrorMessage'))
      logAction('showError')
    }
    
    const showWarning = () => {
      notification.warning(t('notification.testWarningMessage'))
      logAction('showWarning')
    }
    
    const showInfo = () => {
      notification.info(t('notification.testInfoMessage'))
      logAction('showInfo')
    }
    
    const showConfirm = async () => {
      try {
        const confirmed = await notification.confirm(t('notification.testConfirmMessage'))
        logAction('showConfirm', { confirmed })
        
        if (confirmed) {
          notification.success(t('notification.userConfirmed'))
        } else {
          notification.info(t('notification.userCancelled'))
        }
      } catch (error) {
        console.error('Error in confirm dialog:', error)
        notification.error(t('notification.errorInConfirm'))
      }
    }
    
    const showAlert = async () => {
      try {
        await notification.alert(t('notification.testAlertMessage'), t('notification.testAlertTitle'))
        logAction('showAlert')
      } catch (error) {
        console.error('Error in alert dialog:', error)
        notification.error(t('notification.errorInAlert'))
      }
    }
    
    return {
      lastAction,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm,
      showAlert
    }
  }
}
</script>

<style scoped>
.notification-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
  color: white;
}

.btn i {
  margin-right: 6px;
}

.btn-success { background-color: #28a745; }
.btn-danger { background-color: #dc3545; }
.btn-warning { background-color: #ffc107; color: #212529; }
.btn-info { background-color: #17a2b8; }
.btn-primary { background-color: #007bff; }
.btn-secondary { background-color: #6c757d; }

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.result {
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
  font-family: 'Courier New', Courier, monospace;
}

.result pre {
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  font-family: inherit;
}
</style>
