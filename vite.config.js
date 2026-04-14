import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 상대 경로('') 설정을 통해 어느 환경(로컬, GitHub Pages 등)에서도 별도 설정 없이 작동하게 합니다.
  base: '', 
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    origin: 'http://0.0.0.0:5173',
  }
})
