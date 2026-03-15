import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages では /リポジトリ名/ がベースパスになる（Actions で VITE_BASE_PATH を設定）
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    host: true, // スマホなど LAN 内の端末から 192.168.x.x:5173 でアクセス可能に
  },
})
