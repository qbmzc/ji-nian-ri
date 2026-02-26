/**
 * EventCard 组件
 * 展示单个纪念日事件卡片，包含：
 * - 事件名称和分类图标
 * - 日期信息（农历事件同时显示农历和公历日期）
 * - 天数计算展示（DayCounter）
 * - 编辑和删除操作按钮
 */
import type { EventWithDays } from "../../shared/types.js";
import { DayCounter } from "./DayCounter.js";
import styles from "./EventCard.module.css";

// 分类图标映射：将图标标识转换为 emoji
const ICON_EMOJI_MAP: Record<string, string> = {
  heart: "❤️",
  cake: "🎂",
  star: "⭐",
  gift: "🎁",
  calendar: "📅",
};

interface EventCardProps {
  event: EventWithDays;
  onEdit?: (event: EventWithDays) => void;
  onDelete?: (id: number) => void;
}

/**
 * 根据分类或自定义图标获取对应的 emoji
 */
function getEmoji(icon: string): string {
  return ICON_EMOJI_MAP[icon] ?? "📅";
}

/**
 * 格式化日期显示
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
  const { name, icon, calendarType, countDirection, dayCalculation, lunarInfo } = event;

  // 获取展示用的 emoji 图标
  const emoji = getEmoji(icon);

  // 判断是否为农历事件
  const isLunar = calendarType === "lunar";

  // 计数方向标签
  const directionLabel = countDirection === "countdown" ? "倒数日" : "累计日";

  return (
    <div className={styles.card}>
      {/* 头部：图标 + 名称 + 类型标签 */}
      <div className={styles.header}>
        <span className={styles.icon}>{emoji}</span>
        <span className={styles.name}>{name}</span>
        <span className={styles.badge}>{directionLabel}</span>
      </div>

      {/* 日期信息 */}
      <div className={styles.dateInfo}>
        {isLunar && lunarInfo ? (
          <>
            {/* 农历事件：显示农历日期和对应公历日期 */}
            <span>
              农历 {lunarInfo.monthChinese}{lunarInfo.dayChinese}
              {lunarInfo.isLeapMonth ? "（闰）" : ""}
            </span>
            <span className={styles.lunarDate}>
              公历 {formatDate(dayCalculation.solarDate)}
            </span>
          </>
        ) : (
          /* 公历事件：直接显示日期 */
          <span>{formatDate(event.date)}</span>
        )}
      </div>

      {/* 天数计算展示 */}
      <DayCounter calculation={dayCalculation} />

      {/* 操作按钮 */}
      {(onEdit || onDelete) && (
        <div className={styles.actions}>
          {onEdit && (
            <button
              className={`${styles.actionBtn} ${styles.editBtn}`}
              onClick={() => onEdit(event)}
            >
              编辑
            </button>
          )}
          {onDelete && (
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => onDelete(event.id)}
            >
              删除
            </button>
          )}
        </div>
      )}
    </div>
  );
}
