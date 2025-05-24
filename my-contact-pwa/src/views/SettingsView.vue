<template>
  <div class="settings-container glass-container">
    <h1 class="page-title">تنظیمات برنامه</h1>

    <!-- Theme Toggle -->
    <section class="theme-toggle-section settings-section glass-section">
      <h3>تم برنامه</h3>
      <button @click="toggleTheme" class="theme-toggle-button glass-btn">
        <IconWrapper :icon="isDarkMode ? 'fa-solid fa-sun' : 'fa-solid fa-moon'" />
        تغییر به تم {{ isDarkMode ? 'روشن' : 'تاریک' }}
      </button>
      <p>تم فعلی: {{ isDarkMode ? 'تاریک' : 'روشن' }}</p>
    </section>

    <!-- Display Column Settings -->
    <DisplaySettings />

    <!-- Backup and Restore -->
    <BackupRestoreSettings />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSettingsStore } from '@/store/settings'
import IconWrapper from '@/components/icons/IconWrapper.vue'
import DisplaySettings from '@/components/settings/DisplaySettings.vue'
import BackupRestoreSettings from '@/components/settings/BackupRestoreSettings.vue'

const settingsStore = useSettingsStore()

const isDarkMode = computed(() => settingsStore.isDarkMode)

const toggleTheme = () => {
  settingsStore.toggleTheme()
}

// Load settings when the component is mounted
onMounted(async () => {
  // Ensure basic settings like theme are loaded if not already
  if (settingsStore.settings === null || Object.keys(settingsStore.settings).length === 0) {
    await settingsStore.loadSettings()
  }
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 20px auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.settings-container h2,
.settings-container h3 {
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.display-settings-section {
  margin-bottom: 30px;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
}

.display-settings-section h3 {
  margin-top: 0;
  padding-bottom: 5px;
  border-bottom: 1px dashed #ddd;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.checkbox-item {
  margin-right: 0 !important;
  flex-basis: calc(50% - 5px);
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.checkbox-item label {
  flex-grow: 1;
  padding-left: 5px;
}

.loading-message {
  color: #007bff;
  font-style: italic;
  margin-bottom: 15px;
}

/* Button Styles */
.settings-container button {
  background: linear-gradient(120deg, var(--accent-color) 60%, transparent 100%);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.1);
}

.settings-container button:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 4px 16px rgba(var(--accent-color-rgb, 108, 99, 255), 0.18);
}

.settings-container button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reset-button {
  background: linear-gradient(120deg, var(--color-danger) 60%, transparent 100%) !important;
  margin-top: var(--spacing-sm);
}

.reset-button:hover {
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.2) !important;
}

.backup-section,
.restore-section {
  margin-bottom: 30px;
}

.settings-container input[type='file'] {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>
