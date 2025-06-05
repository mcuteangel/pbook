// src/types/custom-moment-augments.d.ts
import 'moment' // این خط برای گسترش ماژول 'moment' ضروری است

declare module 'moment' {
  // تعریف واحدهای زمانی جلالی
  // این واحدها رو به صورت رشته‌ای تعریف می‌کنیم تا در توابع moment قابل استفاده باشن
  type JUnitOfTimeShort =
    | 'jYear'
    | 'jMonth'
    | 'jWeek'
    | 'jDay'
    | 'jHour'
    | 'jMinute'
    | 'jSecond'
    | 'jMillisecond'
  type JUnitOfTimeLong =
    | 'jYears'
    | 'jMonths'
    | 'jWeeks'
    | 'jDays'
    | 'jHours'
    | 'jMinutes'
    | 'jSeconds'
    | 'jMilliseconds'
  type JUnitOfTime = JUnitOfTimeShort | JUnitOfTimeLong

  // گسترش رابط Moment با متدهای جلالی
  interface Moment {
    jDate(): number
    jDate(d: number): Moment

    jMonth(): number
    jMonth(M: number | string): Moment // moment-jalaali رشته را هم برای ماه می‌پذیرد

    jYear(): number
    jYear(y: number): Moment

    jDay(): number // روز هفته جلالی (0 = شنبه, ..., 6 = جمعه)

    jDaysInMonth(): number

    // format از قبل در Moment وجود دارد و با تنظیم locale به 'fa' باید فرمت‌های جلالی را پشتیبانی کند.
    // اما برای اطمینان از کامل بودن، می‌توان آن را نیز صریحاً ذکر کرد، هرچند معمولاً نیازی نیست.
    // format(formatInput?: string): string;

    // گسترش توابع استاندارد برای پذیرش JUnitOfTime
    // OpUnitType و DurationInputArg1 و DurationConstructor از تایپ‌های اصلی moment هستند
    // ما JUnitOfTime را به آنها اضافه می‌کنیم
    add(amount?: DurationInputArg1, unit?: JUnitOfTime | DurationConstructor | OpUnitType): Moment
    subtract(
      amount?: DurationInputArg1,
      unit?: JUnitOfTime | DurationConstructor | OpUnitType,
    ): Moment

    // برای get و set، باید مطمئن شویم که واحدهای جلالی را می‌پذیرند
    // All شامل واحدهای استاندارد مثل 'year', 'month', 'date' و غیره است.
    // ما JUnitOfTime را به آن اضافه می‌کنیم.
    get(unit: All | JUnitOfTimeShort): number // معمولاً get از فرم کوتاه واحدها استفاده می‌کند
    set(unit: All | JUnitOfTimeShort, value: number | string | Moment): Moment // value می‌تواند رشته باشد (برای jMonth)

    startOf(unitOfTime: OpUnitType | JUnitOfTimeShort): Moment
    endOf(unitOfTime: OpUnitType | JUnitOfTimeShort): Moment

    isSame(inp?: MomentInput, granularity?: OpUnitType | JUnitOfTimeShort): boolean
    isBefore(inp?: MomentInput, granularity?: OpUnitType | JUnitOfTimeShort): boolean
    isAfter(inp?: MomentInput, granularity?: OpUnitType | JUnitOfTimeShort): boolean
    // و سایر توابعی که ممکن است واحد زمانی بپذیرند
  }

  // اگر نیاز به گسترش توابع استاتیک moment دارید (مثلاً moment.jDaysInMonth)
  // interface MomentStatic {
  //   jDaysInMonth(year: number, month: number): number;
  //   jIsLeapYear(year: number): boolean;
  //   updateLocale(language: string, localeSpec: Object | null): void; // moment-jalaali این را اضافه می‌کند
  // }
}
