/**
 * 全局错误处理中间件
 * 根据错误类型返回对应的 HTTP 状态码和 JSON 错误响应
 */
import type { Request, Response, NextFunction } from "express";
import { ValidationError, NotFoundError } from "../services/eventService.js";

/**
 * Express 全局错误处理中间件
 * 按错误类型分类处理：
 * - ValidationError → 400 Bad Request
 * - NotFoundError → 404 Not Found
 * - 其他未知错误 → 500 Internal Server Error
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 验证错误：返回 400 和字段级错误详情
  if (err instanceof ValidationError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.details,
      },
    });
    return;
  }

  // 资源不存在：返回 404
  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: err.message,
      },
    });
    return;
  }

  // 未知错误：记录日志，返回 500 通用错误信息
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}
