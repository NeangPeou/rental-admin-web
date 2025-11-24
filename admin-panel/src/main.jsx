// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './i18n/index.js'
import { SnackbarProvider } from './components/common/Snackbar.jsx'

// This tiny line fixes the "refresh 404" problem once and for all
// when someone opens /owners, /profile, etc. directly
if (import.meta.env.PROD) {
  const base = import.meta.env.BASE_URL || '/'
  if (location.pathname !== base && !location.pathname.startsWith(base)) {
    location.replace(base)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)