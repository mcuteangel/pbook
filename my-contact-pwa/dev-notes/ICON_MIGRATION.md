# ICON MIGRATION

## حذف Element Plus و مهاجرت به Font Awesome

- تمام importها و استفاده‌های Element Plus (ElIcon و ...) از پروژه حذف شد.
- به جای آن، Font Awesome (fontawesome-free) به عنوان کتابخانه اصلی آیکون استفاده می‌شود.
- برای استفاده راحت‌تر و قابلیت تغییر سریع در آینده، یک کامپوننت wrapper با نام `IconWrapper.vue` در مسیر `src/components/icons/` اضافه شد.
- از این پس، به جای استفاده مستقیم از FontAwesomeIcon یا fa-\*، فقط از `<IconWrapper :icon="..." />` استفاده کنید.
- این کار باعث می‌شود در صورت نیاز به تغییر کتابخانه آیکون در آینده، فقط IconWrapper را ویرایش کنید.

## نمونه استفاده

```vue
<IconWrapper icon="fa-solid fa-user" size="2x" color="#888" />
```

## نکات توسعه‌دهنده

- اگر نیاز به آیکون جدید بود، فقط کافیست آن را به Font Awesome اضافه و از طریق IconWrapper استفاده کنید.
- برای آیکون‌های خاص یا سفارشی، می‌توانید منطق IconWrapper را گسترش دهید.
