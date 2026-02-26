/**
 * 前端 API 客户端
 * 封装与后端 RESTful API 的通信，处理 JSON 请求/响应和错误
 */
import type {
  EventWithDays,
  Event,
  CreateEventInput,
  UpdateEventInput,
} from "../../shared/types.js";

// API 基础路径（同源，相对路径）
const API_BASE = "/api/events";

/**
 * API 错误响应的类型定义
 */
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

/**
 * 处理 API 响应，解析 JSON 并处理错误
 * 对于非 2xx 响应，抛出包含服务端错误信息的 Error
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // 204 No Content 无响应体
  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    const errorBody = body as ApiErrorResponse;
    const message = errorBody.error?.message ?? "Request failed";
    throw new Error(message);
  }

  // 成功响应的数据包裹在 { data: ... } 中
  return body.data as T;
}

/**
 * 获取事件列表，可选按分类筛选
 * GET /api/events?category=xxx
 */
export async function fetchEvents(
  category?: string
): Promise<EventWithDays[]> {
  const url = category
    ? `${API_BASE}?category=${encodeURIComponent(category)}`
    : API_BASE;

  const response = await fetch(url);
  return handleResponse<EventWithDays[]>(response);
}

/**
 * 创建新事件
 * POST /api/events
 */
export async function createEvent(
  input: CreateEventInput
): Promise<Event> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Event>(response);
}

/**
 * 更新已有事件
 * PUT /api/events/:id
 */
export async function updateEvent(
  id: number,
  input: UpdateEventInput
): Promise<Event> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handleResponse<Event>(response);
}

/**
 * 删除事件
 * DELETE /api/events/:id
 */
export async function deleteEvent(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  return handleResponse<void>(response);
}
