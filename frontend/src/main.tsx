import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { TOAST_CONFIG } from './lib/toast-config'
import { GOOGLE_CLIENT_ID } from './lib/google-outh.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
    </GoogleOAuthProvider>
  </StrictMode>,
)
