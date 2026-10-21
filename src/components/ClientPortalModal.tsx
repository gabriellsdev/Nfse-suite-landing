import { useEffect } from 'react';
import { X, UserCheck, Monitor, HelpCircle, ArrowRight, Download, Mail } from 'lucide-react';
import { DEFAULT_APP_VERSION, DEFAULT_DOWNLOAD_URL } from '../version';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
}

export default function ClientPortalModal({ isOpen, onClose, onOpenContact }: ClientPortalModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-portal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container do Modal */}
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo / Cabeçalho */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-2xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 id="client-portal-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
              Área do Cliente &amp; Licenças
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie seus computadores, planos e suporte do NFSe Nacional Suite.
            </p>
          </div>
        </div>

        {/* Conteúdo em Cards */}
        <div className="space-y-4">
          {/* Card 1: Gestão de Dispositivos */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                <Monitor className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                  Como gerenciar ou desconectar computadores?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  A gestão de dispositivos é feita com segurança pelo próprio aplicativo Desktop. Se atingiu o limite de máquinas do seu plano:
                </p>
                <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside bg-white p-3 rounded-xl border border-slate-200/80 mb-2">
                  <li>Abra o aplicativo <strong>NFSe Nacional Suite</strong> no seu Windows.</li>
                  <li>Clique no seu <strong>e-mail / badge</strong> no canto superior direito.</li>
                  <li>Selecione <strong>&ldquo;Dispositivos Conectados&rdquo;</strong> e clique em <em>Desconectar</em> na máquina que deseja liberar.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Card 2: Assinaturas & Suporte */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">
                  Planos, Faturas e Suporte ao Assinante
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Precisa de alteração de plano, segunda via de comprovante, suporte técnico ou dúvidas sobre sua licença ativa?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenContact();
                    }}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <span>Falar com o Suporte</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="mailto:suporte.nfsebridge@gmail.com"
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
                  >
                    <span>suporte.nfsebridge@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Acesso Rápido a Downloads e Guias */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-900">Precisa reinstalar em outro PC?</div>
              <div className="text-[11px] text-slate-500">Baixe a versão mais recente v{DEFAULT_APP_VERSION} para Windows.</div>
            </div>
            <a
              href={DEFAULT_DOWNLOAD_URL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Baixar v{DEFAULT_APP_VERSION}</span>
            </a>
          </div>
        </div>

        {/* Rodapé com link para os Guias */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <a
            href="./como-baixar-nfse-em-lote.html"
            className="text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Consultar Guia Passo a Passo</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
