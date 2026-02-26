// 日历类型：公历或农历
export type CalendarType = "solar" | "lunar";

// 预设分类枚举
export type Category = "恋爱" | "生日" | "纪念日" | "节日" | "其他";

// 事件基础类型
export interface Event {
  id: number;                  // 自增主键
  name: string;                // 事件名称（必填）
  date: string;                // 事件日期，ISO 8601 格式 "YYYY-MM-DD"（必填）
  calendarType: CalendarType;  // 日历类型：公历或农历（必填，默认 "solar"）
  category: Category;          // 分类（必填，默认 "其他"）
  note: string;                // 备注（可选，默认空字符串）
  icon: string;                // 图标标识（可选，默认由分类决定）
  createdAt: string;           // 创建时间 ISO 8601
  updatedAt: string;           // 更新时间 ISO 8601
}

// 农历日期信息
export interface LunarDate {
  year: number;            // 农历年
  month: number;           // 农历月（1-12）
  day: number;             // 农历日
  isLeapMonth: boolean;    // 是否闰月
  yearGanZhi: string;      // 干支纪年，如"甲子"
  monthChinese: string;    // 中文月份，如"正月"
  dayChinese: string;      // 中文日期，如"初一"
}

// 天数计算结果
export interface DayCalculation {
  days: number;            // 天数差的绝对值
  type: "past" | "future" | "today";  // 过去、未来、今天
  label: string;           // 展示文本，如"已经 100 天"、"还有 30 天"、"就是今天"
  solarDate: string;       // 用于计算的公历日期（农历事件会自动转换）
}

// 带天数计算的事件（API 响应）
export interface EventWithDays extends Event {
  dayCalculation: DayCalculation;
  lunarInfo?: LunarDate;   // 农历事件附带农历详细信息；公历事件附带对应农历信息
}

// 创建事件输入
export interface CreateEventInput {
  name: string;                    // 必填
  date: string;                    // 必填，YYYY-MM-DD（公历或农历日期）
  calendarType?: CalendarType;     // 可选，默认 "solar"
  category?: Category;             // 可选，默认 "其他"
  note?: string;                   // 可选
  icon?: string;                   // 可选
}

// 更新事件输入
export interface UpdateEventInput {
  name?: string;
  date?: string;
  calendarType?: CalendarType;
  category?: Category;
  note?: string;
  icon?: string;
}
