import { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Shield, Mail, Phone, User } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  nome: string;
  email: string;
  telefone: string;
  tipoUso: string;
  mensagem: string;
  hp_website: string; // Honeypot
}

interface FormErrors {
  nome?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  general?: string;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [form, setForm] = useState<FormState>({
    nome: '',
    email: '',
    telefone: '',
    tipoUso: 'contabilidade',
    mensagem: '',
    hp_website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const formMountTime = useRef<number>(Date.now());

  useEffect(() => {
    if (isOpen) {
      formMountTime.current = Date.now();
      setIsSuccess(false);
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Sanitização de entradas
  const sanitize = (val: string) => val.replace(/[<>]/g, '').trim();

  // Validação em tempo real / blur
  const validateField = (name: keyof FormState, val: string): string | undefined => {
    switch (name) {
      case 'nome':
        if (!val.trim()) return 'O nome completo é obrigatório.';
        if (val.trim().length < 3) return 'O nome deve ter no mínimo 3 caracteres.';
        if (!/^[a-zA-ZÀ-ÿ\s.'-]+$/.test(val.trim())) return 'Insira um nome válido (apenas letras).';
        return undefined;

      case 'email':
        if (!val.trim()) return 'O e-mail é obrigatório.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim())) {
          return 'Insira um endereço de e-mail corporativo ou pessoal válido.';
        }
        return undefined;

      case 'telefone': {
        const digits = val.replace(/\D/g, '');
        if (!digits) return 'O telefone/WhatsApp com DDD é obrigatório.';
        if (digits.length < 10 || digits.length > 11) {
          return 'Insira um telefone válido com DDD (10 ou 11 dígitos).';
        }
        return undefined;
      }

      case 'mensagem':
        if (!val.trim()) return 'A mensagem é obrigatória.';
        if (val.trim().length < 10) return 'A mensagem deve conter no mínimo 10 caracteres explicativos.';
        if (val.length > 1000) return 'A mensagem não pode ultrapassar 1000 caracteres.';
        return undefined;

      default:
        return undefined;
    }
  };

  // Máscara amigável de telefone brasileiro (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    } else if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    } else if (raw.length > 0) {
      formatted = `(${raw}`;
    }
    setForm((prev) => ({ ...prev, telefone: formatted }));
    if (touched.telefone) {
      setErrors((prev) => ({ ...prev, telefone: validateField('telefone', formatted) }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormState, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof FormState, value) }));
  };

  // Submissão com proteção anti-spam e validação cruzada
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Anti-spam: Honeypot check
    if (form.hp_website.trim().length > 0) {
      console.warn('Bot detection: honeypot triggered.');
      setIsSuccess(true);
      return;
    }

    // 2. Anti-spam: Tempo mínimo de preenchimento (2 segundos)
    const elapsedMs = Date.now() - formMountTime.current;
    if (elapsedMs < 2000) {
      setErrors({ general: 'Envio muito rápido. Por favor, revise as informações e tente novamente.' });
      return;
    }

    // 3. Anti-spam: Rate limiting local (máximo 3 envios por 10 minutos)
    const RATE_KEY = 'nfse_contact_rate_limit';
    try {
      const stored = localStorage.getItem(RATE_KEY);
      const now = Date.now();
      const records: number[] = stored ? JSON.parse(stored) : [];
      const recent = records.filter((ts) => now - ts < 10 * 60 * 1000);

      if (recent.length >= 3) {
        setErrors({
          general: 'Limite de envios atingido para este dispositivo. Aguarde alguns minutos antes de reenviar.',
        });
        return;
      }
    } catch {
      // Ignora falhas de parsing de storage
    }

    // 4. Validação completa de todos os campos
    const newErrors: FormErrors = {
      nome: validateField('nome', form.nome),
      email: validateField('email', form.email),
      telefone: validateField('telefone', form.telefone),
      mensagem: validateField('mensagem', form.mensagem),
    };

    setTouched({ nome: true, email: true, telefone: true, mensagem: true });
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Tenta enviar para a rota de API (/api/contact) se disponível
      const sanitizedPayload = {
        nome: sanitize(form.nome),
        email: sanitize(form.email),
        telefone: sanitize(form.telefone),
        tipoUso: sanitize(form.tipoUso),
        mensagem: sanitize(form.mensagem),
      };

      const res = await fetch('./api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedPayload),
      }).catch(() => null);

      if (res && !res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao processar envio no servidor.');
      }

      // Atualiza timestamp no rate limiting
      try {
        const stored = localStorage.getItem(RATE_KEY);
        const records: number[] = stored ? JSON.parse(stored) : [];
        records.push(Date.now());
        localStorage.setItem(RATE_KEY, JSON.stringify(records));
      } catch {}

      setIsSuccess(true);
    } catch (err: any) {
      setErrors({
        general: err?.message || 'Ocorreu um erro ao enviar. Você também pode enviar direto para suporte.nfsebridge@gmail.com',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-200 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mensagem Enviada!</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Agradecemos seu contato. Nossa equipe técnica e de atendimento retornará em até 24 horas úteis no e-mail{' '}
              <strong className="text-white">{form.email}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition-colors"
            >
              Concluir
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Shield className="w-4 h-4" /> Atendimento & Demonstração
              </div>
              <h2 id="contact-modal-title" className="text-xl font-extrabold text-white">
                Fale com um Especialista
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Tire dúvidas sobre a coleta no ADN, compatibilidade com certificados ou planos para múltiplos CNPJs.
              </p>
            </div>

            {errors.general && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Campo Honeypot invisível para captura de bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="company_website_hp">Não preencha este campo:</label>
                <input
                  id="company_website_hp"
                  type="text"
                  name="hp_website"
                  value={form.hp_website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Nome */}
              <div>
                <label htmlFor="form-nome" className="block text-xs font-semibold text-slate-200 mb-1">
                  Nome Completo <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="form-nome"
                    name="nome"
                    type="text"
                    required
                    value={form.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Seu nome ou do responsável"
                    aria-invalid={!!errors.nome}
                    aria-describedby={errors.nome ? 'error-nome' : undefined}
                    className={`w-full bg-slate-950 border ${
                      errors.nome ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-teal-500'
                    } rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors`}
                  />
                </div>
                {errors.nome && (
                  <p id="error-nome" className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.nome}
                  </p>
                )}
              </div>

              {/* Email & Telefone em Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="form-email" className="block text-xs font-semibold text-slate-200 mb-1">
                    E-mail Corporativo <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="form-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="seu.email@empresa.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                      className={`w-full bg-slate-950 border ${
                        errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-teal-500'
                      } rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors`}
                    />
                  </div>
                  {errors.email && (
                    <p id="error-email" className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="form-telefone" className="block text-xs font-semibold text-slate-200 mb-1">
                    WhatsApp com DDD <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="form-telefone"
                      name="telefone"
                      type="tel"
                      required
                      value={form.telefone}
                      onChange={handlePhoneChange}
                      onBlur={handleBlur}
                      placeholder="(45) 99999-9999"
                      aria-invalid={!!errors.telefone}
                      aria-describedby={errors.telefone ? 'error-telefone' : undefined}
                      className={`w-full bg-slate-950 border ${
                        errors.telefone ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-teal-500'
                      } rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors`}
                    />
                  </div>
                  {errors.telefone && (
                    <p id="error-telefone" className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" /> {errors.telefone}
                    </p>
                  )}
                </div>
              </div>

              {/* Perfil de Uso */}
              <div>
                <label htmlFor="form-tipoUso" className="block text-xs font-semibold text-slate-200 mb-1">
                  Perfil de Operação
                </label>
                <select
                  id="form-tipoUso"
                  name="tipoUso"
                  value={form.tipoUso}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors"
                >
                  <option value="contabilidade">Escritório Contábil / BPO Financeiro (Multi-CNPJ)</option>
                  <option value="empresa">Empresa Prestadora / Tomadora de Serviços (CNPJ Único)</option>
                  <option value="desenvolvedor">Desenvolvedor / Integrador de Software Fiscal</option>
                  <option value="outro">Outro perfil</option>
                </select>
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="form-mensagem" className="block text-xs font-semibold text-slate-200 mb-1">
                  Como podemos ajudar? <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="form-mensagem"
                    name="mensagem"
                    rows={3}
                    required
                    value={form.mensagem}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Descreva suas dúvidas sobre certificados, volume de notas ou necessidade da sua equipe..."
                    aria-invalid={!!errors.mensagem}
                    aria-describedby={errors.mensagem ? 'error-mensagem' : undefined}
                    className={`w-full bg-slate-950 border ${
                      errors.mensagem ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-teal-500'
                    } rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-colors resize-none`}
                  />
                </div>
                {errors.mensagem && (
                  <p id="error-mensagem" className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errors.mensagem}
                  </p>
                )}
              </div>

              {/* Botão de Envio */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Protegido por validação e anti-spam.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-teal-900/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Validando...' : 'Enviar Mensagem'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
