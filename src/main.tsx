import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { initAnalytics } from './utils/analytics'

// 新しいデプロイを検知したら即座に更新を適用
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true).catch(() => {})
  },
})

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
