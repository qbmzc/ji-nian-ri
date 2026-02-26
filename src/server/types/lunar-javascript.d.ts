// lunar-javascript 库的类型声明
declare module "lunar-javascript" {
  /** 公历日期类 */
  export class Solar {
    /** 从年月日创建公历日期对象 */
    static fromYmd(year: number, month: number, day: number): Solar;
    /** 转换为农历日期对象 */
    getLunar(): Lunar;
    /** 返回 YYYY-MM-DD 格式的日期字符串 */
    toYmd(): string;
  }

  /** 农历日期类 */
  export class Lunar {
    /** 从年月日创建农历日期对象 */
    static fromYmd(year: number, month: number, day: number): Lunar;
    /** 转换为公历日期对象 */
    getSolar(): Solar;
    /** 获取农历年 */
    getYear(): number;
    /** 获取农历月（负数表示闰月） */
    getMonth(): number;
    /** 获取农历日 */
    getDay(): number;
    /** 获取干支纪年，如"甲子" */
    getYearInGanZhi(): string;
    /** 获取中文月份，如"正月" */
    getMonthInChinese(): string;
    /** 获取中文日期，如"初一" */
    getDayInChinese(): string;
  }
}
