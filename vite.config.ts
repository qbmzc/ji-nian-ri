import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite 构建配置（同时作为 vitest 配置）
export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      // 共享模块路径别名
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    // 前端构建输出目录
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  server: {
    // 开发模式下代理 API 请求到后端
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  // vitest 测试配置
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.property.test.ts'],
  },
});
