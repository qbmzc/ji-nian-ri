/**
 * EventForm 组件
 * 支持创建和编辑两种模式的事件表单：
 * - 无 event prop → 创建模式（空表单，使用默认值）
 * - 有 event prop → 编辑模式（预填充事件数据）
 * 表单字段：名称（必填）、日期（必填）、日历类型、分类、备注、图标
 * 包含前端验证：名称和日期必填校验
 */
import { useState } from "react";
import type {
  CalendarType,
  Category,
  CreateEventInput,
  EventWithDays,
  UpdateEventInput,
} from "../../shared/types.js";
import { CATEGORIES, DEFAULT_CALENDAR_TYPE, DEFAULT_CATEGORY } from "../../shared/constants.js";
import styles from "./EventForm.module.css";

interface EventFormProps {
  /** 编辑模式时传入已有事件数据 */
  event?: EventWithDays;
  /** 提交回调，创建模式返回 CreateEventInput，编辑模式返回 UpdateEventInput */
  onSubmit: (input: CreateEventInput | UpdateEventInput) => void;
  /** 取消回调 */
  onCancel: () => void;
}

/** 表单验证错误 */
interface FormErrors {
  name?: string;
  date?: string;
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  // 判断是否为编辑模式
  const isEdit = !!event;

  // 表单状态，编辑模式预填充事件数据
  const [name, setName] = useState(event?.name ?? "");
  const [date, setDate] = useState(event?.date ?? "");
  const [calendarType, setCalendarType] = useState<CalendarType>(
    event?.calendarType ?? DEFAULT_CALENDAR_TYPE
  );
  const [category, setCategory] = useState<Category>(
    event?.category ?? DEFAULT_CATEGORY
  );
  const [note, setNote] = useState(event?.note ?? "");
  const [icon, setIcon] = useState(event?.icon ?? "");

  // 验证错误状态
  const [errors, setErrors] = useState<FormErrors>({});

  /**
   * 验证表单，返回是否通过
   */
  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "请输入事件名称";
    }
    if (!date) {
      newErrors.date = "请选择日期";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  /**
   * 处理表单提交
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    if (isEdit) {
      // 编辑模式：只提交变更的字段
      const input: UpdateEventInput = {};
      if (name !== event!.name) input.name = name.trim();
      if (date !== event!.date) input.date = date;
      if (calendarType !== event!.calendarType) input.calendarType = calendarType;
      if (category !== event!.category) input.category = category;
      if (note !== event!.note) input.note = note;
      if (icon !== event!.icon) input.icon = icon;
      onSubmit(input);
    } else {
      // 创建模式：提交完整数据
      const input: CreateEventInput = {
        name: name.trim(),
        date,
        calendarType,
        category,
        note: note || undefined,
        icon: icon || undefined,
      };
      onSubmit(input);
    }
  }

  /**
   * 点击遮罩层关闭表单
   */
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>
          {isEdit ? "编辑纪念日" : "创建纪念日"}
        </h2>

        {/* 名称字段 */}
        <div className={styles.field}>
          <label className={styles.label}>
            名称<span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：恋爱纪念日"
            maxLength={100}
          />
          {errors.name && <p className={styles.errorText}>{errors.name}</p>}
        </div>

        {/* 日期字段 */}
        <div className={styles.field}>
          <label className={styles.label}>
            日期<span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            className={`${styles.input} ${errors.date ? styles.inputError : ""}`}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <p className={styles.errorText}>{errors.date}</p>}
        </div>

        {/* 日历类型切换 */}
        <div className={styles.field}>
          <label className={styles.label}>日历类型</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="calendarType"
                value="solar"
                checked={calendarType === "solar"}
                onChange={() => setCalendarType("solar")}
              />
              公历
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="calendarType"
                value="lunar"
                checked={calendarType === "lunar"}
                onChange={() => setCalendarType("lunar")}
              />
              农历
            </label>
          </div>
        </div>

        {/* 分类下拉选择 */}
        <div className={styles.field}>
          <label className={styles.label}>分类</label>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 备注 */}
        <div className={styles.field}>
          <label className={styles.label}>备注</label>
          <textarea
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注信息..."
            maxLength={500}
          />
        </div>

        {/* 图标 */}
        <div className={styles.field}>
          <label className={styles.label}>图标</label>
          <input
            type="text"
            className={styles.input}
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="例如：heart、cake、star"
            maxLength={50}
          />
        </div>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            取消
          </button>
          <button type="submit" className={styles.submitBtn}>
            {isEdit ? "保存" : "创建"}
          </button>
        </div>
      </form>
    </div>
  );
}
