import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { getConsentStatus, setConsentChoice, type ConsentStatus } from '../utils/analytics';

export default function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus>('accepted'); // Inicializa como accepted para não piscar no SSR

  useEffect(() => {
    setStatus(getConsentStatus());
  }, []);

  if (status !== 'unset') {
    return null;
  }

  const handleAccept = () => {
    setConsentChoice(true);
    setStatus('accepted');
  };

  const handleDecline = () => {
    setConsentChoice(false);
    setStatus('declined');
  };

  return (
    <aside
      role="region"
      aria-label="Consentimento de Cookies e Privacidade"
      className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 sm:p-4 shadow-xl text-slate-200">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
            <Cookie className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                Privacidade & Cookies
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/20">
                  LGPD
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-2.5">
              Utilizamos cookies essenciais e de prevenção a fraudes no checkout seguro da <strong>Stripe Brasil</strong> (PCI-DSS), além de métricas anônimas com sua permissão. Nenhum dado fiscal ou de cartão é armazenado em nossos servidores. Veja nossa{' '}
              <a
                href="./privacidade.html"
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:text-teal-300 underline font-medium"
              >
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 py-1.5 px-2.5 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer text-center"
          >
            Apenas Essenciais
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-1.5 px-2.5 text-[11px] font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs cursor-pointer text-center"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </aside>
  );
}
