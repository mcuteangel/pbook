// src/utils/backupRestore.js

import { db } from '../db'; // نمونه دیتابیس Dexie مون رو وارد می‌کنیم

// تابع برای خروجی گرفتن (Export) از کل داده‌ها
export async function exportData() {
  try {
    console.log('Preparing data for export...');

    // 1. تمام داده‌ها رو از استورهای مختلف IndexedDB می‌خونیم
    // از متد toArray() در Dexie برای گرفتن همه آیتم‌ها استفاده می‌کنیم
    const contacts = await db.contacts.toArray();
    const customFieldDefinitions = await db.customFieldDefinitions.toArray();
    const groups = await db.groups.toArray();

    console.log(`Workspaceed ${contacts.length} contacts, ${customFieldDefinitions.length} custom fields, ${groups.length} groups.`);

    // 2. داده‌ها رو توی یه ساختار منظم برای Export قرار میدیم
    // یه ورژن و timestamp هم اضافه می‌کنیم که بعداً موقع Import کمکمون کنه
    const exportFormat = {
      version: 1, // ورژن فرمت Export (مفید برای تغییرات آینده)
      timestamp: new Date().toISOString(), // زمان دقیق Export به فرمت استاندارد ISO 8601
      data: {
        contacts: contacts,
        customFieldDefinitions: customFieldDefinitions,
        groups: groups,
      },
    };

    // 3. ساختار داده رو تبدیل به رشته JSON می‌کنیم
    // null, 2 باعث میشه JSON با تورفتگی و خوانا باشه (Pretty Print)
    const jsonData = JSON.stringify(exportFormat, null, 2);

    console.log('Data successfully prepared as JSON string.');

    // 4. رشته JSON آماده شده رو برمی‌گردونیم
    return jsonData;

  } catch (error) {
    // در صورت بروز خطا، لاگ می‌گیریم و خطا رو دوباره پرتاب می‌کنیم
    console.error('Error during data export preparation:', error);
    throw new Error('Failed to prepare data for export.');
  }
}
export async function importData(data) {
    console.log('Starting data import into database...');
    // console.log('Data received:', data); // می‌تونی برای دیباگ داده‌ها رو اینجا لاگ کنی

    // **استراتژی فعلی: پاک کردن داده‌های موجود و سپس اضافه کردن داده‌های جدید**
    // این روش ساده‌ترین راه برای Import هست و داده‌های قبلی رو پاک می‌کنه!

    try {
        // **شروع یک Transaction جدید در Dexie**
        // 'rw': Read/Write (خواندن و نوشتن)
        // db.contacts, db.customFieldDefinitions, db.groups: استورهایی که در این تراکنش استفاده میشن
        await db.transaction('rw', db.contacts, db.customFieldDefinitions, db.groups, async () => {
            console.log('Clearing existing data...');
            // **1. پاک کردن تمام داده‌های موجود از استورهای مرتبط**
            await db.contacts.clear();
            await db.customFieldDefinitions.clear();
            await db.groups.clear();
            console.log('Existing data cleared.');

            console.log('Adding imported data...');
            // **2. اضافه کردن داده‌های Imported به دیتابیس**
            // از bulkPut استفاده می‌کنیم که برای اضافه کردن چندین آیتم بهینه هست.
            // bulkPut آیتم‌ها رو اضافه یا جایگزین می‌کنه (بر اساس کلید اصلی).
            // چون قبلش clear کردیم، اینجا عملاً مثل bulkAdd عمل می‌کنه اما ایمن‌تره.

            // قبل از bulkPut، بهتره پراپرتی‌های داخلی Dexie مثل $$md رو از آیتم‌ها پاک کنیم
            // این پراپرتی‌ها موقع Export اضافه میشن و موقع Import ممکنه مشکل ایجاد کنن.
            const cleanedContacts = data.contacts.map(contact => {
                const { $$md, ...rest } = contact; // $$md رو جدا می‌کنیم و بقیه رو نگه می‌داریم
                return rest;
            });
             const cleanedCustomFields = data.customFieldDefinitions.map(field => {
                const { $$md, ...rest } = field;
                return rest;
            });
             const cleanedGroups = data.groups.map(group => {
                const { $$md, ...rest } = group;
                return rest;
            });


            if (cleanedContacts.length > 0) {
               await db.contacts.bulkPut(cleanedContacts);
               console.log(`Successfully imported ${cleanedContacts.length} contacts.`);
            } else {
                console.log('No contacts data to import.');
            }

            if (cleanedCustomFields.length > 0) {
               await db.customFieldDefinitions.bulkPut(cleanedCustomFields);
               console.log(`Successfully imported ${cleanedCustomFields.length} custom field definitions.`);
            } else {
                 console.log('No custom field definitions data to import.');
            }

             if (cleanedGroups.length > 0) {
               await db.groups.bulkPut(cleanedGroups);
               console.log(`Successfully imported ${cleanedGroups.length} groups.`);
            } else {
                 console.log('No groups data to import.');
            }

            console.log('Data import into database transaction completed.');
        });

         // **نکته مهم:** Transaction اینجا تموم میشه. اگر خطایی توی Transaction رخ بده، خود Dexie تغییرات رو برمی‌گردونه.
         // **اما:** بعد از اتمام موفقیت آمیز Transaction، باید استورهای Pinia رو رفرش کنیم
         // تا کامپوننت‌هایی که از اون‌ها استفاده می‌کنن، داده‌های جدید رو نمایش بدن.
         // این کار رو معمولاً از کامپوننت SettingsView بعد از صدا زدن importData انجام میدیم
         // مثلاً: useContactStore().loadContacts(); useGroupStore().loadGroups(); useCustomFieldStore().loadFieldDefinitions();

    } catch (error) {
        console.error('Error during database import transaction:', error);
        // اگر Transaction با خطا مواجه شود، تغییرات خودکار برگشت داده می‌شوند.
        // خطا را دوباره پرتاب می‌کنیم تا در SettingsView هم مدیریت بشه
        throw new Error('Failed to import data into database.');
    }
}