import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './router.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { EditorProvider } from './contexts/EditorContext.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()

// 加载中的回退界面
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-gray-600">Loading application...</p>
    </div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EditorProvider>
          <RouterProvider 
            router={router} 
            fallbackElement={<LoadingFallback />}
          />
          <Toaster position='top-center' />
        </EditorProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
