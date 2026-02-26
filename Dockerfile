# ============================================
# 阶段 1：构建前端和后端
# ============================================
FROM node:18-alpine AS build

WORKDIR /app

# 先复制依赖文件，利用 Docker 层缓存
COPY package.json package-lock.json ./

# 安装所有依赖（包括 devDependencies，构建需要）
RUN npm ci

# 复制源代码和配置文件
COPY tsconfig.json tsconfig.server.json tsconfig.client.json vite.config.ts index.html ./
COPY src/ src/

# 构建前端（Vite build，输出到 dist/client/）
RUN npm run build:client

# 构建后端（TypeScript 编译，输出到 dist/server/）
RUN npm run build:server

# ============================================
# 阶段 2：生产运行环境
# ============================================
FROM node:18-alpine AS production

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json ./

# 仅安装生产依赖（better-sqlite3 原生模块需要在目标环境编译）
RUN npm ci --omit=dev

# 从构建阶段复制前端构建产物
COPY --from=build /app/dist/client/ dist/client/

# 从构建阶段复制后端构建产物
COPY --from=build /app/dist/server/ dist/server/

# 创建数据目录（SQLite 数据库存储位置）
RUN mkdir -p data

# 设置端口环境变量，默认 8080
ENV PORT=8080

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["node", "dist/server/index.js"]
