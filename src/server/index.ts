/**
 * 服务器入口文件
 * 初始化数据库并启动 Express 服务器
 */
import { createApp } from "./app.js";
import { EventRepository } from "./db/database.js";

// 从环境变量读取端口，默认 8080
const PORT = parseInt(process.env.PORT ?? "8080", 10);

// 初始化数据库
const repository = new EventRepository();
repository.initialize();

// 创建并启动应用
const app = createApp(repository);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
