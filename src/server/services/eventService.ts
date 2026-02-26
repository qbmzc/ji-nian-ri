import type {
  CalendarType,
  Category,
  DayCalculation,
  Event,
  EventWithDays,
  CreateEventInput,
  UpdateEventInput,
  LunarDate,
} from "../../shared/types.js";
import { lunarToSolar, solarToLunar, isValidLunarDate } from "./lunarService.js";
import { EventRepository } from "../db/database.js";
import { CATEGORIES, DEFAULT_CALENDAR_TYPE, DEFAULT_CATEGORY } from "../../shared/constants.js";

// 日期格式正则：YYYY-MM-DD
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 有效的日历类型
const VALID_CALENDAR_TYPES: CalendarType[] = ["solar", "lunar"];

/**
 * 验证错误类，包含字段级错误详情
 */
export class ValidationError extends Error {
  public details: Array<{ field: string; message: string }>;

  constructor(details: Array<{ field: string; message: string }>) {
    super("Validation failed");
    this.name = "ValidationError";
    this.details = details;
  }
}

/**
 * 资源不存在错误类
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * 计算事件日期与参考日期之间的天数差
 * 支持公历和农历日期，农历日期会自动转换为公历后再计算
 *
 * @param eventDate 事件日期，格式 YYYY-MM-DD（公历或农历）
 * @param calendarType 日历类型："solar" 公历 | "lunar" 农历
 * @param today 参考日期（可选），格式 YYYY-MM-DD，默认为当前日期
 * @returns DayCalculation 天数计算结果
 * @throws 日期格式无效或农历转换失败时抛出异常
 */
export function calculateDays(
  eventDate: string,
  calendarType: CalendarType,
  today?: string
): DayCalculation {
  // 确定用于计算的公历日期
  const solarDate =
    calendarType === "lunar" ? lunarToSolar(eventDate) : eventDate;

  // 确定参考日期（今天）
  const todayStr = today ?? new Date().toISOString().slice(0, 10);

  // 解析日期并计算天数差（仅基于日期，不考虑时区）
  const eventTime = new Date(solarDate + "T00:00:00").getTime();
  const todayTime = new Date(todayStr + "T00:00:00").getTime();
  const diffMs = eventTime - todayTime;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // 根据天数差确定类型和标签
  if (diffDays < 0) {
    // 事件日期在过去
    const days = Math.abs(diffDays);
    return {
      days,
      type: "past",
      label: `已经 ${days} 天`,
      solarDate,
    };
  } else if (diffDays > 0) {
    // 事件日期在未来
    return {
      days: diffDays,
      type: "future",
      label: `还有 ${diffDays} 天`,
      solarDate,
    };
  } else {
    // 事件日期就是今天
    return {
      days: 0,
      type: "today",
      label: "就是今天",
      solarDate,
    };
  }
}


/**
 * 验证公历日期是否有效（格式正确且日期真实存在）
 */
