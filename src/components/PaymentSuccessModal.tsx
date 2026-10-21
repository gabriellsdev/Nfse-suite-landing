import { CheckCircle2, Download, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { CHROME_WEBSTORE_URL } from '../version';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  plan?: string;
  downloadUrl: string;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  email,
  plan,
  downloadUrl,
}: PaymentSuccessModalProps) {
  if (!isOpen) return null;

  const planName = plan === 'multi' ? 'Plano Multi-CNPJ (Até 5 computadores)' : 'Plano Pro Individual';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 id="success-modal-title" className="text-2xl font-black tracking-tight">
            Assinatura Ativada!
          </h2>
          <p className="text-xs text-teal-50 mt-1 max-w-sm mx-auto">
            Obrigado pela confiança. Seu pagamento foi confirmado com sucesso pelo Stripe.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Plano Contratado:</span>
              <span className="font-bold text-slate-900">{planName}</span>
            </div>
            {email && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">E-mail da Conta:</span>
                <span className="font-semibold text-teal-700">{email}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Status da Licença:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Ativa e Liberada
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-900">Como começar a usar agora:</p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>
                <strong>Extensão Chrome:</strong> Instale ou abra a extensão e entre com seu e-mail cadastrado.
              </li>
              <li>
                <strong>Aplicativo Desktop:</strong> Baixe o instalador oficial abaixo e efetue o login.
              </li>
              <li>
                O reconhecimento da sua licença é instantâneo e automático.
              </li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={CHROME_WEBSTORE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all text-center"
            >
              <span>Extensão Chrome</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>

            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-bold text-xs transition-all text-center"
            >
              <Download className="w-3.5 h-3.5 shrink-0 text-slate-700" />
              <span>Baixar App Desktop</span>
            </a>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
            >
              Fechar e continuar navegando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
