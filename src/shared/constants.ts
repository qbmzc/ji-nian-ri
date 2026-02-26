import type { CalendarType, Category, CountDirection } from "./types";

// 预设分类列表
export const CATEGORIES: Category[] = [
  "恋爱",
  "生日",
  "纪念日",
  "节日",
  "其他",
];

// 分类图标映射
export const CATEGORY_ICON_MAP: Record<Category, string> = {
  "恋爱": "heart",
  "生日": "cake",
  "纪念日": "star",
  "节日": "gift",
  "其他": "calendar",
};

// 默认日历类型
export const DEFAULT_CALENDAR_TYPE: CalendarType = "solar";

// 默认计数方向
export const DEFAULT_COUNT_DIRECTION: CountDirection = "countup";

// 默认分类
export const DEFAULT_CATEGORY: Category = "其他";
