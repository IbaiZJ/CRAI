import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { TOAST_CONFIG } from './lib/toast-config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position={TOAST_CONFIG.position}
          expand={TOAST_CONFIG.expand}
          richColors={TOAST_CONFIG.richColors}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
