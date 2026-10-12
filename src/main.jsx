import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import ToastProvider from './components/Toast.jsx'
import { CartProvider } from './lib/CartContext.jsx'
import { AuthProvider } from './lib/AuthContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'

// Purge any legacy persisted client-side cache from localStorage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
  }
} catch (e) {
  console.warn('Could not clear offline cache:', e);
}

// Client-side caching disabled: queries are always stale and refetched fresh from live database
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // No caching: immediately stale so data is always fetched fresh
      gcTime: 0, // Do not retain cached query data in memory
      refetchOnWindowFocus: true, // Auto-refresh when tab/window is refocused
      refetchOnMount: true, // Always fetch latest data on component mount
      refetchOnReconnect: true,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
)
