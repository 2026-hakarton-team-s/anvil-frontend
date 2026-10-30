import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 화면은 항상 상대 경로 /api 로 호출하고, 개발 서버가 백엔드로 전달한다 (CORS 설정 불필요)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': env.VITE_API_BASE || 'http://localhost:8080' },
    },
  };
});
