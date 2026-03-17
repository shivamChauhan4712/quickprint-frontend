import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Isse laptop ke network par mobile ko access milega
    port: 5173
  },
  define: {
    global: 'window', // SockJS error fix karne ke liye
  }
})
