// Icon definitions for consistent usage across the app
export const ICONS = {
  // Common
  SEARCH: 'fa-solid fa-magnifying-glass',
  CLOSE: 'fa-solid fa-xmark',
  EDIT: 'fa-regular fa-pen-to-square',
  DELETE: 'fa-regular fa-trash-can',
  SAVE: 'fa-regular fa-floppy-disk',
  CANCEL: 'fa-solid fa-ban',
  ADD: 'fa-solid fa-plus',
  REMOVE: 'fa-solid fa-minus',
  
  // Navigation
  MENU: 'fa-solid fa-bars',
  HOME: 'fa-solid fa-house',
  CONTACTS: 'fa-solid fa-address-book',
  GROUPS: 'fa-solid fa-users',
  SETTINGS: 'fa-solid fa-gear',
  
  // Contact specific
  USER: 'fa-regular fa-user',
  USER_EDIT: 'fa-solid fa-user-edit',
  PHONE: 'fa-solid fa-phone',
  ENVELOPE: 'fa-regular fa-envelope',
  CALENDAR: 'fa-regular fa-calendar',
  GENDER: 'fa-solid fa-venus-mars',
  ADDRESS: 'fa-solid fa-location-dot',
  
  // Notifications
  SUCCESS: 'fa-solid fa-circle-check',
  ERROR: 'fa-solid fa-circle-exclamation',
  WARNING: 'fa-solid fa-triangle-exclamation',
  INFO: 'fa-solid fa-circle-info',
  
  // Sort & Filter
  SORT_UP: 'fa-solid fa-arrow-up-a-z',
  SORT_DOWN: 'fa-solid fa-arrow-down-z-a',
  FILTER: 'fa-solid fa-filter',
  SLIDERS: 'fa-solid fa-sliders',
  
  // Actions
  DOWNLOAD: 'fa-solid fa-download',
  UPLOAD: 'fa-solid fa-upload',
  EXPORT: 'fa-solid fa-file-export',
  IMPORT: 'fa-solid fa-file-import',
  REFRESH: 'fa-solid fa-arrows-rotate',
  
  // Status
  CHECK: 'fa-solid fa-check',
  TIMES: 'fa-solid fa-xmark',
  ELLIPSIS: 'fa-solid fa-ellipsis-vertical',
}

// Get icon by key
export const getIcon = (key) => {
  return ICONS[key] || 'fa-solid fa-question'
}

// Get icon class by notification type
export const getNotificationIcon = (type) => {
  const icons = {
    success: ICONS.SUCCESS,
    error: ICONS.ERROR,
    warning: ICONS.WARNING,
    info: ICONS.INFO,
  }
  return icons[type] || ICONS.INFO
}
