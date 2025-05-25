<template>
  <div class="notification-container">
    <transition-group name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification"
        :class="`notification-${notification.type}`"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.type)"></i>
        </div>
        <div class="notification-content">
          <div class="notification-header">
            <span class="notification-title">{{ getNotificationTitle(notification.type) }}</span>
            <button class="notification-close" @click.stop="removeNotification(notification.id)">
              &times;
            </button>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotificationStore } from '@/store/notificationStore'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { getNotificationIcon } from '@/utils/icons'

const { t } = useI18n()
const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const { removeNotification } = notificationStore

// Get notification title based on type
const getNotificationTitle = (type) => {
  const titles = {
    success: t('notification.success'),
    error: t('notification.error'),
    warning: t('notification.warning'),
    info: t('notification.info')
  }
  return titles[type] || type
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 380px;
  width: 90%;
  direction: rtl;
}

.notification {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  border-right: 4px solid;
}

.notification-icon {
  margin-left: 12px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notification-title {
  font-weight: bold;
  font-size: 1rem;
}

.notification-message {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
}

.notification:hover {
  transform: translateX(-5px);
}

.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-message {
  flex: 1;
  margin-right: 10px;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 2px 6px;
  opacity: 0.7;
  transition: all 0.2s;
  border-radius: 50%;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -6px;
}

.notification-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

/* Notification Types */
.notification-info {
  background: rgba(41, 128, 185, 0.95);
  border-right-color: #2980b9;
}

.notification-success {
  background: rgba(39, 174, 96, 0.95);
  border-right-color: #27ae60;
}

.notification-warning {
  background: rgba(241, 196, 15, 0.95);
  border-right-color: #f1c40f;
  color: #333;
}

.notification-warning .notification-close {
  color: #333;
}

.notification-warning .notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.notification-error {
  background: rgba(231, 76, 60, 0.95);
  border-right-color: #e74c3c;
}

/* Animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.notification-leave-active {
  position: absolute;
  width: 100%;
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* RTL Support */
[dir='rtl'] .notification {
  text-align: right;
}

[dir='rtl'] .notification-close {
  margin-right: 0;
  margin-left: -6px;
}

[dir='rtl'] .notification-icon {
  margin-left: 0;
  margin-right: 12px;
}

/* Responsive */
@media (max-width: 480px) {
  .notification-container {
    width: 95%;
    right: 2.5%;
    left: 2.5%;
    max-width: none;
  }
  
  .notification {
    padding: 14px;
  }
}
</style>
