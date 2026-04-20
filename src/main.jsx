import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <p className="fixed bottom-1 right-2 text-xs font-mono text-gray-500 dark:text-gray-400 pointer-events-none select-none z-50">
        v{APP_VERSION}
      </p>
    </ErrorBoundary>
  </StrictMode>,
)
