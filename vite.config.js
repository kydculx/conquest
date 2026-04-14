import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // 배포(빌드) 시에는 저장소 이름인 /conquest/를 사용하고, 로컬 개발 시에는 /를 사용합니다.
  base: command === 'build' ? '/conquest/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    origin: 'http://0.0.0.0:5173',
  }
}))
