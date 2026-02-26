/**
 * Dashboard 首页组件
 * 展示所有纪念日事件的概览卡片，支持：
 * - 按分类筛选事件
 * - 即将到来的纪念日排列在显眼位置
 * - 无事件时显示 EmptyState 引导
 * - 创建、编辑、删除事件操作
 */
import { useState, useEffect, useCallback } from "react";
import type {
  EventWithDays,
  CreateEventInput,
  UpdateEventInput,
} from "../../shared/types.js";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../api/eventApi.js";
import { CategoryFilter } from "../components/CategoryFilter.js";
import { EventCard } from "../components/EventCard.js";
import { EmptyState } from "../components/EmptyState.js";
import { EventForm } from "../components/EventForm.js";
import styles from "./Dashboard.module.css";

/**
 * 排序事件列表：即将到来（future/today）的排在前面，过去的排在后面
 * 同类型内按天数升序排列（即将到来的越近越靠前，过去的越近越靠前）
 */
function sortEvents(events: EventWithDays[]): EventWithDays[] {
  return [...events].sort((a, b) => {
    const aType = a.dayCalculation.type;
    const bType = b.dayCalculation.type;

    // today 优先级最高，future 其次，past 最后
    const priority: Record<string, number> = { today: 0, future: 1, past: 2 };
    const aPriority = priority[aType] ?? 2;
    const bPriority = priority[bType] ?? 2;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // 同类型内按天数升序（天数少的排前面）
    return a.dayCalculation.days - b.dayCalculation.days;
  });
}

export function Dashboard() {
  // 事件列表
  const [events, setEvents] = useState<EventWithDays[]>([]);
  // 当前选中的分类筛选
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  // 是否显示事件表单
  const [showForm, setShowForm] = useState(false);
  // 正在编辑的事件（undefined 表示创建模式）
  const [editingEvent, setEditingEvent] = useState<EventWithDays | undefined>(undefined);
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 错误信息
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载事件列表
   */
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents(selectedCategory);
      setEvents(sortEvents(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // 初始加载和分类变化时重新获取
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  /**
   * 打开创建表单
   */
  function handleOpenCreate() {
    setEditingEvent(undefined);
    setShowForm(true);
  }

  /**
   * 打开编辑表单
   */
  function handleEdit(event: EventWithDays) {
    setEditingEvent(event);
    setShowForm(true);
  }

  /**
   * 关闭表单
   */
  function handleCloseForm() {
    setShowForm(false);
    setEditingEvent(undefined);
  }

  /**
   * 提交表单（创建或编辑）
   */
  async function handleSubmit(input: CreateEventInput | UpdateEventInput) {
    try {
      if (editingEvent) {
        // 编辑模式
        await updateEvent(editingEvent.id, input as UpdateEventInput);
      } else {
        // 创建模式
        await createEvent(input as CreateEventInput);
      }
      handleCloseForm();
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  }

  /**
   * 删除事件，先弹出确认对话框
   */
  async function handleDelete(id: number) {
    if (!window.confirm("确定要删除这个纪念日吗？")) return;
    try {
      await deleteEvent(id);
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  }

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>我的纪念日</h1>
        <button className={styles.addBtn} onClick={handleOpenCreate}>
          添加
        </button>
      </div>

      {/* 分类筛选 */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* 错误提示 */}
      {error && <div className={styles.error}>{error}</div>}

      {/* 加载状态 */}
      {loading && <div className={styles.loading}>加载中...</div>}

      {/* 事件列表或空状态 */}
      {!loading && events.length === 0 && (
        <EmptyState onCreateClick={handleOpenCreate} />
      )}

      {!loading && events.length > 0 && (
        <div className={styles.grid}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* 事件表单弹窗 */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}
