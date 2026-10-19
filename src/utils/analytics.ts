/**
 * Utilitário de Analytics com respeito integral ao consentimento de cookies (LGPD / GDPR).
 * Scripts e cookies de rastreamento NÃO são carregados até que o visitante aceite expressamente.
 */

export type ConsentStatus = 'accepted' | 'declined' | 'unset';

const CONSENT_STORAGE_KEY = 'nfse_cookie_consent_choice';

export function getConsentStatus(): ConsentStatus {
  if (typeof window === 'undefined') return 'unset';
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === 'accepted' || stored === 'declined') {
    return stored;
  }
  return 'unset';
}

export function setConsentChoice(granted: boolean): void {
  if (typeof window === 'undefined') return;
  const status: ConsentStatus = granted ? 'accepted' : 'declined';
  localStorage.setItem(CONSENT_STORAGE_KEY, status);

  if (granted) {
    initAnalyticsIfConsented();
  }

  // Notifica ouvintes locais
  window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: { status } }));
}

export function initAnalyticsIfConsented(): void {
  if (typeof window === 'undefined') return;
  if (getConsentStatus() !== 'accepted') {
    return; // Não carrega nenhum cookie ou script de terceiros sem aceite
  }

  const analyticsId = import.meta.env.VITE_ANALYTICS_ID || (window as any).NFSE_ANALYTICS_ID;
  if (!analyticsId) {
    // Modo anônimo local ativo
    return;
  }

  // Se já foi injetado o script, não duplica
  if (document.getElementById('nfse-gtag-script')) return;

  const script = document.createElement('script');
  script.id = 'nfse-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;

  gtag('js', new Date());
  gtag('config', analyticsId, {
    anonymize_ip: true, // Mascara IP para proteção de privacidade
    cookie_flags: 'SameSite=Strict;Secure'
  });
}

export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (getConsentStatus() !== 'accepted') return;

  const gtag = (window as any).gtag;
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}
