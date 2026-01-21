import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-recharts'
            if (id.includes('@tanstack/react-table')) return 'vendor-tanstack-table'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('@radix-ui')) return 'vendor-radix'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    env: {
      VITE_API_URL: 'http://localhost:3000/api'
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        'src/main.tsx',
        'dist/**',
        'database/**',
      ],
      thresholds: {
        lines: 23,
        functions: 7,
        branches: 3,
        statements: 23,
      },
    },
  },
})
