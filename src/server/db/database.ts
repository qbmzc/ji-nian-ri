import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type {
  Event,
  CreateEventInput,
  UpdateEventInput,
  CalendarType,
  Category,
} from "../../shared/types.js";

// 数据库行类型（snake_case 字段名）
interface EventRow {
  id: number;
  name: string;
  date: string;
  calendar_type: string;
  category: string;
  note: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

// 建表 SQL
const CREATE_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    calendar_type TEXT NOT NULL DEFAULT 'solar',
    category TEXT NOT NULL DEFAULT '其他',
    note TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`;

// 索引 SQL
const CREATE_CATEGORY_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)
`;

const CREATE_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)
`;

/**
 * 将数据库行（snake_case）映射为 TypeScript 对象（camelCase）
 */
function rowToEvent(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    calendarType: row.calendar_type as CalendarType,
    category: row.category as Category,
    note: row.note,
    icon: row.icon,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 事件数据仓库，封装 SQLite 数据库操作
 */
export class EventRepository {
  private db: Database.Database;

  constructor(dbPath?: string) {
    // 默认数据库路径为 data/anniversary.db
    const resolvedPath = dbPath ?? path.join("data", "anniversary.db");

    // 确保数据库目录存在
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(resolvedPath);

    // 启用 WAL 模式，提升并发读写性能
    this.db.pragma("journal_mode = WAL");
  }

  /**
   * 初始化数据库表结构和索引
   */
  initialize(): void {
    this.db.exec(CREATE_EVENTS_TABLE);
    this.db.exec(CREATE_CATEGORY_INDEX);
    this.db.exec(CREATE_DATE_INDEX);
  }

  /**
   * 查询所有事件，可选按分类筛选，按日期排序
   */
  findAll(category?: string): Event[] {
    let rows: EventRow[];
    if (category) {
      const stmt = this.db.prepare(
        "SELECT * FROM events WHERE category = ? ORDER BY date ASC"
      );
      rows = stmt.all(category) as EventRow[];
    } else {
      const stmt = this.db.prepare(
        "SELECT * FROM events ORDER BY date ASC"
      );
      rows = stmt.all() as EventRow[];
    }
    return rows.map(rowToEvent);
  }

  /**
   * 根据 ID 查询单个事件
   */
  findById(id: number): Event | undefined {
    const stmt = this.db.prepare("SELECT * FROM events WHERE id = ?");
    const row = stmt.get(id) as EventRow | undefined;
    return row ? rowToEvent(row) : undefined;
  }

  /**
   * 插入新事件，返回创建后的完整事件对象
   */
  insert(event: CreateEventInput): Event {
    const stmt = this.db.prepare(`
      INSERT INTO events (name, date, calendar_type, category, note, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      event.name,
      event.date,
      event.calendarType ?? "solar",
      event.category ?? "其他",
      event.note ?? "",
      event.icon ?? ""
    );

    // 查询并返回刚插入的完整事件
    return this.findById(Number(result.lastInsertRowid))!;
  }

  /**
   * 更新事件，返回更新后的完整事件对象
   */
  update(id: number, event: UpdateEventInput): Event {
    const existing = this.findById(id);
    if (!existing) {
      throw new Error(`Event with id ${id} not found`);
    }

    // 合并现有数据和更新数据
    const merged = {
      name: event.name ?? existing.name,
      date: event.date ?? existing.date,
      calendarType: event.calendarType ?? existing.calendarType,
      category: event.category ?? existing.category,
      note: event.note ?? existing.note,
      icon: event.icon ?? existing.icon,
    };

    const stmt = this.db.prepare(`
      UPDATE events
      SET name = ?, date = ?, calendar_type = ?, category = ?, note = ?, icon = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      merged.name,
      merged.date,
      merged.calendarType,
      merged.category,
      merged.note,
      merged.icon,
      id
    );

    return this.findById(id)!;
  }

  /**
   * 删除事件，返回是否成功删除
   */
  remove(id: number): boolean {
    const stmt = this.db.prepare("DELETE FROM events WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    this.db.close();
  }

  /**
   * 获取底层数据库实例（仅用于测试）
   */
  getDatabase(): Database.Database {
    return this.db;
  }
}
