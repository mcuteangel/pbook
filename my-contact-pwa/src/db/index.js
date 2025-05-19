// src/db/index.js
import Dexie from 'dexie';

// استفاده از اسم دیتابیسی که خودت داری
export const db = new Dexie('contactManagerDB');

// --- تعریف ورژن های دیتابیس و Schema در هر ورژن ---

// ورژن 2 و منطق Migration از 1 به 2 (اگر وجود داشته)
// من اینجا فقط تعریف ورژن 2 رو گذاشتم بر اساس کدی که دادی
db.version(2).stores({
  // این schema مربوط به ورژن 2 هست، بر اساس کدی که فرستادی
  contacts: '++id, name, lastName, phone, group, *additionalPhones.number, *addresses.city, *addresses.street, *customFields',
  groups: '++id, &name'
  // اگر Migration خاصی از ورژن 1 به 2 داشتی، باید اینجا توی .upgrade() اضافه میشد
}).upgrade(transaction => {
  console.log("Database version 2 schema defined.");
  // مثال: اگر از ورژن 1 به 2 داده‌ای نیاز به تبدیل داشت، اینجا انجام می‌شد
  // transaction.someOldStore.each(item => { ... });
});


// ورژن 3 و منطق Migration از 2 به 3 (بر اساس کدی که فرستادی)
db.version(3).stores({
  // این schema مربوط به ورژن 3 هست
  contacts: '++id, name, lastName, phone, group, createdAt, updatedAt, birthDate, *additionalPhones, *addresses, *customFields', // فیلد birthDate و createdAt/updatedAt اینجا اضافه شده
  groups: '++id, &name',
  customFieldDefinitions: '++id, &label, type, order' // customFieldDefinitions اینجا اضافه شده
}).upgrade(transaction => {
  // منطق Migration از ورژن 2 به 3
  console.log("Database migrating from version 2 to 3. Added customFieldDefinitions store and new indexes/fields to contacts.");
  // اینجا اگر نیاز به تبدیل داده‌ها از schema ورژن 2 به 3 بود، باید انجام می‌شد
  // مثلاً اگه ساختار customFields یا additionalPhones کلاً عوض شده بود.
  // پیامی که خودت توی کنسول داشتی رو اینجا آوردم:
  console.log("Database migrated from version 2 to 3. 'customFields' index added.");
});


// --- ورژن 4: اضافه کردن جدول Settings ---
db.version(4).stores({
  // این schema مربوط به ورژن 4 هست: همون schema ورژن 3 به علاوه جدول settings
  contacts: '++id, name, lastName, phone, group, createdAt, updatedAt, birthDate, *additionalPhones, *addresses, *customFields',
  groups: '++id, &name',
  customFieldDefinitions: '++id, &label, type, order',
  settings: '&id' // <-- جدول جدید تنظیمات
}).upgrade(transaction => {
  // منطق Migration از ورژن 3 به 4: اضافه کردن رکورد تنظیمات پیش‌فرض
  // این تابع upgrade وقتی اجرا میشه که کاربر دیتابیس ورژن 3 داره و برنامه ورژن 4 رو باز می‌کنه
  console.log("Database migrating from version 3 to 4. Adding 'settings' store and default record.");
  transaction.settings.add({
    id: 'appSettings', // یک id ثابت برای پیدا کردن این رکورد
    displayColumns: ['name', 'lastName', 'phone','gender', 'group'] // تنظیمات پیش‌فرض ستون‌های نمایشی
  })
  .then(() => {
    console.log("Default settings record added.");
  })
  .catch('ConstraintError', (e) => {
    // اگر به هر دلیلی رکورد 'appSettings' از قبل وجود داشت (مثلاً در حالت توسعه)
    console.warn("Default settings record 'appSettings' already exists. Skipping addition.", e);
  })
  .catch(e => {
      console.error("Error adding default settings record:", e);
  });
});

// --- باز کردن دیتابیس و هندل کردن خطاها ---
db.open().catch(function (e) {
  console.error("Open failed: " + e);
});

// --- لاگ کردن وضعیت دیتابیس ---
// این پیام نشون میده برنامه برای استفاده از کدوم ورژن دیتابیس تعریف شده
console.log('دیتابیس Dexie تعریف شد (نسخه 4)!');

// Export کردن db
// export default db; // استفاده از export const db طبق کد خودت