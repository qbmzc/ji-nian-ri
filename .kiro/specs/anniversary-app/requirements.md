# 需求文档

## 简介

纪念日应用是一个用于记录和管理重要日期（如恋爱纪念日、生日、结婚纪念日等）的 Web 应用。用户可以添加、编辑、删除纪念日事件，应用会自动计算距离每个纪念日已经过去或即将到来的天数。应用支持 Docker 部署。

## 术语表

- **Anniversary_App**：纪念日应用系统，包含前端界面和后端服务
- **Event**：纪念日事件，包含名称、日期、日历类型、分类、图标等信息
- **Calendar_Type**：日历类型，支持公历（solar）和农历（lunar）两种
- **Category**：事件分类，如"恋爱"、"生日"、"纪念日"、"节日"等
- **Dashboard**：仪表盘/首页，展示所有纪念日事件的概览信息
- **Day_Counter**：天数计算器，计算从事件日期到当前日期的天数差
- **API_Server**：后端 API 服务，处理数据存储和业务逻辑
- **Frontend**：前端界面，提供用户交互的 Web 页面

## 需求

### 需求 1：纪念日事件管理

**用户故事：** 作为用户，我想要创建、查看、编辑和删除纪念日事件，以便管理我的重要日期。

#### 验收标准

1. WHEN 用户提交一个包含名称和日期的新事件表单，THE Anniversary_App SHALL 创建该事件并将其持久化存储
2. WHEN 用户请求查看事件列表，THE Anniversary_App SHALL 返回所有已创建的事件，按日期排序
3. WHEN 用户提交对已有事件的修改，THE Anniversary_App SHALL 更新该事件的信息并持久化存储
4. WHEN 用户确认删除一个事件，THE Anniversary_App SHALL 从存储中移除该事件
5. IF 用户提交的事件缺少名称或日期，THEN THE Anniversary_App SHALL 返回明确的验证错误信息
6. THE Anniversary_App SHALL 为每个事件存储以下字段：名称、日期、日历类型（公历/农历）、分类、备注、图标
7. WHEN 用户创建或编辑事件时，THE Anniversary_App SHALL 允许用户选择日历类型为公历或农历
8. WHEN 事件的日历类型为农历，THE Anniversary_App SHALL 将农历日期转换为公历日期用于天数计算
9. WHEN 事件的日历类型为农历，THE Dashboard SHALL 同时显示农历日期和对应的公历日期

### 需求 2：天数计算与展示

**用户故事：** 作为用户，我想要看到每个纪念日距今已经过去了多少天或还有多少天到来，以便直观了解时间。

#### 验收标准

1. WHEN 用户查看 Dashboard，THE Day_Counter SHALL 计算每个事件日期与当前日期之间的天数差
2. WHEN 事件日期早于当前日期，THE Day_Counter SHALL 显示"已经 X 天"的正向计数
3. WHEN 事件日期晚于当前日期，THE Day_Counter SHALL 显示"还有 X 天"的倒计时
4. WHEN 事件日期等于当前日期，THE Day_Counter SHALL 显示"就是今天"的提示
5. THE Day_Counter SHALL 每次页面加载时重新计算天数，确保数据实时准确
6. WHEN 事件日历类型为农历，THE Day_Counter SHALL 基于农历日期转换后的公历日期进行天数计算

### 需求 3：Dashboard 首页展示

**用户故事：** 作为用户，我想要在首页看到所有纪念日的概览卡片，以便快速浏览重要日期。

#### 验收标准

1. WHEN 用户访问首页，THE Dashboard SHALL 以卡片形式展示所有纪念日事件
2. THE Dashboard SHALL 在每张卡片上显示事件名称、日期、天数计数和分类图标
3. THE Dashboard SHALL 支持按分类筛选事件
4. THE Dashboard SHALL 将最近即将到来的纪念日排列在显眼位置
5. WHILE 系统中没有任何事件，THE Dashboard SHALL 显示引导用户创建第一个纪念日的提示

### 需求 4：事件分类管理

**用户故事：** 作为用户，我想要为纪念日事件设置分类，以便更好地组织和筛选事件。

#### 验收标准

1. THE Anniversary_App SHALL 提供预设分类：恋爱、生日、纪念日、节日、其他
2. WHEN 用户创建或编辑事件时，THE Anniversary_App SHALL 允许用户从预设分类中选择一个分类
3. WHEN 用户按分类筛选，THE Dashboard SHALL 仅显示属于所选分类的事件
4. THE Anniversary_App SHALL 为每个分类分配一个可区分的图标或颜色

### 需求 5：响应式前端界面

**用户故事：** 作为用户，我想要在手机和电脑上都能舒适地使用纪念日应用，以便随时随地查看。

#### 验收标准

1. THE Frontend SHALL 采用响应式设计，适配移动端（宽度 < 768px）和桌面端（宽度 >= 768px）
2. WHILE 在移动端访问，THE Frontend SHALL 以单列布局展示事件卡片
3. WHILE 在桌面端访问，THE Frontend SHALL 以多列网格布局展示事件卡片
4. THE Frontend SHALL 提供简洁、温馨的视觉风格，使用柔和的配色方案

### 需求 6：RESTful API 服务

**用户故事：** 作为开发者，我想要通过 RESTful API 管理纪念日数据，以便前后端分离部署。

#### 验收标准

1. THE API_Server SHALL 提供以下 RESTful 端点：GET /api/events（列表）、POST /api/events（创建）、PUT /api/events/{id}（更新）、DELETE /api/events/{id}（删除）
2. THE API_Server SHALL 使用 JSON 格式进行请求和响应的数据交换
3. WHEN API 请求成功，THE API_Server SHALL 返回对应的 HTTP 2xx 状态码和响应数据
4. IF API 请求的资源不存在，THEN THE API_Server SHALL 返回 HTTP 404 状态码和错误描述
5. IF API 请求的数据格式无效，THEN THE API_Server SHALL 返回 HTTP 400 状态码和验证错误详情
6. FOR ALL valid Event objects, 通过 API 创建后再通过 API 查询 SHALL 返回等价的 Event 对象（round-trip 属性）

### 需求 7：数据持久化

**用户故事：** 作为用户，我想要我的纪念日数据在应用重启后依然保留，以便数据不会丢失。

#### 验收标准

1. THE Anniversary_App SHALL 使用 SQLite 数据库进行数据持久化存储
2. WHEN 应用启动时，THE Anniversary_App SHALL 自动创建或迁移数据库表结构
3. WHEN 应用重启后，THE Anniversary_App SHALL 保留所有之前创建的事件数据
4. THE Anniversary_App SHALL 将数据库文件存储在可配置的路径下，默认为应用目录下的 data/ 文件夹

### 需求 8：Docker 部署支持

**用户故事：** 作为运维人员，我想要通过 Docker 一键部署纪念日应用，以便快速搭建服务。

#### 验收标准

1. THE Anniversary_App SHALL 提供 Dockerfile，支持构建包含前后端的单一容器镜像
2. THE Anniversary_App SHALL 提供 docker-compose.yml 文件，支持一键启动服务
3. WHEN 使用 Docker 部署时，THE Anniversary_App SHALL 通过环境变量支持端口配置（默认 8080）
4. WHEN 使用 Docker 部署时，THE Anniversary_App SHALL 支持通过 volume 挂载持久化数据库文件


