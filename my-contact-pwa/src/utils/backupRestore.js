// src/utils/backupRestore.js

import { db } from '../db'; // نمونه دیتابیس Dexie مون رو وارد می‌کنیم

// تابع برای خروجی گرفتن (Export) از کل داده‌ها
export async function exportData() {
  try {
    console.log('Preparing data for export...');

    const contacts = await db.contacts.toArray();
    const customFieldDefinitions = await db.customFieldDefinitions.toArray();
    const groups = await db.groups.toArray();

    console.log(`Exported ${contacts.length} contacts, ${customFieldDefinitions.length} custom fields, ${groups.length} groups.`);

    const exportFormat = {
      version: 1, // ورژن فرمت Export
      timestamp: new Date().toISOString(), // زمان دقیق Export
      data: {
        contacts: contacts,
        customFieldDefinitions: customFieldDefinitions,
        groups: groups,
      },
    };

    const jsonData = JSON.stringify(exportFormat, null, 2);

    console.log('Data successfully prepared as JSON string.');

    return jsonData;

  } catch (error) {
    console.error('Error during data export preparation:', error);
    throw new Error('Failed to prepare data for export.');
  }
}

// تابع برای وارد کردن (Import) داده‌ها
export async function importData(data) {
    console.log('Starting data import into database...');

    // استراتژی جدید: پاک کردن، وارد کردن تعریف فیلدهای سفارشی یکی یکی و ساخت نقشه ID،
    // به‌روزرسانی ID فیلدهای سفارشی در مخاطبین، وارد کردن مخاطبین و گروه‌ها در یک تراکنش.

    try {
        // **شروع یک Transaction جدید در Dexie**
        await db.transaction('rw', db.contacts, db.customFieldDefinitions, db.groups, async (tx) => {
            console.log('Clearing existing data...');
            await Promise.all([
                db.contacts.clear(),
                db.customFieldDefinitions.clear(),
                db.groups.clear()
            ]);
            console.log('Existing data cleared.');

            console.log('Adding imported data...');

            const cleanedContacts = data.contacts.map(item => { const { $$md, ...rest } = item; return rest; });
            const cleanedCustomFieldDefinitions = data.customFieldDefinitions.map(item => { const { $$md, ...rest } = item; return rest; });
            const cleanedGroups = data.groups.map(item => { const { $$md, ...rest } = item; return rest; });


            // ** گام حیاتی: وارد کردن تعریف فیلدهای سفارشی یکی یکی و ساخت نقشه IDهای قدیمی به جدید **
            const oldToNewCustomFieldIdMap = new Map(); // نقشه برای نگهداری { originalId -> newId }

            if (cleanedCustomFieldDefinitions.length > 0) {
               console.log(`Adding ${cleanedCustomFieldDefinitions.length} custom field definitions one by one to get new IDs...`);
               // حلقه‌ای برای اضافه کردن هر تعریف فیلد سفارشی به صورت جداگانه
               for (const originalDef of cleanedCustomFieldDefinitions) {
                   const originalId = originalDef.id; // ID اصلی از داده Export شده

                   // یک کپی از شیء تعریف می‌سازیم و پراپرتی 'id' رو ازش حذف می‌کنیم
                   // اینجوری Dexie خودش یه ID جدید تولید می‌کنه.
                   const defToAdd = { ...originalDef };
                   delete defToAdd.id; // حذف ID اصلی قبل از اضافه کردن

                   try {
                       // تعریف فیلد رو اضافه می‌کنیم و ID جدید تولید شده رو می‌گیریم
                       const newId = await db.customFieldDefinitions.add(defToAdd);

                       // ID اصلی و جدید رو در نقشه ذخیره می‌کنیم
                       if (originalId !== undefined && newId !== undefined) {
                           oldToNewCustomFieldIdMap.set(originalId, newId);
                       } else {
                           // اگر مشکلی در گرفتن IDها بود، لاگ می‌کنیم
                           console.warn(`Could not map original custom field ID:`, originalDef, `Generated new ID:`, newId);
                       }
                   } catch (addError) {
                       // اگر در اضافه کردن یک تعریف فیلد سفارشی خطایی رخ داد
                       console.error(`Error adding custom field definition with original ID ${originalId}:`, originalDef, addError);
                       // در اینجا می‌تونیم تصمیم بگیریم که آیا Import رو متوقف کنیم یا با هشدار ادامه بدیم.
                       // فعلاً با لاگ خطا ادامه میدیم، مشکل در نگاشت IDها در گام بعدی لاگ میشه.
                   }
               }
               console.log('Finished adding custom field definitions. Created mapping:', oldToNewCustomFieldIdMap);

            } else {
                 console.log('No custom field definitions data to import.');
            }


            // ** گام بعدی: به‌روزرسانی ID فیلدهای سفارشی در مخاطبین با استفاده از نقشه **
            const modifiedContacts = cleanedContacts.map(contact => {
                // اگر مخاطب فیلدهای سفارشی داشت و customFields یک آرایه بود
                if (contact.customFields && Array.isArray(contact.customFields)) {
                    // از filter().map() برای ساخت یک آرایه جدید استفاده می‌کنیم، و ورودی‌های بی‌نقشه رو حذف می‌کنیم
                    contact.customFields = contact.customFields
                        .map(cf => {
                           // اگر ID اصلی فیلد سفارشی در نقشه ما وجود داشت
                           if (oldToNewCustomFieldIdMap.has(cf.fieldId)) {
                               // یک شیء جدید با fieldId به‌روز شده برمی‌گردونیم
                               return { fieldId: oldToNewCustomFieldIdMap.get(cf.fieldId), value: cf.value };
                           } else {
                               // اگر ID اصلی در نقشه نبود، یعنی تعریفش Import نشده یا مشکل داشته
                               console.warn(`Contact ${contact.id} refers to custom field ID ${cf.fieldId}, but this ID was not found in the imported definitions map. This custom field will be skipped during import.`);
                               // null برمی‌گردونیم تا در گام بعدی توسط filter حذف بشه
                               return null;
                           }
                       })
                       // null های برگشتی از map رو حذف می‌کنیم
                       .filter(cf => cf !== null);

                }
                return contact; // برگرداندن آبجکت مخاطب (چه تغییر کرده باشد چه نه)
            });

            // ** گام بعدی: وارد کردن مخاطبین (که حالا IDهای فیلدهای سفارشی‌شان به‌روز شده) **
            if (modifiedContacts.length > 0) {
               await db.contacts.bulkAdd(modifiedContacts); // استفاده از bulkAdd پس از clear کردن
               console.log(`Successfully imported ${modifiedContacts.length} contacts with updated custom field IDs.`);
            } else {
                console.log('No contacts data to import.');
            }

            // ** گام آخر: وارد کردن گروه‌ها **
            if (cleanedGroups.length > 0) {
               await db.groups.bulkAdd(cleanedGroups); // استفاده از bulkAdd
               console.log(`Successfully imported ${cleanedGroups.length} groups.`);
            } else {
                 console.log('No groups data to import.');
            }

            console.log('Data import into database transaction completed.');
            // تراکنش در اینجا به پایان می‌رسد.
        });

         // نکته: بعد از اتمام موفقیت آمیز تراکنش در اینجا، استورهای Pinia باید در SettingsView.vue رفرش شوند.
         // این کار در SettingsView.vue بعد از صدا زدن importData انجام می‌شود و صحیح است.

    } catch (error) {
        console.error('Error during database import transaction:', error);
        throw new Error('Failed to import data into database: ' + error.message);
    }
}