import { Solar, Lunar } from "lunar-javascript";
import type { LunarDate } from "../../shared/types.js";

// 日期格式正则：YYYY-MM-DD
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 解析 YYYY-MM-DD 格式的日期字符串，返回年、月、日
 * @throws 格式不合法时抛出异常
 */
function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  if (!DATE_PATTERN.test(dateStr)) {
    throw new Error(`Invalid date format: "${dateStr}". Expected YYYY-MM-DD`);
  }
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  return {
    year: parseInt(yearStr, 10),
    month: parseInt(monthStr, 10),
    day: parseInt(dayStr, 10),
  };
}

/**
 * 农历日期转公历日期
 * @param lunarDate 农历日期字符串，格式 YYYY-MM-DD
 * @returns 公历日期字符串，格式 YYYY-MM-DD
 * @throws 日期格式无效或农历日期不存在时抛出异常
 */
export function lunarToSolar(lunarDate: string): string {
  const { year, month, day } = parseDateString(lunarDate);

  try {
    // 使用 lunar-javascript 创建农历日期对象并转换为公历
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();
    return solar.toYmd();
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to convert lunar date "${lunarDate}" to solar: ${message}`);
  }
}

/**
 * 公历日期转农历日期
 * @param solarDate 公历日期字符串，格式 YYYY-MM-DD
 * @returns LunarDate 对象，包含农历年月日及中文表示
 * @throws 日期格式无效时抛出异常
 */
export function solarToLunar(solarDate: string): LunarDate {
  const { year, month, day } = parseDateString(solarDate);

  try {
    // 使用 lunar-javascript 创建公历日期对象并转换为农历
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    return {
      year: lunar.getYear(),
      month: Math.abs(lunar.getMonth()),
      day: lunar.getDay(),
      isLeapMonth: lunar.getMonth() < 0,
      yearGanZhi: lunar.getYearInGanZhi(),
      monthChinese: lunar.getMonthInChinese(),
      dayChinese: lunar.getDayInChinese(),
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to convert solar date "${solarDate}" to lunar: ${message}`);
  }
}

/**
 * 验证农历日期是否有效
 * @param date 日期字符串，格式 YYYY-MM-DD
 * @returns 是否为有效的农历日期
 */
export function isValidLunarDate(date: string): boolean {
  // 格式校验
  if (!DATE_PATTERN.test(date)) {
    return false;
  }

  const { year, month, day } = parseDateString(date);

  // 基本范围校验：月份 1-12，日期 1-30
  if (month < 1 || month > 12 || day < 1 || day > 30) {
    return false;
  }

  try {
    // 尝试创建农历日期对象，如果日期不存在会抛出异常
    const lunar = Lunar.fromYmd(year, month, day);
    // 验证 round-trip：创建后的农历日期应与输入一致
    if (
      lunar.getYear() !== year ||
      Math.abs(lunar.getMonth()) !== month ||
      lunar.getDay() !== day
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
