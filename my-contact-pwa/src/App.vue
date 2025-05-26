<template>
  <div id="app">
    <h1 v-if="false">{{ $t('message.welcome') }}</h1>
    <select v-model="$i18n.locale">
      <option value="fa">فارسی</option>
      <option value="en">English</option>
    </select>
    <div class="app-container">
      <div class="app-bg"></div>
      <header class="app-header glass fade-in">
        <div class="header-content">
          <h1 class="app-title">{{ $t('app.title') }}</h1>
          <button
            v-if="showInstallButton"
            @click="handleInstallClick"
            class="install-button glass-btn"
            :title="$t('app.installButtonTitle')"
          >
            <i class="fa-solid fa-download"></i>
            {{ $t('app.installButtonText') }}
          </button>
        </div>
        <nav class="app-nav-desktop">
          <RouterLink :to="{ name: 'contact-list' }" active-class="active-link" class="nav-item">
            <i class="fa-solid fa-user"></i>
            <span>{{ $t('app.nav.contacts') }}</span>
          </RouterLink>
          <RouterLink :to="{ name: 'add-contact' }" active-class="active-link" class="nav-item">
            <i class="fa-solid fa-user-plus"></i>
            <span>{{ $t('app.nav.addContact') }}</span>
          </RouterLink>
          <RouterLink :to="{ name: 'group-manager' }" active-class="active-link" class="nav-item">
            <i class="fa-solid fa-layer-group"></i>
            <span>{{ $t('app.nav.groups') }}</span>
          </RouterLink>
          <RouterLink
            :to="{ name: 'custom-field-manager' }"
            active-class="active-link"
            class="nav-item"
          >
            <i class="fa-solid fa-list"></i>
            <span>{{ $t('app.nav.fields') }}</span>
          </RouterLink>
          <RouterLink :to="{ name: 'settings' }" active-class="active-link" class="nav-item">
            <i class="fa-solid fa-gear"></i>
            <span>{{ $t('app.nav.settings') }}</span>
          </RouterLink>
        </nav>
      </header>

      <main class="app-main glass fade-in">
        <RouterView></RouterView>
      </main>

      <nav class="app-nav-mobile glass fade-in">
        <RouterLink
          :to="{ name: 'contact-list' }"
          class="mobile-nav-item"
          active-class="active-mobile-link"
        >
          <i class="fa-solid fa-user"></i>
          <span>{{ $t('app.nav.contacts') }}</span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'add-contact' }"
          class="mobile-nav-item"
          active-class="active-mobile-link"
        >
          <i class="fa-solid fa-user-plus"></i>
          <span>{{ $t('app.nav.addContact') }}</span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'group-manager' }"
          class="mobile-nav-item"
          active-class="active-mobile-link"
        >
          <i class="fa-solid fa-layer-group"></i>
          <span>{{ $t('app.nav.groups') }}</span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'custom-field-manager' }"
          class="mobile-nav-item"
          active-class="active-mobile-link"
        >
          <i class="fa-solid fa-list"></i>
          <span>{{ $t('app.nav.fields') }}</span>
        </RouterLink>
        <RouterLink
          :to="{ name: 'settings' }"
          class="mobile-nav-item"
          active-class="active-mobile-link"
        >
          <i class="fa-solid fa-gear"></i>
          <span>{{ $t('app.nav.settings') }}</span>
        </RouterLink>
      </nav>
      <Notification />
    </div>
  </div>
</template>

<script setup>
import Notification from '@/components/shared/Notification.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useContactStore } from '@/store/contacts'
import { useGroupStore } from '@/store/groups'
import { useCustomFieldStore } from '@/store/customFields'
import './assets/styles/glassmorphism.css'
import './assets/styles/theme.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const deferredPrompt = ref(null)
const showInstallButton = ref(false)

const beforeInstallPromptHandler = (e) => {
  e.preventDefault()
  deferredPrompt.value = e
  showInstallButton.value = true
  console.log('beforeinstallprompt event fired, install button shown.')
}

const handleInstallClick = async () => {
  if (!deferredPrompt.value) {
    console.log('No deferredPrompt available.')
    return
  }
  deferredPrompt.value.prompt()
  console.log('Install prompt shown to user.')

  const { outcome } = await deferredPrompt.value.userChoice
  console.log(`User response to the install prompt: ${outcome}`)

  deferredPrompt.value = null
  showInstallButton.value = false

  if (outcome === 'accepted') {
    console.log('User accepted the A2HS prompt')
  } else {
    console.log('User dismissed the A2HS prompt')
  }
}

const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore()

onMounted(async () => {
  console.log('App mounted, loading data...')
  await contactStore.loadContacts()
  await groupStore.loadGroups()
  await customFieldStore.loadFieldDefinitions()
  console.log('Loading finished.')

  window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler)
  console.log('Event listener for beforeinstallprompt added.')
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler)
  console.log('Event listener for beforeinstallprompt removed.')
})
</script>

