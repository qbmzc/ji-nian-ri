/**
 * 错误处理中间件单元测试
 */
import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "../middleware/errorHandler.js";
import { ValidationError, NotFoundError } from "../services/eventService.js";

/**
 * 创建模拟的 Express Response 对象
 */
function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const mockReq = {} as Request;
const mockNext = vi.fn() as NextFunction;

describe("errorHandler 中间件", () => {
  it("ValidationError 应返回 400 和字段级错误详情", () => {
    const details = [{ field: "name", message: "Name is required" }];
    const err = new ValidationError(details);
    const res = createMockResponse();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
      },
    });
  });

  it("ValidationError 应包含多个字段错误", () => {
    const details = [
      { field: "name", message: "Name is required" },
      { field: "date", message: "Date must be in YYYY-MM-DD format" },
    ];
    const err = new ValidationError(details);
    const res = createMockResponse();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
      },
    });
  });

  it("NotFoundError 应返回 404 和错误消息", () => {
    const err = new NotFoundError("Event not found");
    const res = createMockResponse();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "NOT_FOUND",
        message: "Event not found",
      },
    });
  });

  it("未知错误应返回 500 和通用错误信息", () => {
    const err = new Error("Something went wrong");
    const res = createMockResponse();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith("Unexpected error:", err);
    consoleSpy.mockRestore();
  });
});
