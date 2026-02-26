# 实施计划：纪念日应用（Anniversary App）

## 概述

基于 React + TypeScript + Express + SQLite 技术栈，按照后端优先、前端跟进的顺序实施。先搭建项目结构和共享类型，再实现后端数据层和 API，然后构建前端界面，最后完成 Docker 部署配置。

## 任务列表

- [x] 1. 项目初始化与共享类型定义
  - [x] 1.1 初始化项目结构和依赖安装
    - 创建 monorepo 目录结构：`src/server/`、`src/client/`、`src/shared/`
    - 初始化 `package.json`，安装核心依赖：react、react-dom、typescript、express、better-sqlite3、lunar-javascript、vite
    - 安装开发依赖：vitest、fast-check、@types/express、@types/better-sqlite3
    - 配置 `tsconfig.json`（服务端和客户端各一份）
    - 配置 Vite 构建（`vite.config.ts`）
    - _需求：8.1_

  - [x] 1.2 定义共享类型和常量
    - 在 `src/shared/types.ts` 中定义 `Event`、`CalendarType`、`Category`、`LunarDate`、`DayCalculation`、`EventWithDays`、`CreateEventInput`、`UpdateEventInput` 接口
    - 在 `src/shared/constants.ts` 中定义预设分类列表、分类图标映射、默认值
    - _需求：1.6, 1.7, 4.1, 4.4_

- [x] 2. 后端数据库层实现
  - [x] 2.1 实现 SQLite 数据库初始化和 EventRepository
    - 创建 `src/server/db/database.ts`
    - 实现数据库连接管理，支持可配置的数据库文件路径（默认 `data/anniversary.db`）
    - 实现 `initialize()` 方法：自动创建 `events` 表和索引
    - 实现 `findAll(category?)`、`findById(id)`、`insert(event)`、`update(id, event)`、`remove(id)` 方法
    - 处理 snake_case（数据库字段）到 camelCase（TypeScript 字段）的映射
    - _需求：7.1, 7.2, 7.4, 1.1, 1.2, 1.3, 1.4_

  - [ ]* 2.2 编写数据库层单元测试
    - 测试数据库初始化自动创建表结构
    - 测试可配置数据库路径
    - 测试 CRUD 操作的基本功能
    - _需求：7.2, 7.4_

- [x] 3. 后端服务层实现
  - [x] 3.1 实现农历公历转换工具函数
    - 创建 `src/server/services/lunarService.ts`
    - 使用 `lunar-javascript` 库实现 `lunarToSolar(lunarDate)` 和 `solarToLunar(solarDate)` 函数
    - 实现农历日期有效性验证 `isValidLunarDate(date)`
    - _需求：1.8, 1.9_

  - [ ]* 3.2 编写农历公历互转属性测试
    - **属性 10：农历公历互转一致性**
    - 使用 fast-check 生成随机有效农历日期，验证转公历再转回的 round-trip 一致性
    - 创建 `src/server/__tests__/lunarConversion.property.test.ts`
    - **验证需求：1.8**

  - [x] 3.3 实现天数计算函数
    - 在 `src/server/services/eventService.ts` 中实现 `calculateDays(eventDate, calendarType, today?)` 方法
    - 处理三种情况：过去（"已经 X 天"）、未来（"还有 X 天"）、今天（"就是今天"）
    - 农历日期自动转换为公历后再计算
    - _需求：2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 3.4 编写天数计算属性测试
    - **属性 6：天数计算正确性**
    - 使用 fast-check 生成随机日期对和日历类型，验证计算结果的 type 和 days 正确性
    - 创建 `src/server/__tests__/dayCalculation.property.test.ts`
    - **验证需求：2.1, 2.2, 2.3, 2.4, 2.6**

  - [x] 3.5 实现 EventService 完整业务逻辑
    - 实现 `getAllEvents(category?)`：查询事件列表，附带天数计算和农历信息，按日期排序
    - 实现 `createEvent(input)`：验证输入，创建事件
    - 实现 `updateEvent(id, input)`：验证事件存在性和输入，更新事件
    - 实现 `deleteEvent(id)`：验证事件存在性，删除事件
    - 实现输入验证逻辑（名称必填、日期格式、分类枚举等）
    - _需求：1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.1, 2.5_

  - [ ]* 3.6 编写 EventService 属性测试
    - **属性 1：事件创建-查询 Round-Trip**
    - **属性 2：事件列表按日期排序**
    - **属性 3：事件更新持久化**
    - **属性 4：事件删除移除**
    - **属性 5：无效输入拒绝**
    - **属性 7：分类筛选正确性**
    - 创建 `src/server/__tests__/eventService.property.test.ts`
    - **验证需求：1.1, 1.2, 1.3, 1.4, 1.5, 6.6, 3.3, 4.3, 6.4, 6.5**

- [x] 4. 后端控制器和路由层实现
  - [x] 4.1 实现错误处理类和全局中间件
    - 创建 `src/server/middleware/errorHandler.ts`
    - 定义 `ValidationError`、`NotFoundError` 自定义错误类
    - 实现全局错误处理中间件，按错误类型返回对应 HTTP 状态码和 JSON 错误响应
    - _需求：6.3, 6.4, 6.5_

  - [x] 4.2 实现 EventController 和路由注册
    - 创建 `src/server/controllers/eventController.ts`，实现 `listEvents`、`createEvent`、`updateEvent`、`deleteEvent` 方法
    - 创建 `src/server/routes/eventRoutes.ts`，注册 RESTful 端点：GET/POST `/api/events`、PUT/DELETE `/api/events/:id`
    - 控制器调用 EventService 处理业务逻辑，格式化 JSON 响应
    - _需求：6.1, 6.2, 6.3_

  - [x] 4.3 实现 Express 应用入口
    - 创建 `src/server/app.ts`，配置 Express 应用：JSON 解析、路由挂载、错误处理中间件、静态文件托管
    - 创建 `src/server/index.ts`，启动服务器，监听可配置端口（默认 8080）
    - _需求：6.1, 8.3_

  - [ ]* 4.4 编写 API 端点单元测试
    - 测试各端点的 HTTP 状态码和响应格式
    - 测试 404 和 400 错误响应
    - 创建 `src/server/__tests__/eventController.test.ts`
    - **属性 8：不存在的资源返回 404**
    - **验证需求：6.1, 6.3, 6.4, 6.5**

