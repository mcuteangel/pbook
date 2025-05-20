<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">دفترچه مخاطبین هوشمند</h1>
        <el-button 
          v-if="showInstallButton" 
          @click="handleInstallClick" 
          type="primary" 
          icon="Download" 
          round
          title="نصب اپلیکیشن"
          class="install-button"
        >
          نصب
        </el-button>
      </div>
      <nav class="app-nav-desktop">
        <RouterLink :to="{ name: 'contact-list' }" active-class="active-link" class="nav-item">
          <el-icon><User /></el-icon>
          <span>مخاطبین</span>
        </RouterLink>
        <RouterLink :to="{ name: 'add-contact' }" active-class="active-link" class="nav-item">
          <el-icon><CirclePlus /></el-icon>
          <span>افزودن</span>
        </RouterLink>
        <RouterLink :to="{ name: 'group-manager' }" active-class="active-link" class="nav-item">
          <el-icon><Grid /></el-icon>
          <span>گروه‌ها</span>
        </RouterLink>
        <RouterLink :to="{ name: 'custom-field-manager' }" active-class="active-link" class="nav-item">
          <el-icon><List /></el-icon>
          <span>فیلدها</span>
        </RouterLink>
        <RouterLink :to="{ name: 'settings' }" active-class="active-link" class="nav-item">
          <el-icon><Setting /></el-icon>
          <span>تنظیمات</span>
        </RouterLink>
      </nav>
    </header>

    <main class="app-main">
      <RouterView></RouterView>
    </main>

    <nav class="app-nav-mobile">
      <RouterLink :to="{ name: 'contact-list' }" class="mobile-nav-item" active-class="active-mobile-link">
        <el-icon><User /></el-icon>
        <span>مخاطبین</span>
      </RouterLink>
      <RouterLink :to="{ name: 'add-contact' }" class="mobile-nav-item" active-class="active-mobile-link">
        <el-icon><CirclePlus /></el-icon>
        <span>افزودن</span>
      </RouterLink>
      <RouterLink :to="{ name: 'group-manager' }" class="mobile-nav-item" active-class="active-mobile-link">
        <el-icon><Grid /></el-icon>
        <span>گروه‌ها</span>
      </RouterLink>
      <RouterLink :to="{ name: 'custom-field-manager' }" class="mobile-nav-item" active-class="active-mobile-link">
        <el-icon><List /></el-icon>
        <span>فیلدها</span>
      </RouterLink>
      <RouterLink :to="{ name: 'settings' }" class="mobile-nav-item" active-class="active-mobile-link">
        <el-icon><Setting /></el-icon>
        <span>تنظیمات</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useContactStore } from '@/store/contacts';
import { useGroupStore } from '@/store/groups';
import { useCustomFieldStore } from '@/store/customFields';
import { User, CirclePlus, Grid, List, Setting, Download } from '@element-plus/icons-vue'; // ایمپورت آیکون‌ها

// --- شروع منطق پرامپت نصب ---
const deferredPrompt = ref(null);
const showInstallButton = ref(false);

const beforeInstallPromptHandler = (e) => {
  e.preventDefault();
  deferredPrompt.value = e;
  showInstallButton.value = true;
  console.log('beforeinstallprompt event fired, install button shown.');
};

const handleInstallClick = async () => {
  if (!deferredPrompt.value) {
    console.log('No deferredPrompt available.');
    return;
  }
  deferredPrompt.value.prompt();
  console.log('Install prompt shown to user.');

  const { outcome } = await deferredPrompt.value.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);

  deferredPrompt.value = null;
  showInstallButton.value = false;

  if (outcome === 'accepted') {
    console.log('User accepted the A2HS prompt');
  } else {
    console.log('User dismissed the A2HS prompt');
  }
};

// --- پایان منطق پرامپت نصب ---

const contactStore = useContactStore();
const groupStore = useGroupStore();
const customFieldStore = useCustomFieldStore();

onMounted(async () => {
  console.log('App mounted, loading data...');
  await contactStore.loadContacts();
  await groupStore.loadGroups();
  await customFieldStore.loadFieldDefinitions();
  console.log('Loading finished.');

  window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
  console.log('Event listener for beforeinstallprompt added.');
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
  console.log('Event listener for beforeinstallprompt removed.');
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  display: flex; /* در دسکتاپ نمایش داده شود */
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
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
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

.app-main {
  flex-grow: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 20px auto;
  background-color: var(--color-background-content);
  border-radius: 10px;
  box-shadow: 0 4px 15px var(--color-shadow);
  margin-bottom: 80px; /* فضای کافی برای ناوبری پایین صفحه */
}

/* ناوبری موبایل (پایین صفحه) */
.app-nav-mobile {
  display: none; /* در دسکتاپ مخفی شود */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--color-background-header); /* پس‌زمینه مشابه هدر */
  box-shadow: 0 -4px 15px var(--color-shadow-strong); /* سایه به سمت بالا */
  z-index: 1000;
  padding: 10px 0;
  display: flex; /* استفاده از فلکس باکس برای چیدمان آیتم‌ها */
  justify-content: space-around; /* توزیع یکنواخت فضای بین آیتم‌ها */
  align-items: center;
}

.app-nav-mobile .mobile-nav-item {
  display: flex;
  flex-direction: column; /* آیکون بالا، متن پایین */
  align-items: center;
  text-decoration: none;
  color: var(--color-link-header); /* رنگ لینک‌ها */
  font-size: 0.8em; /* فونت کوچک‌تر برای موبایل */
  font-weight: 600;
  padding: 5px;
  transition: color 0.3s ease, background-color 0.3s ease;
  flex-grow: 1; /* هر آیتم فضای مساوی بگیرد */
  text-align: center;
  border-radius: 8px; /* کمی گردتر */
}

.app-nav-mobile .mobile-nav-item .el-icon {
  font-size: 1.5em; /* آیکون‌های بزرگ‌تر برای لمس آسان‌تر */
  margin-bottom: 3px; /* فاصله بین آیکون و متن */
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
    border-bottom: none; /* در موبایل نیازی به خط جداکننده زیر عنوان نیست */
  }

  .app-title {
    font-size: 1.6em;
    text-align: center;
  }

  .install-button {
    width: 100%;
    margin: 0;
  }

  .app-nav-desktop {
    display: none; /* در موبایل مخفی شود */
  }

  .app-nav-mobile {
    display: flex; /* در موبایل نمایش داده شود */
  }

  .app-main {
    padding: 15px;
    margin: 15px 10px 70px 10px; /* کاهش Margin افقی و تنظیم Margin پایین برای ناوبری موبایل */
    border-radius: 8px;
    box-shadow: none; /* حذف سایه در موبایل برای سادگی */
  }
}

/* استایل برای آیکون‌های Element Plus */
.el-icon {
  font-size: 1.2em;
}
</style>