function isValidSolarDate(dateStr: string): boolean {
  if (!DATE_PATTERN.test(dateStr)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // 使用 UTC 避免时区偏移问题
  const d = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(d.getTime())) {
    return false;
  }
  // 验证 round-trip：防止 2024-02-30 被解析为 2024-03-01
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * 验证创建事件的输入数据，返回字段级错误列表
 */
function validateCreateInput(
  input: CreateEventInput
): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = [];

  // 名称验证：必填，不能为纯空白，最大 100 字符
  if (input.name == null || input.name === "") {
    errors.push({ field: "name", message: "Name is required" });
  } else if (!/\S/.test(input.name)) {
    errors.push({ field: "name", message: "Name must contain non-whitespace characters" });
  } else if (input.name.length > 100) {
    errors.push({ field: "name", message: "Name must be at most 100 characters" });
  }

  // 日期验证：必填，YYYY-MM-DD 格式，根据日历类型验证有效性
  if (input.date == null || input.date === "") {
    errors.push({ field: "date", message: "Date is required" });
  } else if (!DATE_PATTERN.test(input.date)) {
    errors.push({ field: "date", message: "Date must be in YYYY-MM-DD format" });
  } else {
    const calType = input.calendarType ?? DEFAULT_CALENDAR_TYPE;
    if (calType === "lunar") {
      if (!isValidLunarDate(input.date)) {
        errors.push({ field: "date", message: "Invalid lunar date" });
      }
    } else {
      if (!isValidSolarDate(input.date)) {
        errors.push({ field: "date", message: "Invalid solar date" });
      }
    }
  }

  // 日历类型验证：可选，必须是 "solar" 或 "lunar"
  if (
    input.calendarType != null &&
    !VALID_CALENDAR_TYPES.includes(input.calendarType as CalendarType)
  ) {
    errors.push({
      field: "calendarType",
      message: `Calendar type must be one of: ${VALID_CALENDAR_TYPES.join(", ")}`,
    });
  }

  // 分类验证：可选，必须是预设分类之一
  if (
    input.category != null &&
    !CATEGORIES.includes(input.category as Category)
  ) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${CATEGORIES.join(", ")}`,
    });
  }

  // 备注验证：最大 500 字符
  if (input.note != null && input.note.length > 500) {
    errors.push({ field: "note", message: "Note must be at most 500 characters" });
  }

  // 图标验证：最大 50 字符
  if (input.icon != null && input.icon.length > 50) {
    errors.push({ field: "icon", message: "Icon must be at most 50 characters" });
  }

  return errors;
}

/**
 * 验证更新事件的输入数据，返回字段级错误列表
 */
function validateUpdateInput(
  input: UpdateEventInput,
  existingCalendarType: CalendarType
): Array<{ field: string; message: string }> {
  const errors: Array<{ field: string; message: string }> = [];

  // 名称验证：如果提供了，不能为纯空白，最大 100 字符
  if (input.name != null) {
    if (input.name === "" || !/\S/.test(input.name)) {
      errors.push({ field: "name", message: "Name must contain non-whitespace characters" });
    } else if (input.name.length > 100) {
      errors.push({ field: "name", message: "Name must be at most 100 characters" });
    }
  }

  // 日历类型验证：如果提供了，必须是有效值
  if (
    input.calendarType != null &&
    !VALID_CALENDAR_TYPES.includes(input.calendarType as CalendarType)
  ) {
    errors.push({
      field: "calendarType",
      message: `Calendar type must be one of: ${VALID_CALENDAR_TYPES.join(", ")}`,
    });
  }

  // 日期验证：如果提供了，必须是有效日期
  if (input.date != null) {
    if (!DATE_PATTERN.test(input.date)) {
      errors.push({ field: "date", message: "Date must be in YYYY-MM-DD format" });
    } else {
      // 使用更新后的日历类型（如果同时提供了），否则使用现有的
      const calType = input.calendarType ?? existingCalendarType;
      if (calType === "lunar") {
        if (!isValidLunarDate(input.date)) {
          errors.push({ field: "date", message: "Invalid lunar date" });
        }
      } else {
        if (!isValidSolarDate(input.date)) {
          errors.push({ field: "date", message: "Invalid solar date" });
        }
      }
    }
  }

  // 分类验证
  if (
    input.category != null &&
    !CATEGORIES.includes(input.category as Category)
  ) {
    errors.push({
      field: "category",
      message: `Category must be one of: ${CATEGORIES.join(", ")}`,
    });
  }

  // 备注验证
  if (input.note != null && input.note.length > 500) {
    errors.push({ field: "note", message: "Note must be at most 500 characters" });
  }

  // 图标验证
  if (input.icon != null && input.icon.length > 50) {
    errors.push({ field: "icon", message: "Icon must be at most 50 characters" });
  }

  return errors;
}

/**
 * 获取事件的农历信息
 * 农历事件：直接从存储的日期解析农历信息
 * 公历事件：将公历日期转换为农历信息
 */
function getLunarInfo(date: string, calendarType: CalendarType): LunarDate | undefined {
  try {
    if (calendarType === "lunar") {
      // 农历事件：从存储的农历日期解析信息
      const [yearStr, monthStr, dayStr] = date.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      // 使用 solarToLunar 获取完整的农历信息需要先转为公历再转回
      // 但这里直接用 lunarToSolar 转为公历，再用 solarToLunar 获取完整信息
      const solarDate = lunarToSolar(date);
      return solarToLunar(solarDate);
    } else {
      // 公历事件：将公历日期转换为农历信息
      return solarToLunar(date);
    }
  } catch {
    // 转换失败时返回 undefined
    return undefined;
  }
}

/**
 * 事件服务类，封装纪念日事件的完整业务逻辑
 */
export class EventService {
  private repository: EventRepository;

  constructor(repository: EventRepository) {
    this.repository = repository;
  }

  /**
   * 获取所有事件，附带天数计算结果和农历信息
   * 支持按分类筛选，结果按日期排序
   */
  getAllEvents(category?: string): EventWithDays[] {
    // 验证分类参数（如果提供了）
    if (category != null && category !== "" && !CATEGORIES.includes(category as Category)) {
      throw new ValidationError([
        { field: "category", message: `Category must be one of: ${CATEGORIES.join(", ")}` },
      ]);
    }

    const events = this.repository.findAll(category);

    // 为每个事件附加天数计算和农历信息
    return events.map((event) => {
      const dayCalculation = calculateDays(event.date, event.calendarType);
      const lunarInfo = getLunarInfo(event.date, event.calendarType);

      return {
        ...event,
        dayCalculation,
        lunarInfo,
      } as EventWithDays;
    });
  }

  /**
   * 创建新事件，验证输入后持久化存储
   */
  createEvent(input: CreateEventInput): Event {
    // 验证输入
    const errors = validateCreateInput(input);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    // 设置默认值
    const normalizedInput: CreateEventInput = {
      name: input.name,
      date: input.date,
      calendarType: input.calendarType ?? DEFAULT_CALENDAR_TYPE,
      category: input.category ?? DEFAULT_CATEGORY,
      note: input.note ?? "",
      icon: input.icon ?? "",
    };

    return this.repository.insert(normalizedInput);
  }

  /**
   * 更新已有事件，验证事件存在性和输入后更新
   */
  updateEvent(id: number, input: UpdateEventInput): Event {
    // 验证事件存在性
    const existing = this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Event with id ${id} not found`);
    }

    // 验证输入
    const errors = validateUpdateInput(input, existing.calendarType);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    return this.repository.update(id, input);
  }

  /**
   * 删除事件，验证事件存在性后删除
   */
  deleteEvent(id: number): void {
    // 验证事件存在性
    const existing = this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Event with id ${id} not found`);
    }

    this.repository.remove(id);
  }
}