- [x] 5. 检查点 - 后端功能验证
  - 确保所有后端测试通过，如有问题请向用户确认。

- [x] 6. 前端 API 客户端和基础组件
  - [x] 6.1 实现前端 API 客户端
    - 创建 `src/client/api/eventApi.ts`
    - 封装 `fetchEvents(category?)`、`createEvent(input)`、`updateEvent(id, input)`、`deleteEvent(id)` 方法
    - 使用 fetch API，处理 JSON 请求/响应和错误
    - _需求：6.1, 6.2_

  - [x] 6.2 实现 DayCounter 和 EventCard 组件
    - 创建 `src/client/components/DayCounter.tsx`：根据 `DayCalculation` 展示"已经 X 天"/"还有 X 天"/"就是今天"
    - 创建 `src/client/components/EventCard.tsx`：展示事件名称、日期、天数计数、分类图标；农历事件同时显示农历和公历日期
    - 创建对应的 CSS Modules 样式文件
    - _需求：2.2, 2.3, 2.4, 3.2, 1.9_

  - [x] 6.3 实现 CategoryFilter 和 EmptyState 组件
    - 创建 `src/client/components/CategoryFilter.tsx`：展示预设分类标签，支持点击筛选
    - 创建 `src/client/components/EmptyState.tsx`：无事件时显示引导提示，引导用户创建第一个纪念日
    - 创建对应的 CSS Modules 样式文件
    - _需求：3.3, 3.5, 4.1, 4.2, 4.3, 4.4_

- [x] 7. 前端页面和表单实现
  - [x] 7.1 实现 EventForm 事件表单组件
    - 创建 `src/client/components/EventForm.tsx`
    - 支持创建和编辑两种模式
    - 表单字段：名称（必填）、日期（必填）、日历类型（公历/农历切换）、分类（下拉选择）、备注、图标
    - 前端表单验证：名称和日期必填校验
    - _需求：1.1, 1.3, 1.5, 1.6, 1.7_

  - [x] 7.2 实现 Dashboard 首页
    - 创建 `src/client/pages/Dashboard.tsx`
    - 加载事件列表，按分类筛选，展示事件卡片网格
    - 最近即将到来的纪念日排列在显眼位置
    - 无事件时显示 EmptyState
    - 支持打开 EventForm 进行创建/编辑/删除操作
    - _需求：2.1, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 7.3 实现 App 根组件和入口文件
    - 创建 `src/client/App.tsx`：管理全局状态（事件列表、筛选条件、表单显示状态）
    - 创建 `src/client/main.tsx`：React 应用入口
    - 创建 `index.html`：HTML 模板
    - _需求：3.1_

- [x] 8. 响应式样式实现
  - [x] 8.1 实现全局样式和响应式布局
    - 创建 `src/client/styles/global.css`：全局样式重置、柔和配色方案、CSS 变量定义
    - 实现响应式断点：移动端（< 768px）单列布局，桌面端（>= 768px）多列网格布局
    - 确保所有组件在两种布局下正常展示
    - _需求：5.1, 5.2, 5.3, 5.4_

  - [ ]* 8.2 编写前端组件测试
    - 测试 Dashboard 空状态显示引导提示
    - 测试 EventCard 显示完整信息（名称、日期、天数、图标）
    - 测试 EventForm 表单验证
    - 创建 `src/client/__tests__/Dashboard.test.tsx`、`EventCard.test.tsx`、`EventForm.test.tsx`
    - _需求：3.2, 3.5, 1.5_

- [x] 9. 检查点 - 前端功能验证
  - 确保所有前端和后端测试通过，如有问题请向用户确认。

- [x] 10. Docker 部署配置
  - [x] 10.1 创建 Dockerfile
    - 使用多阶段构建：第一阶段构建前端（Vite build），第二阶段构建后端（TypeScript 编译），第三阶段运行
    - 前端构建产物由 Express 静态托管
    - 支持通过环境变量 `PORT` 配置端口（默认 8080）
    - _需求：8.1, 8.3_

  - [x] 10.2 创建 docker-compose.yml
    - 配置服务、端口映射、环境变量
    - 配置 volume 挂载 `data/` 目录，持久化 SQLite 数据库文件
    - _需求：8.2, 8.4_

- [x] 11. 数据持久化验证
  - [ ]* 11.1 编写数据跨重启持久化属性测试
    - **属性 9：数据跨重启持久化**
    - 创建事件后重新初始化数据库连接，验证数据完整性
    - 创建 `src/server/__tests__/database.test.ts`
    - **验证需求：7.3**

- [x] 12. 最终检查点 - 全部功能验证
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的子任务为可选任务，可跳过以加速 MVP 开发
- 每个任务引用了对应的需求编号，确保需求可追溯
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证系统的通用正确性属性，单元测试验证具体示例和边界情况
