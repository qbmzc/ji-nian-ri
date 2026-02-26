import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EventRepository } from "../db/database.js";
import {
  EventService,
  ValidationError,
  NotFoundError,
  calculateDays,
} from "../services/eventService.js";
import type { CreateEventInput } from "../../shared/types.js";
import path from "path";
import fs from "fs";
import os from "os";

// 辅助函数：创建临时数据库用于测试
function createTestDb(): { repo: EventRepository; dbPath: string } {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "event-service-test-"));
  const dbPath = path.join(tmpDir, "test.db");
  const repo = new EventRepository(dbPath);
  repo.initialize();
  return { repo, dbPath };
}

// 辅助函数：清理临时数据库
function cleanupTestDb(dbPath: string, repo: EventRepository): void {
  repo.close();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  const dir = path.dirname(dbPath);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
}

describe("EventService", () => {
  let repo: EventRepository;
  let service: EventService;
  let dbPath: string;

  beforeEach(() => {
    const testDb = createTestDb();
    repo = testDb.repo;
    dbPath = testDb.dbPath;
    service = new EventService(repo);
  });

  afterEach(() => {
    cleanupTestDb(dbPath, repo);
  });

  describe("createEvent", () => {
    it("应成功创建包含所有字段的事件", () => {
      const input: CreateEventInput = {
        name: "恋爱纪念日",
        date: "2024-02-14",
        calendarType: "solar",
        category: "恋爱",
        note: "第一次约会",
        icon: "heart",
      };

      const event = service.createEvent(input);

      expect(event.id).toBeTypeOf("number");
      expect(event.name).toBe("恋爱纪念日");
      expect(event.date).toBe("2024-02-14");
      expect(event.calendarType).toBe("solar");
      expect(event.category).toBe("恋爱");
      expect(event.note).toBe("第一次约会");
      expect(event.icon).toBe("heart");
    });

    it("应使用默认值创建事件", () => {
      const input: CreateEventInput = {
        name: "测试事件",
        date: "2024-06-01",
      };

      const event = service.createEvent(input);

      expect(event.calendarType).toBe("solar");
      expect(event.category).toBe("其他");
      expect(event.note).toBe("");
      expect(event.icon).toBe("");
    });

    it("缺少名称时应抛出 ValidationError", () => {
      const input = { name: "", date: "2024-01-01" } as CreateEventInput;

      expect(() => service.createEvent(input)).toThrow(ValidationError);
      try {
        service.createEvent(input);
      } catch (e) {
        const err = e as ValidationError;
        expect(err.details).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ field: "name" }),
          ])
        );
      }
    });

    it("纯空白名称应抛出 ValidationError", () => {
      const input: CreateEventInput = { name: "   ", date: "2024-01-01" };
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("名称超过 100 字符应抛出 ValidationError", () => {
      const input: CreateEventInput = {
        name: "a".repeat(101),
        date: "2024-01-01",
      };
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("缺少日期时应抛出 ValidationError", () => {
      const input = { name: "测试", date: "" } as CreateEventInput;
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("日期格式无效时应抛出 ValidationError", () => {
      const input: CreateEventInput = { name: "测试", date: "2024/01/01" };
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("无效的公历日期应抛出 ValidationError", () => {
      const input: CreateEventInput = {
        name: "测试",
        date: "2024-02-30",
        calendarType: "solar",
      };
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("无效的分类应抛出 ValidationError", () => {
      const input = {
        name: "测试",
        date: "2024-01-01",
        category: "无效分类",
      } as unknown as CreateEventInput;
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("备注超过 500 字符应抛出 ValidationError", () => {
      const input: CreateEventInput = {
        name: "测试",
        date: "2024-01-01",
        note: "a".repeat(501),
      };
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("图标超过 50 字符应抛出 ValidationError", () => {
      const input: CreateEventInput = {
        name: "测试",
        date: "2024-01-01",
        icon: "a".repeat(51),
      };
      expect(() => service.createEvent(input)).toThrow(ValidationError);
    });

    it("应支持创建农历事件", () => {
      const input: CreateEventInput = {
        name: "妈妈生日",
        date: "2024-08-15",
        calendarType: "lunar",
        category: "生日",
      };

      const event = service.createEvent(input);
      expect(event.calendarType).toBe("lunar");
      expect(event.date).toBe("2024-08-15");
    });
  });

  describe("getAllEvents", () => {
    it("无事件时应返回空数组", () => {
      const events = service.getAllEvents();
      expect(events).toEqual([]);
    });

    it("应返回带天数计算的事件列表", () => {
      service.createEvent({ name: "事件A", date: "2024-01-01" });
      service.createEvent({ name: "事件B", date: "2024-06-15" });

      const events = service.getAllEvents();

      expect(events).toHaveLength(2);
      // 每个事件都应有 dayCalculation
      for (const event of events) {
        expect(event.dayCalculation).toBeDefined();
        expect(event.dayCalculation.days).toBeTypeOf("number");
        expect(event.dayCalculation.type).toMatch(/^(past|future|today)$/);
        expect(event.dayCalculation.label).toBeTypeOf("string");
        expect(event.dayCalculation.solarDate).toBeTypeOf("string");
      }
    });

    it("应返回按日期排序的事件", () => {
      service.createEvent({ name: "后面", date: "2025-12-01" });
      service.createEvent({ name: "前面", date: "2024-01-01" });
      service.createEvent({ name: "中间", date: "2024-06-15" });

      const events = service.getAllEvents();

      expect(events[0].name).toBe("前面");
      expect(events[1].name).toBe("中间");
      expect(events[2].name).toBe("后面");
    });

    it("应支持按分类筛选", () => {
      service.createEvent({ name: "恋爱事件", date: "2024-01-01", category: "恋爱" });
      service.createEvent({ name: "生日事件", date: "2024-02-01", category: "生日" });
      service.createEvent({ name: "另一个恋爱", date: "2024-03-01", category: "恋爱" });

      const events = service.getAllEvents("恋爱");

      expect(events).toHaveLength(2);
      for (const event of events) {
        expect(event.category).toBe("恋爱");
      }
    });

    it("公历事件应附带农历信息", () => {
      service.createEvent({ name: "测试", date: "2024-02-14", calendarType: "solar" });

      const events = service.getAllEvents();

      expect(events[0].lunarInfo).toBeDefined();
      expect(events[0].lunarInfo!.year).toBeTypeOf("number");
      expect(events[0].lunarInfo!.monthChinese).toBeTypeOf("string");
      expect(events[0].lunarInfo!.dayChinese).toBeTypeOf("string");
    });

    it("农历事件应附带农历信息", () => {
      service.createEvent({
        name: "农历测试",
        date: "2024-08-15",
        calendarType: "lunar",
      });

      const events = service.getAllEvents();

      expect(events[0].lunarInfo).toBeDefined();
    });

    it("无效分类筛选应抛出 ValidationError", () => {
      expect(() => service.getAllEvents("无效分类")).toThrow(ValidationError);
    });
  });

  describe("updateEvent", () => {
    it("应成功更新事件", () => {
      const created = service.createEvent({ name: "原始名称", date: "2024-01-01" });

      const updated = service.updateEvent(created.id, { name: "新名称" });

      expect(updated.name).toBe("新名称");
      expect(updated.date).toBe("2024-01-01"); // 未更新的字段保持不变
    });

    it("应支持同时更新多个字段", () => {
      const created = service.createEvent({ name: "测试", date: "2024-01-01" });

      const updated = service.updateEvent(created.id, {
        name: "更新后",
        date: "2024-06-15",
        category: "生日",
        note: "新备注",
      });

      expect(updated.name).toBe("更新后");
      expect(updated.date).toBe("2024-06-15");
      expect(updated.category).toBe("生日");
      expect(updated.note).toBe("新备注");
    });

    it("更新不存在的事件应抛出 NotFoundError", () => {
      expect(() => service.updateEvent(9999, { name: "新名称" })).toThrow(NotFoundError);
    });

    it("更新时名称为空应抛出 ValidationError", () => {
      const created = service.createEvent({ name: "测试", date: "2024-01-01" });
      expect(() => service.updateEvent(created.id, { name: "" })).toThrow(ValidationError);
    });

    it("更新时无效日期应抛出 ValidationError", () => {
      const created = service.createEvent({ name: "测试", date: "2024-01-01" });
      expect(() => service.updateEvent(created.id, { date: "invalid" })).toThrow(ValidationError);
    });
  });

  describe("deleteEvent", () => {
    it("应成功删除事件", () => {
      const created = service.createEvent({ name: "待删除", date: "2024-01-01" });

      service.deleteEvent(created.id);

      const events = service.getAllEvents();
      expect(events).toHaveLength(0);
    });

    it("删除不存在的事件应抛出 NotFoundError", () => {
      expect(() => service.deleteEvent(9999)).toThrow(NotFoundError);
    });

    it("删除后再次删除同一事件应抛出 NotFoundError", () => {
      const created = service.createEvent({ name: "测试", date: "2024-01-01" });
      service.deleteEvent(created.id);
      expect(() => service.deleteEvent(created.id)).toThrow(NotFoundError);
    });
  });
});
