/**
 * Sessão do administrador (Google via Supabase Auth, fluxo implícito).
 * A autorização real é sempre feita no servidor (/api/admin) pelo e-mail verificado.
 */
export const SUPABASE_URL = 'https://nqdzhtfejmxynjfwadmi.supabase.co';
// Chave pública (anon) — mesma já embutida no aplicativo Desktop.
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xZHpodGZlam14eW5qZndhZG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODc5ODUsImV4cCI6MjEwNzY2Mzk4NX0.' +
  'uB6inMhepEaoQVeTj_KHFcIrjsOshP7sjXWcGQq8deY';

const SESSION_KEY = 'nfse_admin_session';
export const LOGIN_PENDING_KEY = 'nfse_admin_login_pending';

export interface AdminSession {
  access_token: string;
  refresh_token: string;
  expires_at: number; // epoch em segundos
}

export function startAdminGoogleLogin(): void {
  localStorage.setItem(LOGIN_PENDING_KEY, '1');
  const redirect = encodeURIComponent(`${window.location.origin}/admin`);
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirect}`;
}

export function captureSessionFromHash(): AdminSession | null {
  if (!window.location.hash.includes('access_token=')) return null;
  const p = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const access_token = p.get('access_token');
  const refresh_token = p.get('refresh_token') || '';
  if (!access_token) return null;
  const expiresIn = parseInt(p.get('expires_in') || '3600', 10);
  const expires_at = parseInt(p.get('expires_at') || '', 10) || Math.floor(Date.now() / 1000) + expiresIn;
  const session = { access_token, refresh_token, expires_at };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.removeItem(LOGIN_PENDING_KEY);
  window.history.replaceState({}, document.title, window.location.pathname);
  return session;
}

export function loadSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Devolve um access_token válido, renovando com o refresh_token se necessário. */
export async function getValidAccessToken(): Promise<string | null> {
  const s = loadSession();
  if (!s) return null;
  if (s.expires_at - 60 > Math.floor(Date.now() / 1000)) return s.access_token;
  if (!s.refresh_token) {
    clearSession();
    return null;
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const d = await res.json();
    const next: AdminSession = {
      access_token: d.access_token,
      refresh_token: d.refresh_token || s.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    return next.access_token;
  } catch {
    return null;
  }
}

/** Pergunta ao servidor se a sessão salva pertence ao administrador. */
export async function checkIsAdmin(): Promise<boolean> {
  const token = await getValidAccessToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'me', accessToken: token }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
