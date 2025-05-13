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

// تابع Import رو بعداً اینجا اضافه خواهیم کرد
// export async function importData(jsonData) {
//   // ... منطق Import ...
// }