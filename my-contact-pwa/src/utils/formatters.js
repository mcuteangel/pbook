// src/utils/formatters.js
import moment from 'moment-jalaali';

export const formatShamsiDate = (gregorianDateString, includeTime = false) => {
  if (!gregorianDateString) return '';
  try {
    const momentObj = moment(gregorianDateString);
    if (momentObj.isValid()) {
      return includeTime ? momentObj.format('jYYYY/jMM/jDD HH:mm:ss') : momentObj.format('jYYYY/jMM/jDD');
    } else {
      // console.error('Moment-Jalaali could not parse Gregorian date string in formatter:', gregorianDateString);
      return 'تاریخ نامعتبر';
    }
  } catch (e) {
    // console.error('Error in formatShamsiDate (formatter):', e);
    return 'خطا در نمایش تاریخ';
  }
};

export const displayGender = (genderValue) => {
  switch (genderValue) {
    case 'male':
      return 'آقا';
    case 'female':
      return 'خانم';
    case 'other':
      return 'غیره';
    case 'not_specified': // این رو هم اضافه کنیم که توی فرم داشتیم
      return 'ترجیح می‌دهم نگویم';
    default:
      return genderValue || 'نامشخص'; // اگر مقداری بود و مپ نشده بود، خودش رو برگردونه
  }
};

export const displayPhoneType = (typeValue) => {
  switch (typeValue) {
    case 'mobile':
      return 'موبایل';
    case 'home':
      return 'منزل';
    case 'work':
      return 'محل کار';
    case 'office':
      return 'مطب/دفتر';
    case 'fax':
      return 'فکس';
    case 'other':
      return 'دیگر';
    default:
      return typeValue || 'نامشخص';
  }
};

export const displayAddressType = (typeValue) => {
  switch (typeValue) {
    case 'home':
      return 'منزل';
    case 'work':
      return 'محل کار';
    case 'other':
      return 'دیگر';
    default:
      return typeValue || 'نامشخص';
  }
};