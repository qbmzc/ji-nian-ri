/**
 * React 应用入口
 * 挂载 App 根组件到 #root 节点
 */
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import "./styles/global.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(<App />);
