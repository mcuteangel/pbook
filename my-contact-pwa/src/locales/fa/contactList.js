export default {
  title: 'مخاطبین',
  ariaLabel: 'بخش لیست مخاطبین',
  ariaAddSampleContacts: 'افزودن مخاطبین نمونه',
  loadingContacts: 'در حال بارگذاری مخاطبین...',
  noContactsFound: 'مخاطبی یافت نشد.',
  totalContacts: 'تعداد کل مخاطبین: {count}',
  addSampleContacts: 'افزودن مخاطبین نمونه',
  addingSamples: 'در حال افزودن نمونه‌ها...',
  confirmAddSamples:
    'آیا مطمئن هستید که می‌خواهید مخاطبین نمونه اضافه کنید؟ این عمل چند مخاطب نمونه به لیست شما اضافه می‌کند.',
  operationCancelled: 'عملیات لغو شد.',
  samplesAdded: 'مخاطبین نمونه با موفقیت اضافه شدند',
  samplesAddedSuccessfully: 'مخاطبین نمونه با موفقیت اضافه شدند!',
  errorAddingSamples: 'خطا در افزودن مخاطبین نمونه.',
  deleteAllContacts: 'حذف همه مخاطبین',
  confirmDeleteAll: 'آیا از حذف همه مخاطبین مطمئن هستید؟',
  noGroups: 'گروهی در دسترس نیست',
  noContactsInGroup: 'مخاطبی در این گروه وجود ندارد',
  noMatchCriteria: 'سعی کنید معیارهای جستجو یا فیلتر خود را تنظیم کنید.',
  searchLabel: 'جستجو:',
  searchPlaceholder: 'جستجوی مخاطبین...',
  sortByLabel: 'مرتب‌سازی بر اساس:',
  sortOrderLabel: 'ترتیب:',
  sortOrderAsc: 'صعودی',
  sortOrderDesc: 'نزولی',
  editButton: 'ویرایش',
  deleteButton: 'حذف',
  viewContactDetails: 'مشاهده جزئیات {name}',
  fields: {
    name: 'نام',
    lastName: 'نام خانوادگی',
    phone: 'تلفن',
    title: 'عنوان',
    notes: 'یادداشت‌ها',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'آخرین به‌روزرسانی',
    birthDate: 'تاریخ تولد',
    gender: 'جنسیت',
    group: 'گروه',
  },
  // کامنت فارسی: کلیدهای ترجمه برای فیلدهای جدید اضافه شده در ContactList.vue
  contactFields: {
    firstName: 'نام',
    lastName: 'نام خانوادگی',
    email: 'ایمیل',
    phone: 'تلفن',
    company: 'شرکت',
    jobTitle: 'عنوان شغلی',
    birthday: 'تاریخ تولد',
    gender: 'جنسیت',
    notes: 'یادداشت‌ها',
    address: 'آدرس',
    website: 'وب‌سایت',
    relationship: 'نسبت',
    nickname: 'نام مستعار',
    pronouns: 'ضمایر',
    groups: 'گروه‌ها',
    // اضافه کردن فیلدهای جدید
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'آخرین به‌روزرسانی',
  },
  // کامنت فارسی: کلیدهای ترجمه برای گزینه‌های جنسیت
  gender: {
    male: 'مرد',
    female: 'زن',
    other: 'دیگر',
    prefer_not_to_say: 'ترجیح می‌دهم نگویم',
  },
  sortOptions: {
    firstName: 'نام',
    lastName: 'نام خانوادگی',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'آخرین به‌روزرسانی',
    lastContacted: 'آخرین تماس',
  },
  sortBy: {
    firstName: 'نام',
    lastName: 'نام خانوادگی',
    dateAdded: 'تاریخ افزودن',
    lastContacted: 'آخرین تماس',
    email: 'ایمیل',
    phone: 'تلفن',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'تاریخ به‌روزرسانی',
  },
  filterRulesTitle: 'قوانین فیلتر',
  filterOptions: {
    all: 'همه',
    hasPhoneNumber: 'دارای شماره تلفن',
    hasEmail: 'دارای ایمیل',
    hasAddress: 'دارای آدرس',
    hasNotes: 'دارای یادداشت',
    isFavorite: 'مورد علاقه',
    genderMale: 'مرد',
    genderFemale: 'زن',
    genderOther: 'دیگر',
    genderUnknown: 'نامشخص',
  },
  actions: {
    view: 'مشاهده',
    edit: 'ویرایش',
    delete: 'حذف',
    call: 'تماس',
    message: 'پیام',
    email: 'ایمیل',
    share: 'اشتراک‌گذاری',
    addToFavorites: 'افزودن به علاقه‌مندی‌ها',
    removeFromFavorites: 'حذف از علاقه‌مندی‌ها',
  },
  selectFieldPlaceholder: 'انتخاب فیلد...',
  selectOperatorPlaceholder: 'انتخاب عملگر...',
  addRuleButton: 'افزودن قانون جدید',
  activeFilterRules: 'قوانین فیلتر فعال:',
  noRulesMessage: 'هیچ قانون فیلتری اعمال نشده است.',
  noValueNeeded: 'نیاز به مقدار ندارد',
  removeRuleTooltip: 'حذف قانون',
  applyFilterButton: 'اعمال فیلترها',
  clearFilterButton: 'پاک کردن فیلترها',

  // اپراتورها
  operators: {
    contains: 'شامل',
    notContains: 'شامل نیست',
    equals: 'برابر است با',
    notEquals: 'برابر نیست با',
    startsWith: 'شروع می‌شود با',
    endsWith: 'پایان می‌یابد با',
    greaterThan: 'بزرگتر از',
    lessThan: 'کوچکتر از',
    greaterThanOrEqual: 'بزرگتر یا مساوی',
    lessThanOrEqual: 'کوچکتر یا مساوی',
    before: 'قبل از',
    after: 'بعد از',
    isNull: 'خالی است',
    isNotNull: 'خالی نیست',
    onOrBefore: 'در تاریخ یا قبل از',
    onOrAfter: 'در تاریخ یا بعد از',
  },

  // پیام‌های اعتبارسنجی
  validation: {
    required: 'این فیلد اجباری است',
    fieldRequired: 'لطفاً یک فیلد انتخاب کنید',
    operatorRequired: 'لطفاً یک عملگر انتخاب کنید',
    invalidNumber: 'لطفاً یک عدد معتبر وارد کنید',
    invalidDate: 'لطفاً تاریخ معتبر وارد کنید',
  },

  // کلیدهای صفحه‌بندی
  paginationPrev: 'قبلی',
  paginationNext: 'بعدی',
  paginationPageInfo: 'صفحه {currentPage} از {totalPages}',

  // Placeholders for filter inputs
  selectValuePlaceholder: 'مقدار را وارد کنید',
  enterTextPlaceholder: 'متن را وارد کنید',
  enterNumberPlaceholder: 'عدد را وارد کنید',
  selectDatePlaceholder: 'تاریخ را انتخاب کنید',
  selectDateTimePlaceholder: 'تاریخ و زمان را انتخاب کنید',
  selectOptionPlaceholder: 'گزینه را انتخاب کنید',

  // Date Picker
  datePicker: {
    shamsi: 'شمسی',
    gregorian: 'میلادی',
    aria: {
      calendar: 'تقویم',
    },
    weekdays: {
      sh: 'ش',
      ye: 'ی',
      do: 'د',
      se: 'س',
      ch: 'چ',
      pa: 'پ',
      jo: 'ج',
    },
  },
}
