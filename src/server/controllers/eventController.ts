/**
 * 事件控制器
 * 处理 HTTP 请求，调用 EventService 执行业务逻辑，格式化 JSON 响应
 */
import type { Request, Response } from "express";
import type { EventService } from "../services/eventService.js";

/**
 * 创建事件控制器，返回各端点的处理函数
 * @param eventService 事件服务实例
 */
export function createEventController(eventService: EventService) {
  return {
    /**
     * 获取事件列表，支持 ?category= 查询参数筛选
     * GET /api/events
     */
    async listEvents(req: Request, res: Response) {
      const category = req.query.category as string | undefined;
      const events = eventService.getAllEvents(category);
      res.status(200).json({ data: events });
    },

    /**
     * 创建新事件
     * POST /api/events
     */
    async createEvent(req: Request, res: Response) {
      const event = eventService.createEvent(req.body);
      res.status(201).json({ data: event });
    },

    /**
     * 更新已有事件
     * PUT /api/events/:id
     */
    async updateEvent(req: Request, res: Response) {
      const id = Number(req.params.id);
      const event = eventService.updateEvent(id, req.body);
      res.status(200).json({ data: event });
    },

    /**
     * 删除事件
     * DELETE /api/events/:id
     */
    async deleteEvent(req: Request, res: Response) {
      const id = Number(req.params.id);
      eventService.deleteEvent(id);
      res.status(204).send();
    },
  };
}
