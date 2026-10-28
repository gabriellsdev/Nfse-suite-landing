import { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Monitor,
  HelpCircle,
  ArrowRight,
  Download,
  Mail,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2,
  CreditCard,
  ShieldAlert,
  RefreshCw,
  LogOut,
  MessageSquareHeart,
} from 'lucide-react';
import { DEFAULT_APP_VERSION, DEFAULT_DOWNLOAD_URL } from '../version';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
  initialAccessToken?: string | null;
}

interface LicencaInfo {
  id: string;
  email: string;
  cliente_nome?: string;
  plano: string;
  max_computadores: number;
  expira_em?: string | null;
  status: string;
}

interface MaquinaInfo {
  id: string;
  machine_id: string;
  nome_computador?: string;
  sistema_operacional?: string;
  versao_app?: string;
  ultimo_ping?: string;
  ativo: boolean;
}

interface StripeInfo {
  hasStripeCustomer: boolean;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  eligibleFor7DayRefund?: boolean;
}

const PLAN_LABELS: Record<string, string> = {
  pro_individual: 'Plano Pro Individual (Até 2 PCs)',
  multi_cnpj: 'Plano Multi-CNPJ (Até 5 PCs)',
  parceiro: 'Licença de Escritório Parceiro',
  vitalicio: 'Licença Vitalícia',
  trial: 'Avaliação Gratuita (15 Dias)',
};

