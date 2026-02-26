/**
 * 事件路由
 * 注册 RESTful API 端点，将请求分发到事件控制器
 */
import { Router } from "express";
import type { EventService } from "../services/eventService.js";
import { createEventController } from "../controllers/eventController.js";

/**
 * 创建事件路由，注册 CRUD 端点
 * @param eventService 事件服务实例
 * @returns Express Router 实例
 */
export function createEventRoutes(eventService: EventService): Router {
  const router = Router();
  const controller = createEventController(eventService);

  // GET /api/events - 获取事件列表，支持 ?category= 筛选
  router.get("/", controller.listEvents);

  // POST /api/events - 创建新事件
  router.post("/", controller.createEvent);

  // PUT /api/events/:id - 更新事件
  router.put("/:id", controller.updateEvent);

  // DELETE /api/events/:id - 删除事件
  router.delete("/:id", controller.deleteEvent);

  return router;
}
