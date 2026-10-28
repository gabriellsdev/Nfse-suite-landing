import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AdminPanel from './components/AdminPanel.tsx'
import { LOGIN_PENDING_KEY } from './utils/adminSession.ts'

const container = document.getElementById('root')!

const isAdminRoute = window.location.pathname.replace(/\/$/, '') === '/admin'

// Fallback: se o Supabase devolver o login do admin na raiz (URL de redirect não liberada),
// reencaminha para /admin preservando o token.
if (
  !isAdminRoute &&
  window.location.hash.includes('access_token=') &&
  localStorage.getItem(LOGIN_PENDING_KEY)
) {
  window.location.replace('/admin' + window.location.hash)
} else if (isAdminRoute) {
  // /admin é só cliente: descarta o HTML pré-renderizado da landing page
  container.innerHTML = ''
  createRoot(container).render(
    <StrictMode>
      <AdminPanel />
    </StrictMode>
  )
} else if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <StrictMode>
      <App />
    </StrictMode>
  )
} else {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
