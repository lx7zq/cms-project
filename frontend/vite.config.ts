import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  // Project Pages เสิร์ฟที่ https://<user>.github.io/cms-project/
  // ต้อง build ด้วย GITHUB_PAGES=true ไม่งั้น asset path เป็น /assets/... แล้ว 404
  base: process.env.GITHUB_PAGES === 'true' ? '/cms-project/' : '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
