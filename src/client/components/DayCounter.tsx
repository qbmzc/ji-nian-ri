/**
 * DayCounter 组件
 * 根据 DayCalculation 展示天数计算结果：
 * - 过去："已经 X 天"
 * - 未来："还有 X 天"
 * - 今天："就是今天"
 */
import type { DayCalculation } from "../../shared/types.js";
import styles from "./DayCounter.module.css";

interface DayCounterProps {
  calculation: DayCalculation;
}

export function DayCounter({ calculation }: DayCounterProps) {
  const { days, type, label } = calculation;

  // 根据类型选择对应的样式类名
  const typeClass = styles[type] ?? "";

  return (
    <div className={`${styles.container} ${typeClass}`}>
      {/* 今天不显示数字，只显示标签 */}
      {type !== "today" && (
        <span className={styles.days}>{days}</span>
      )}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
