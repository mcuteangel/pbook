<template>
  <div>
    <header class="app-header">
      <h1>برنامه مدیریت مخاطبین</h1>
      <nav>
        <RouterLink :to="{ name: 'contact-list' }" active-class="active-link">
          لیست مخاطبین
        </RouterLink>
        <RouterLink :to="{ name: 'group-manager' }" active-class="active-link">
          مدیریت گروه‌ها
        </RouterLink>
        <RouterLink :to="{ name: 'add-contact' }" active-class="active-link">
          افزودن مخاطب جدید
        </RouterLink>
        <RouterLink :to="{ name: 'custom-field-manager' }" active-class="active-link">
          مدیریت فیلدهای سفارشی
        </RouterLink>
        <RouterLink :to="{ name: 'settings' }" active-class="active-link">
          تنظیمات
        </RouterLink>
      </nav>
      <!-- دکمه نصب اپلیکیشن -->
      <el-button 
        v-if="showInstallButton" 
        @click="handleInstallClick" 
        type="success" 
        icon="Download" 
        circle
        title="نصب اپلیکیشن"
        class="install-button"
      />
    </header>

    <hr />

    <RouterView></RouterView>
  </div>
</template>

<script setup>
// از onMounted و ref و onUnmounted استفاده می‌کنیم
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router' // مطمئن شو RouterLink و RouterView ایمپورت شدند
import { useContactStore } from '@/store/contacts'
import { useGroupStore } from '@/store/groups'
import { useCustomFieldStore } from '@/store/customFields';

// --- شروع منطق پرامپت نصب ---
const deferredPrompt = ref(null);
const showInstallButton = ref(false);

const beforeInstallPromptHandler = (e) => {
  // جلوگیری از نمایش پرامپت پیش‌فرض مرورگر
  e.preventDefault();
  // ذخیره رویداد برای استفاده بعدی
  deferredPrompt.value = e;
  // نمایش دکمه نصب سفارشی ما
  showInstallButton.value = true;
  console.log('beforeinstallprompt event fired, install button shown.');
};

const handleInstallClick = async () => {
  if (!deferredPrompt.value) {
    console.log('No deferredPrompt available.');
    return;
  }
  // نمایش پرامپت نصب مرورگر
  deferredPrompt.value.prompt();
  console.log('Install prompt shown to user.');

  // منتظر پاسخ کاربر می‌مانیم
  const { outcome } = await deferredPrompt.value.userChoice;
  console.log(`User response to the install prompt: ${outcome}`);

  // رویداد فقط یکبار قابل استفاده است
  deferredPrompt.value = null;
  // مخفی کردن دکمه نصب ما
  showInstallButton.value = false;

  if (outcome === 'accepted') {
    console.log('User accepted the A2HS prompt');
    // اینجا می‌تونی کاری انجام بدی اگه کاربر نصب رو پذیرفت
    // مثلا یه پیام تشکر نشون بدی یا یه رویداد ثبت کنی
  } else {
    console.log('User dismissed the A2HS prompt');
  }
};

// --- پایان منطق پرامپت نصب ---

const contactStore = useContactStore()
const groupStore = useGroupStore()
const customFieldStore = useCustomFieldStore();

onMounted(async () => {
  console.log('App mounted, loading data...');
  await contactStore.loadContacts();
  await groupStore.loadGroups();
  await customFieldStore.loadFieldDefinitions();
  console.log('Loading finished.');

  // اضافه کردن event listener برای beforeinstallprompt
  window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
  console.log('Event listener for beforeinstallprompt added.');
});

onUnmounted(() => {
  // پاک کردن event listener وقتی کامپوننت از بین میره
  window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
  console.log('Event listener for beforeinstallprompt removed.');
});
</script>

<style scoped>
/* استایل‌های قبلی ... */
.app-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e7e7e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px; 
}

.app-header h1 {
  margin: 0;
  font-size: 1.6em;
  color: #333;
}

.app-header nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  padding: 0;
  margin: 0;
}

.app-header nav a {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
  padding-bottom: 3px;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-bottom-color 0.2s ease;
}

.app-header nav a:hover {
  color: #0056b3;
  border-bottom-color: #0056b3;
}

.app-header nav a.active-link {
  color: #0056b3;
  border-bottom-color: #007bff;
}

/* استایل برای دکمه نصب */
.install-button {
  /* می‌تونی اینجا استایل‌های خاصی برای دکمه نصب بدی اگه لازم شد */
  /* مثلاً کمی margin اگه به nav چسبیده باشه */
  margin-left: 15px; /* مثال */
}

hr {
  margin: 0;
  border: none;
  border-top: 1px solid #e7e7e7;
}

/* کامنت: .app-main رو اینجا نمی‌بینم استفاده شده باشه، اگه جای دیگه‌ای هست که نیازه، بگو */
</style>