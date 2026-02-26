/**
 * CategoryFilter 组件
 * 展示预设分类标签栏，支持点击筛选：
 * - "全部"按钮：清除筛选，显示所有事件
 * - 各分类按钮：按分类筛选事件，附带对应 emoji 图标
 */
import { CATEGORIES, CATEGORY_ICON_MAP } from "../../shared/constants.js";
import type { Category } from "../../shared/types.js";
import styles from "./CategoryFilter.module.css";

// 分类图标标识转 emoji 映射
const ICON_EMOJI: Record<string, string> = {
  heart: "❤️",
  cake: "🎂",
  star: "⭐",
  gift: "🎁",
  calendar: "📅",
};

interface CategoryFilterProps {
  /** 当前选中的分类，undefined 表示"全部" */
  selected?: string;
  /** 选择分类的回调，传 undefined 表示清除筛选 */
  onSelect: (category?: string) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className={styles.container}>
      {/* "全部"按钮 */}
      <button
        className={`${styles.tag} ${selected === undefined ? styles.active : ""}`}
        onClick={() => onSelect(undefined)}
      >
        全部
      </button>

      {/* 各分类按钮 */}
      {CATEGORIES.map((category) => {
        const iconKey = CATEGORY_ICON_MAP[category];
        const emoji = ICON_EMOJI[iconKey] ?? "📅";
        return (
          <button
            key={category}
            className={`${styles.tag} ${selected === category ? styles.active : ""}`}
            onClick={() => onSelect(category)}
          >
            <span className={styles.emoji}>{emoji}</span>
            {category}
          </button>
        );
      })}
    </div>
  );
}