export default function ClientPortalModal({
  isOpen,
  onClose,
  onOpenContact,
  initialAccessToken,
}: ClientPortalModalProps) {
  const [step, setStep] = useState<'email' | 'otp' | 'dashboard'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [portalToken, setPortalToken] = useState('');

  const [licenca, setLicenca] = useState<LicencaInfo | null>(null);
  const [maquinas, setMaquinas] = useState<MaquinaInfo[]>([]);
  const [stripeInfo, setStripeInfo] = useState<StripeInfo | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado do formulário obrigatório de feedback para cancelamento / reembolso
  const [feedbackMode, setFeedbackMode] = useState<'none' | 'cancel' | 'refund'>('none');
  const [feedbackMotivo, setFeedbackMotivo] = useState('');
  const [feedbackMelhoria, setFeedbackMelhoria] = useState('');

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

  // Se vier um accessToken de Magic Link na URL, autentica automaticamente
  useEffect(() => {
    if (isOpen && initialAccessToken && !portalToken) {
      setLoading(true);
      setErrorMsg(null);
      fetch('/api/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          accessToken: initialAccessToken,
        }),
      })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          if (ok && data.portalToken) {
            setPortalToken(data.portalToken);
            setLicenca(data.licenca);
            setMaquinas(data.maquinas || []);
            setStripeInfo(data.stripeInfo || null);
            setEmail(data.licenca?.email || '');
            setStep('dashboard');
          } else {
            setErrorMsg(data.error || 'Não foi possível validar o link de acesso.');
          }
        })
        .catch(() => {
          setErrorMsg('Erro de conexão ao validar acesso.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, initialAccessToken, portalToken]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Digite o e-mail utilizado na sua assinatura ou login do programa.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_otp',
          email: cleanEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível enviar o código.');
      }
      setChallengeToken(data.challengeToken || '');
      setStep('otp');
      setSuccessMsg(data.message || 'Código enviado para o seu e-mail!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao enviar código de verificação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanCode = otpCode.replace(/\D/g, '').trim();
    if (cleanCode.length < 6) {
      setErrorMsg('Digite o código de 6 dígitos enviado para o seu e-mail.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_otp',
          email: email.trim().toLowerCase(),
          code: cleanCode,
          challengeToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Código inválido ou expirado.');
      }

      setPortalToken(data.portalToken);
      setLicenca(data.licenca);
      setMaquinas(data.maquinas || []);
      setStripeInfo(data.stripeInfo || null);
      setStep('dashboard');
      setSuccessMsg(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao validar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectMachine = async (machineRowId: string, machineName: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActionLoadingId(machineRowId);

    try {
      const res = await fetch('/api/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect_machine',
          portalToken,
          machineRowId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao desconectar computador.');
      }
      setLicenca(data.licenca);
      setMaquinas(data.maquinas || []);
      setSuccessMsg(`Computador "${machineName}" desconectado com sucesso! Vaga liberada.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao desconectar computador.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenBillingPortal = async () => {
    setErrorMsg(null);
    setActionLoadingId('billing');
    try {
      const res = await fetch('/api/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'billing_portal',
          portalToken,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Não foi possível abrir o portal de faturas.');
      }
      window.location.href = data.url;
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao abrir portal de faturamento.');
      setActionLoadingId(null);
    }
  };

  const handleConfirmCancelOrRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!feedbackMotivo) {
      setErrorMsg('Por favor, selecione o motivo principal.');
      return;
    }
    if (feedbackMelhoria.trim().length < 5) {
      setErrorMsg('Por favor, escreva brevemente o que poderíamos melhorar (mínimo de 5 caracteres).');
      return;
    }

    setActionLoadingId('cancel_or_refund');
    try {
      const res = await fetch('/api/client-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel_or_refund',
          portalToken,
          requestType: feedbackMode === 'refund' ? 'refund' : 'cancel',
          motivo: feedbackMotivo,
          melhoria: feedbackMelhoria.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao processar solicitação.');
      }

      setLicenca(data.licenca);
      setMaquinas(data.maquinas || []);
      setStripeInfo(data.stripeInfo || null);
      setFeedbackMode('none');
      setFeedbackMotivo('');
      setFeedbackMelhoria('');
      setSuccessMsg(data.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar solicitação.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    setPortalToken('');
    setLicenca(null);
    setMaquinas([]);
    setStripeInfo(null);
    setOtpCode('');
    setFeedbackMode('none');
    setErrorMsg(null);
    setSuccessMsg(null);
    setStep('email');
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return 'Vitalícia / Permanente';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-portal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container do Modal */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-5 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo / Cabeçalho */}
        <div className="flex items-center justify-between gap-3 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-2xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="client-portal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Área do Cliente &amp; Licenças
              </h2>
              <p className="text-xs text-slate-500">
                Gerencie seus computadores ativos, assinatura, faturas e suporte.
              </p>
            </div>
          </div>

          {step === 'dashboard' && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          )}
        </div>

        {/* Alertas de Erro / Sucesso */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* =====================================================================
            ETAPA 1 & 2: LOGIN POR CÓDIGO DE 6 DÍGITOS NO E-MAIL
           ===================================================================== */}
        {step !== 'dashboard' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span>Acesso Rápido por Código no E-mail</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Informe o e-mail da sua assinatura ou conta Google para gerenciar seus computadores conectados, faturas ou cancelamento direto pelo navegador:
              </p>

              {step === 'email' ? (
                <form onSubmit={handleSendOtp} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail de assinante..."
                    className="flex-1 bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Receber Código no E-mail</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    Enviamos um código para <strong>{email}</strong>. Digite os <strong>6 dígitos</strong> abaixo (ou clique no link de acesso recebido no e-mail):
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="sm:w-44 bg-white border-2 border-teal-500 focus:border-teal-700 rounded-xl px-4 py-2.5 text-center font-mono text-base font-extrabold tracking-[0.3em] text-slate-900 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Validando código...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Validar Código e Acessar Painel</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtpCode('');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-teal-700 hover:underline font-semibold cursor-pointer"
                    >
                      ← Trocar endereço de e-mail
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
                    >
                      Reenviar código
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Card Alternativo: Gestão pelo App Desktop */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-900 mb-1">
                    Também disponível direto no aplicativo Desktop
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No programa instalado no Windows, você também pode clicar no seu <strong>e-mail / badge</strong> no canto superior direito e selecionar <strong>&ldquo;Dispositivos Conectados&rdquo;</strong> para desconectar máquinas a qualquer momento.
                  </p>
                </div>
              </div>
            </div>

            {/* Download & Suporte Rápido */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">Reinstalar em outro PC?</div>
                  <div className="text-[11px] text-slate-500">Instalador v{DEFAULT_APP_VERSION}</div>
                </div>
                <a
                  href={DEFAULT_DOWNLOAD_URL}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Baixar</span>
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900">Precisa de ajuda?</div>
                  <div className="text-[11px] text-slate-600">Atendimento humano</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenContact();
                  }}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Suporte</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            ETAPA 3: PAINEL DO CLIENTE AUTENTICADO
           ===================================================================== */}
        {step === 'dashboard' && licenca && (
          <div className="space-y-5">
            {/* Resumo da Assinatura / Licença */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-[11px] text-slate-400">Conta autenticada</div>
                  <div className="text-sm font-bold text-white">{licenca.email}</div>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    licenca.status === 'ativo'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : licenca.status === 'pendente'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {licenca.status === 'ativo'
                    ? '● Licença Ativa'
                    : licenca.status === 'pendente'
                      ? '● Pagamento Pendente (Carência 3 dias)'
                      : `● ${licenca.status.toUpperCase()}`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="block text-[11px] text-slate-400">Plano Atual</span>
                  <strong className="text-teal-300">
                    {PLAN_LABELS[licenca.plano] || licenca.plano}
                  </strong>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400">Computadores em Uso</span>
                  <strong className="text-white">
                    {maquinas.length} de {licenca.max_computadores} PCs
                  </strong>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-[11px] text-slate-400">
                    {stripeInfo?.cancelAtPeriodEnd ? 'Acesso liberado até' : 'Validade / Renovação'}
                  </span>
                  <strong className="text-white">{formatDate(licenca.expira_em)}</strong>
                </div>
              </div>

              {licenca.status === 'pendente' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Identificamos uma pendência na última renovação. Você possui <strong>3 dias de carência</strong> com acesso liberado para atualizar seu cartão.
                  </span>
                </div>
              )}

              {stripeInfo?.cancelAtPeriodEnd && (
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                  ℹ️ A renovação automática desta assinatura já está cancelada. O seu acesso continua funcionando normalmente até <strong>{formatDate(licenca.expira_em)}</strong>.
                </div>
              )}
            </div>

            {/* Lista de Computadores Conectados */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Computadores Conectados ({maquinas.length}/{licenca.max_computadores})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setActionLoadingId('refresh');
                    const res = await fetch('/api/client-portal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'get_dashboard', portalToken }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setLicenca(data.licenca);
                      setMaquinas(data.maquinas || []);
                      setStripeInfo(data.stripeInfo || null);
                    }
                    setActionLoadingId(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${actionLoadingId === 'refresh' ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              </div>

              {maquinas.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
                  Nenhum computador conectado no momento. Abra o aplicativo no Windows e faça login para ativar.
                </div>
              ) : (
                <div className="space-y-2">
                  {maquinas.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {m.nome_computador || 'Computador Windows'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          ID: {m.machine_id} {m.versao_app ? `• v${m.versao_app}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={actionLoadingId === m.id}
                        onClick={() =>
                          handleDisconnectMachine(m.id, m.nome_computador || m.machine_id)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {actionLoadingId === m.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Desconectar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gestão Financeira, Cartão e Cancelamento / Reembolso */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600" />
                <span>Pagamentos, Faturas e Assinatura</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2.5">
                {stripeInfo?.hasStripeCustomer && (
                  <button
                    type="button"
                    disabled={actionLoadingId === 'billing'}
                    onClick={handleOpenBillingPortal}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === 'billing' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5 text-teal-400" />
                    )}
                    <span>Trocar Cartão / Ver Faturas (Stripe)</span>
                  </button>
                )}

                {licenca.status !== 'cancelado' &&
                  !stripeInfo?.cancelAtPeriodEnd &&
                  (licenca.plano === 'pro_individual' || licenca.plano === 'multi_cnpj') && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackMode('cancel');
                          setErrorMsg(null);
                        }}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        <span>Cancelar Renovação</span>
                      </button>

                      {stripeInfo?.eligibleFor7DayRefund && (
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackMode('refund');
                            setErrorMsg(null);
                          }}
                          className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          <span>Solicitar Reembolso (Garantia 7 Dias)</span>
                        </button>
                      )}
                    </>
                  )}
              </div>

              {/* Formulário de Feedback Obrigatório para Cancelamento ou Reembolso */}
              {feedbackMode !== 'none' && (
                <form
                  onSubmit={handleConfirmCancelOrRefund}
                  className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <MessageSquareHeart className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        {feedbackMode === 'refund'
                          ? 'Solicitação de Reembolso Integral (7 Dias) — Rápido Feedback'
                          : 'Cancelamento de Renovação — Rápido Feedback'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeedbackMode('none')}
                      className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feedbackMode === 'refund'
                      ? 'Para concluirmos o estorno integral imediato no seu cartão, conte-nos rapidamente o motivo e o que poderíamos melhorar:'
                      : 'Você não terá nenhuma multa e manterá o acesso até o fim do período pago. Para confirmar, conte-nos rapidamente o motivo e o que poderíamos melhorar:'}
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      1. Qual o principal motivo? *
                    </label>
                    <select
                      required
                      value={feedbackMotivo}
                      onChange={(e) => setFeedbackMotivo(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    >
                      <option value="">Selecione um motivo...</option>
                      <option value="Apenas precisava baixar notas de um período específico">
                        Apenas precisava baixar notas de um período específico
                      </option>
                      <option value="Tive dificuldade com o Certificado Digital A1/A3 ou API do ADN">
                        Tive dificuldade com o Certificado Digital A1/A3 ou API do ADN
                      </option>
                      <option value="Senti falta de alguma funcionalidade no relatório/programa">
                        Senti falta de alguma funcionalidade no relatório/programa
                      </option>
                      <option value="Valor da assinatura acima do orçamento atual">
                        Valor da assinatura acima do orçamento atual
                      </option>
                      <option value="Outro motivo">Outro motivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      2. O que poderíamos melhorar no NFSe Nacional Suite? *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={feedbackMelhoria}
                      onChange={(e) => setFeedbackMelhoria(e.target.value)}
                      placeholder="Sua sugestão nos ajuda muito a evoluir a ferramenta..."
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl p-2.5 text-xs text-slate-900 outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFeedbackMode('none')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Manter Assinatura
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoadingId === 'cancel_or_refund'}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      {actionLoadingId === 'cancel_or_refund' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : null}
                      <span>
                        {feedbackMode === 'refund'
                          ? 'Enviar Feedback e Confirmar Reembolso'
                          : 'Enviar Feedback e Confirmar Cancelamento'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Rodapé com link para os Guias */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
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
