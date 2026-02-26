/**
 * EmptyState 组件
 * 无事件时显示引导提示，鼓励用户创建第一个纪念日
 */
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  /** 点击"创建纪念日"按钮的回调 */
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>🎉</span>
      <h2 className={styles.title}>还没有纪念日</h2>
      <p className={styles.description}>
        记录你的重要日子，让每一天都值得纪念
      </p>
      <button className={styles.createBtn} onClick={onCreateClick}>
        创建纪念日
      </button>
    </div>
  );
}
