import { describe, it, expect } from "vitest";
import { lunarToSolar, solarToLunar, isValidLunarDate } from "../services/lunarService.js";

describe("lunarService", () => {
  describe("lunarToSolar - 农历转公历", () => {
    it("应正确转换常见农历日期（正月初一 2024）", () => {
      // 2024年农历正月初一 = 公历 2024-02-10
      const result = lunarToSolar("2024-01-01");
      expect(result).toBe("2024-02-10");
    });

    it("应正确转换农历八月十五（中秋节 2024）", () => {
      // 2024年农历八月十五 = 公历 2024-09-17
      const result = lunarToSolar("2024-08-15");
      expect(result).toBe("2024-09-17");
    });

    it("应正确转换农历腊月（2020年腊月初十）", () => {
      // 来自 lunar-javascript 测试用例
      const result = lunarToSolar("2020-12-10");
      expect(result).toBe("2021-01-22");
    });

    it("日期格式无效时应抛出异常", () => {
      expect(() => lunarToSolar("invalid")).toThrow("Invalid date format");
      expect(() => lunarToSolar("2024/01/01")).toThrow("Invalid date format");
    });
  });

  describe("solarToLunar - 公历转农历", () => {
    it("应正确转换公历日期为农历", () => {
      const result = solarToLunar("2024-02-10");
      expect(result.year).toBe(2024);
      expect(result.month).toBe(1);
      expect(result.day).toBe(1);
      expect(result.isLeapMonth).toBe(false);
      expect(result.yearGanZhi).toBe("甲辰");
      expect(result.monthChinese).toBe("正");
      expect(result.dayChinese).toBe("初一");
    });

    it("应正确识别闰月", () => {
      // 2020年有闰四月，公历 2020-05-23 是闰四月初一
      const result = solarToLunar("2020-05-23");
      expect(result.month).toBe(4);
      expect(result.isLeapMonth).toBe(true);
    });

    it("应返回正确的干支纪年", () => {
      const result = solarToLunar("2024-09-17");
      expect(result.yearGanZhi).toBe("甲辰");
    });

    it("日期格式无效时应抛出异常", () => {
      expect(() => solarToLunar("bad-date")).toThrow("Invalid date format");
    });
  });

  describe("isValidLunarDate - 农历日期验证", () => {
    it("有效的农历日期应返回 true", () => {
      expect(isValidLunarDate("2024-01-01")).toBe(true);  // 正月初一
      expect(isValidLunarDate("2024-08-15")).toBe(true);  // 八月十五
      expect(isValidLunarDate("2024-12-29")).toBe(true);  // 腊月廿九
    });

    it("格式无效应返回 false", () => {
      expect(isValidLunarDate("invalid")).toBe(false);
      expect(isValidLunarDate("2024/01/01")).toBe(false);
      expect(isValidLunarDate("")).toBe(false);
    });

    it("月份超出范围应返回 false", () => {
      expect(isValidLunarDate("2024-00-01")).toBe(false);
      expect(isValidLunarDate("2024-13-01")).toBe(false);
    });

    it("日期超出范围应返回 false", () => {
      expect(isValidLunarDate("2024-01-00")).toBe(false);
      expect(isValidLunarDate("2024-01-31")).toBe(false);
    });
  });
});
