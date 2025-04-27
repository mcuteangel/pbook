import Dexie from 'dexie';

export const db = new Dexie('contactManagerDB');

// تعریف نسخه اول دیتابیس و استورها (همون جدول‌ها) - به‌روزرسانی برای ایندکس شماره‌های اضافی در آرایه اشیاء
db.version(1).stores({
  // '++id' کلید اصلی، 'name, lastName, phone, group' ایندکس میشن
  // '*additionalPhones.number' یعنی داخل آرایه additionalPhones (که حالا آرایه اشیاء میشه)، فیلد number ایندکس میشه
  // '*addresses.city', '*addresses.street' ایندکس فیلدهایی در آرایه آدرس‌ها
  // '*customFields' ایندکس فیلدهای سفارشی
  contacts: '++id, name, lastName, phone, group, *additionalPhones.number, *addresses.city, *addresses.street, *customFields',
  groups: '++id, &name'
});

db.open().catch(function (e) {
    console.error("Open failed: " + e);
});

console.log('دیتابیس Dexie تعریف شد (با ایندکس به‌روز شده برای شماره‌های اضافی)!');