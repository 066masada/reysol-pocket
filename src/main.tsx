import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'

// 新しいデプロイを検知したら即座に更新を適用
const updateSW = registerSW({
  onNeedRefresh() {
    updateSW(true).catch(() => {})
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
