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
    <div
      role="region"
      aria-label="Consentimento de Cookies e Privacidade"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-2">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              Privacidade e Cookies
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                LGPD
              </span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Utilizamos cookies essenciais para o funcionamento do site e, com a sua permissão, métricas anônimas de navegação. Nenhum dado fiscal ou de certificado é coletado. Consulte nossa{' '}
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

        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Apenas Essenciais
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm shadow-teal-900/30"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}
