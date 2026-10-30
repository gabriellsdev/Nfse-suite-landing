import { useEffect, useState, useRef } from 'react';
import { X, ShieldCheck, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { loadStripe, type StripeEmbeddedCheckout } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from '../version';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'pro' | 'multi';
}

export default function StripeCheckoutModal({ isOpen, onClose, plan }: StripeCheckoutModalProps) {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutRef = useRef<StripeEmbeddedCheckout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const planTitle = plan === 'multi' ? 'Plano Multi-CNPJ (R$ 129/mês)' : 'Plano Pro Individual (R$ 49/mês)';

  useEffect(() => {
    if (!isOpen) {
      if (checkoutRef.current) {
        checkoutRef.current.destroy();
        checkoutRef.current = null;
      }
      setLoading(true);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    async function initCheckout() {
      try {
        const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
        if (!stripe) {
          throw new Error('Não foi possível carregar a biblioteca do Stripe. Verifique sua conexão.');
        }

        const fetchClientSecret = async () => {
          const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
          });

          const data = await res.json();
          if (!res.ok || !data.clientSecret) {
            throw new Error(data.error || 'Falha ao iniciar sessão de pagamento no servidor.');
          }
          return data.clientSecret;
        };

        const embeddedCheckout = typeof stripe.createEmbeddedCheckoutPage === 'function'
          ? await stripe.createEmbeddedCheckoutPage({ fetchClientSecret })
          : await (stripe as any).initEmbeddedCheckout({ fetchClientSecret });

        if (!isMounted) {
          embeddedCheckout.destroy();
          return;
        }

        checkoutRef.current = embeddedCheckout;
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          embeddedCheckout.mount(containerRef.current);
        }
        setLoading(false);
      } catch (err: any) {
        console.error('[Stripe Embedded Checkout] Erro:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Erro ao carregar o checkout do Stripe.');
          setLoading(false);
        }
      }
    }

    initCheckout();

    return () => {
      isMounted = false;
      if (checkoutRef.current) {
        checkoutRef.current.destroy();
        checkoutRef.current = null;
      }
    };
  }, [isOpen, plan]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stripe-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container do Modal Compacto */}
      <div className="relative w-full max-w-[560px] bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[98vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho Slim */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h2 id="stripe-modal-title" className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                {planTitle}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                <Lock className="w-2.5 h-2.5" /> Pagamento em BRL (R$)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Fechar checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo do Checkout Ajustado */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-1 relative min-h-[360px] [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 gap-2">
              <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-600">
                Iniciando checkout seguro do Stripe (BRL)...
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left space-y-2 m-2">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Não foi possível inicializar o pagamento:</span>
              </div>
              <p className="leading-relaxed">{errorMessage}</p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Fechar e tentar novamente
                </button>
              </div>
            </div>
          )}

          {/* O Stripe monta o iframe diretamente aqui */}
          <div ref={containerRef} id="stripe-checkout-container" className="w-full" />
        </div>

        {/* Rodapé Informativo Slim */}
        <div className="px-4 sm:px-5 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 shrink-0">
          <span className="truncate">Cobrança em Reais (BRL / R$) via <strong>Stripe Brasil</strong> • PCI-DSS Nível 1</span>
          <span className="text-teal-700 font-semibold truncate hidden sm:inline">Liberação imediata no software</span>
        </div>
      </div>
    </div>
  );
}
