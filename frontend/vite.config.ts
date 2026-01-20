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
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        'src/main.tsx',
        '**/src/components/ui/**',
        '**/src/components/AppSidebar.tsx',
        '**/src/components/LoginForm.tsx',
        '**/src/components/NavMain.tsx',
        '**/src/components/SignupForm.tsx',
        '**/src/components/Spinner.tsx',
        '**/src/components/CountUp.tsx',
        '**/src/components/NavUnified.tsx',
        '**/src/components/NavUser.tsx',
        '**/src/components/SplitText.tsx',
        '**/src/components/TeamSwitcher.tsx',
        '**/src/components/table.tsx',
        '**/src/components/charts/**',
        '**/src/components/dataTable/**',
        '**/src/components/dialogs/**',
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