<style scoped>
@import './assets/styles/custom-fields.css';
@import './assets/styles/group-manager.css';
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: var(--glass-bg, rgba(255, 255, 255, 0.18));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: glass-bg-animation 10s infinite alternate;
}

@keyframes glass-bg-animation {
  from {
    transform: scale(1);
    opacity: 0.8;
  }
  to {
    transform: scale(1.1);
    opacity: 1;
  }
}

.app-header {
  background: var(--color-background-header);
  padding: 15px 30px;
  box-shadow: 0 4px 15px var(--color-shadow-strong);
  color: var(--color-text-header);
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.app-header.glass {
  background: none !important;
  box-shadow: none !important;
  /* افکت گلس سراسری */
  /* سایر ویژگی‌های glass از glassmorphism.css اعمال می‌شود */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-header);
}

.app-title {
  margin: 0;
  font-size: 2.2em;
  font-weight: 800;
  color: var(--color-text-header-title);
  letter-spacing: -0.5px;
  text-shadow: 1px 1px 2px var(--color-shadow-light);
}

.install-button {
  flex-shrink: 0;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 20px;
}

/* ناوبری دسکتاپ */
.app-nav-desktop {
  display: flex; /* پیش فرض: نمایش افقی برای دسکتاپ */
  flex-wrap: wrap;
  justify-content: center;
  gap: 25px;
  width: 100%;
  max-width: 1000px;
}

.app-nav-desktop .nav-item {
  color: var(--color-link-header);
  text-decoration: none;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05em;
}

.app-nav-desktop .nav-item:hover {
  background-color: var(--color-link-hover-header);
  color: var(--color-link-hover-text-header);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--color-shadow-light);
}

.app-nav-desktop .nav-item.active-link {
  background-color: var(--color-link-active-header);
  color: var(--color-link-active-text-header);
  font-weight: bold;
  box-shadow: 0 2px 6px var(--color-shadow-medium);
}

/* حذف پس‌زمینه و box-shadow پیش‌فرض برای اعمال بهتر گلس‌مورفیسم */
.app-main {
  flex-grow: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  background: none !important;
  box-shadow: none !important;
  border-radius: 10px;
  margin-bottom: 20px; /* برای دسکتاپ کمترش کردم */
}

/* اعمال افکت گلس‌مورفیسم با اولویت بالا */
.app-main.glass {
  background: var(--glass-bg, rgba(255, 255, 255, 0.18));
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  transition:
    box-shadow 0.3s,
    background 0.3s;
}

/* میکرواینترکشن: هاور روی گلس */
.app-main.glass:hover {
  box-shadow: 0 12px 32px 0 rgba(31, 38, 135, 0.28);
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.24));
}

/* ناوبری موبایل (پایین صفحه) */
.app-nav-mobile {
  display: none; /* پیش فرض: در دسکتاپ مخفی شود */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--color-background-header);
  box-shadow: 0 -4px 15px var(--color-shadow-strong);
  z-index: 1000;
  padding: 10px 0;
  justify-content: space-around;
  align-items: center;
}

.app-nav-mobile.glass {
  background: none !important;
  box-shadow: none !important;
  /* افکت گلس سراسری */
}

.app-nav-mobile .mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--color-link-header);
  font-size: 0.8em;
  font-weight: 600;
  padding: 5px;
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
  flex-grow: 1;
  text-align: center;
  border-radius: 8px;
}

.app-nav-mobile .mobile-nav-item .fa-solid {
  font-size: 1.5em;
  margin-bottom: 3px;
}

.app-nav-mobile .mobile-nav-item:hover {
  background-color: var(--color-link-hover-header);
  color: var(--color-link-hover-text-header);
}

.app-nav-mobile .mobile-nav-item.active-mobile-link {
  color: var(--color-link-active-text-header);
  background-color: var(--color-link-active-header);
}

/* واکنش‌گرایی: تغییر نمایش بر اساس عرض صفحه */
@media (max-width: 768px) {
  .app-header {
    padding: 10px 15px;
    gap: 10px;
  }

  .header-content {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding-bottom: 5px;
    border-bottom: none;
  }

  .app-title {
    font-size: 1.6em;
    text-align: center;
  }

  .install-button {
    width: 100%;
    margin: 0;
  }

  /* در موبایل، ناوبری دسکتاپ را مخفی کن */
  .app-nav-desktop {
    display: none;
  }

  /* در موبایل، ناوبری موبایل (پایین صفحه) را نمایش بده */
  .app-nav-mobile {
    display: flex; /* این خط را به flex تغییر دادم */
  }

  .app-main {
    padding: 15px;
    margin: 15px 10px; /* Margin افقی */
    margin-bottom: 70px; /* 👈 این خط رو تغییر بده / اضافه کن برای فضای پایین */
    border-radius: 8px;
    box-shadow: none;
  }
}

/* fade-in animation for glass sections */
.fade-in {
  animation: glass-fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes glass-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* استایل برای آیکون‌های Font Awesome */
.fa-solid {
  font-size: 1.2em;
}
</style>
