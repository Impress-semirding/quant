import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    }
  },
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: '',
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9876',
        changeOrigin: true,
      },
    }
  }
})
