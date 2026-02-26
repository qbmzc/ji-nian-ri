/**
 * Express 应用配置
 * 配置 JSON 解析、路由挂载、静态文件托管和错误处理中间件
 */
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { EventRepository } from "./db/database.js";
import { EventService } from "./services/eventService.js";
import { createEventRoutes } from "./routes/eventRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// 获取当前文件目录（ES Module 兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 创建并配置 Express 应用实例
 * 抽取为函数以便于测试
 *
 * @param repository 可选的 EventRepository 实例，未提供时使用默认配置
 * @returns 配置完成的 Express 应用
 */
export function createApp(repository?: EventRepository): express.Express {
  const app = express();

  // JSON 请求体解析中间件
  app.use(express.json());

  // 创建服务层实例
  const repo = repository ?? new EventRepository();
  const eventService = new EventService(repo);

  // 挂载事件 API 路由到 /api/events
  app.use("/api/events", createEventRoutes(eventService));

  // 静态文件托管：前端构建产物目录
  const clientDistPath = path.resolve(__dirname, "../../dist/client");
  app.use(express.static(clientDistPath));

  // SPA 路由回退：非 API 路由且未匹配静态文件时返回 index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });

  // 全局错误处理中间件（必须最后注册）
  app.use(errorHandler);

  return app;
}
