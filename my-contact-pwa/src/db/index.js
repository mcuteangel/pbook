import Dexie from 'dexie';

export const db = new Dexie('contactManagerDB');

// تعریف نسخه اول دیتابیس و استورها (همون جدول‌ها) - به‌روزرسانی برای ایندکس شماره‌های اضافی در آرایه اشیاء
db.version(2).stores({
  // '++id' کلید اصلی، 'name, lastName, phone, group' ایندکس میشن
  // '*additionalPhones.number' یعنی داخل آرایه additionalPhones (که حالا آرایه اشیاء میشه)، فیلد number ایندکس میشه
  // '*addresses.city', '*addresses.street' ایندکس فیلدهایی در آرایه آدرس‌ها
  // '*customFields' ایندکس فیلدهای سفارشی
  contacts: '++id, name, lastName, phone, group, birthDate, *additionalPhones.number, *addresses.city, *addresses.street, *customFields',
  groups: '++id, &name'
});
// اگه کاربر از نسخه قبلی دیتابیس استفاده می‌کرده و Schema تغییر کرده،
// اینجا می‌تونیم منطق Migration رو بنویسیم.
// مثلاً اگه در آینده فیلدی رو تغییر دادیم یا اضافه کردیم،
// اینجا به Dexie میگیم چطور داده‌های قدیمی رو به ساختار جدید تبدیل کنه.
// فعلاً فقط شماره نسخه رو بالا می‌بریم و فیلد جدید رو اضافه می‌کنیم
// چون فرض می‌کنیم داده‌های قبلی نیازی به تبدیل پیچیده ندارن یا می‌تونیم دیتابیس رو توی DevTools پاک کنیم.
db.version(1).stores({
  contacts: '++id, name, lastName, phone, group, *additionalPhones.number, *addresses.city, *addresses.street, *customFields',
  groups: '++id, &name'
}).upgrade(transaction => {
  // در این مثال ساده، فقط فیلد birthDate اضافه شده و نیاز به تبدیل داده‌های موجود نیست
  // اگر نیاز بود، می‌تونستیم اینجا داده‌های قدیمی رو تغییر بدیم
  console.log("Database migrated from version 1 to 2. 'birthDate' index added.");
});

db.open().catch(function (e) {
    console.error("Open failed: " + e);
});

console.log('دیتابیس Dexie تعریف شد (نسخه ۲)!');
