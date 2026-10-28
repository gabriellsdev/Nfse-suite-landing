import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  captureSessionFromHash,
  clearSession,
  getValidAccessToken,
  loadSession,
  startAdminGoogleLogin,
} from '../utils/adminSession';

interface Licenca {
  id: string;
  email: string;
  cliente_nome?: string | null;
  plano: string;
  status: string;
  max_computadores: number;
  expira_em?: string | null;
  criado_em?: string;
}
interface Maquina {
  id: string;
  licenca_id: string;
  machine_id: string;
  nome_computador?: string | null;
  versao_app?: string | null;
  ultimo_ping?: string | null;
  ativo: boolean;
}
interface Feedback {
  id: string;
  email: string;
  plano?: string;
  tipo_solicitacao?: string;
  motivo: string;
  sugestao_melhoria: string;
  criado_em: string;
}

type Gate = 'loading' | 'logged_out' | 'denied' | 'ok';
type Tab = 'online' | 'licencas' | 'maquinas' | 'feedbacks';

const ONLINE_MS = 5 * 60 * 1000;
const PRECOS: Record<string, number> = { pro_individual: 49, multi_cnpj: 129 };

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : 'Permanente';
const fmtDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

function ago(iso?: string | null): string {
  if (!iso) return 'nunca';
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'agora mesmo';
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return `há ${Math.floor(s / 86400)} d`;
}

const isOnline = (m: Maquina) =>
  m.ativo && !!m.ultimo_ping && Date.now() - new Date(m.ultimo_ping).getTime() < ONLINE_MS;

const statusCls: Record<string, string> = {
  ativo: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  pendente: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  bloqueado: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  cancelado: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
};

export default function AdminPanel() {
  const [gate, setGate] = useState<Gate>('loading');
  const [adminEmail, setAdminEmail] = useState('');
  const [licencas, setLicencas] = useState<Licenca[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [tab, setTab] = useState<Tab>('online');
  const [busca, setBusca] = useState('');
  const [filtroPlano, setFiltroPlano] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [erro, setErro] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const [, setTick] = useState(0);
  const [novo, setNovo] = useState<null | Record<string, string>>(null);

  const call = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    const token = await getValidAccessToken();
    if (!token) throw Object.assign(new Error('Sessão expirada.'), { code: 401 });
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, accessToken: token, ...extra }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Erro'), { code: res.status });
    return data;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const d = await call('dashboard');
      setAdminEmail(d.email);
      setLicencas(d.licencas || []);
      setMaquinas(d.maquinas || []);
      setFeedbacks(d.feedbacks || []);
      setLastSync(new Date());
      setErro(null);
      setGate('ok');
    } catch (e: any) {
      if (e.code === 403) setGate('denied');
      else if (e.code === 401) setGate('logged_out');
      else setErro(e.message);
    }
  }, [call]);

  useEffect(() => {
    document.title = 'Admin — NFSe Nacional Suite';
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex,nofollow';

    captureSessionFromHash();
    if (!loadSession()) {
      setGate('logged_out');
      return;
    }
    refresh();
  }, [refresh]);

  // Atualiza os dados a cada 30s e o relógio "há X min" a cada 15s
  useEffect(() => {
    if (gate !== 'ok') return;
    const a = setInterval(refresh, 30000);
    const b = setInterval(() => setTick((t) => t + 1), 15000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [gate, refresh]);

  const act = async (action: string, extra: Record<string, unknown>, okMsg?: string) => {
    setBusy(true);
    try {
      await call(action, extra);
      await refresh();
      if (okMsg) setErro(null);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setBusy(false);
    }
  };

  const licMap = useMemo(() => new Map(licencas.map((l) => [l.id, l])), [licencas]);
  const usoPorLic = useMemo(() => {
    const m = new Map<string, number>();
    maquinas.forEach((x) => x.ativo && m.set(x.licenca_id, (m.get(x.licenca_id) || 0) + 1));
    return m;
  }, [maquinas]);

  const onlineList = maquinas.filter(isOnline);
  const kpi = {
    total: licencas.length,
    pagos: licencas.filter((l) => PRECOS[l.plano] && l.status === 'ativo').length,
    pendentes: licencas.filter((l) => l.status === 'pendente').length,
    parceiros: licencas.filter((l) => l.plano === 'parceiro').length,
    online: onlineList.length,
    mrr: licencas
      .filter((l) => l.status === 'ativo' || l.status === 'pendente')
      .reduce((s, l) => s + (PRECOS[l.plano] || 0), 0),
  };

  const licFiltradas = licencas.filter((l) => {
    const t = busca.trim().toLowerCase();
    if (filtroPlano !== 'todos' && l.plano !== filtroPlano) return false;
    if (filtroStatus !== 'todos' && l.status !== filtroStatus) return false;
    return !t || `${l.cliente_nome} ${l.email} ${l.id}`.toLowerCase().includes(t);
  });

  const maqFiltradas = maquinas.filter((m) => {
    const t = busca.trim().toLowerCase();
    const l = licMap.get(m.licenca_id);
    return (
      !t ||
      `${m.nome_computador} ${m.machine_id} ${l?.email} ${l?.cliente_nome} ${m.licenca_id}`
        .toLowerCase()
        .includes(t)
    );
  });

  const sair = () => {
    clearSession();
    setGate('logged_out');
  };

  // ------------------------------------------------------------------ gates
  if (gate !== 'ok') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-7 text-center space-y-4">
          <h1 className="text-lg font-extrabold">NFSe Suite — Admin</h1>
          {gate === 'loading' && <p className="text-sm text-slate-400">Verificando acesso…</p>}
          {gate === 'logged_out' && (
            <>
              <p className="text-sm text-slate-400">Entre com a conta Google do administrador.</p>
              <button
                type="button"
                onClick={startAdminGoogleLogin}
                className="w-full bg-white text-slate-900 font-bold text-sm py-2.5 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Entrar com Google
              </button>
            </>
          )}
          {gate === 'denied' && (
            <>
              <p className="text-sm text-rose-300">Esta conta não tem acesso de administrador.</p>
              <button
                type="button"
                onClick={sair}
                className="w-full bg-slate-800 text-slate-100 font-bold text-sm py-2.5 rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                Trocar de conta
              </button>
            </>
          )}
          {erro && <p className="text-xs text-rose-300">{erro}</p>}
          <a href="/" className="block text-xs text-slate-500 hover:text-slate-300">
            ← Voltar ao site
          </a>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------- helpers UI
  const Btn = ({
    children,
    onClick,
    cls = 'bg-slate-800 hover:bg-slate-700 text-slate-100',
  }: {
    children: React.ReactNode;
    onClick: () => void;
    cls?: string;
  }) => (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold disabled:opacity-50 cursor-pointer ${cls}`}
    >
      {children}
    </button>
  );

  const editarLimite = (l: Licenca) => {
    const v = window.prompt(`Novo limite de computadores para ${l.email}:`, String(l.max_computadores));
    if (v) act('update_license', { id: l.id, fields: { max_computadores: v } });
  };
  const editarValidade = (l: Licenca) => {
    const v = window.prompt(
      'Nova validade (AAAA-MM-DD) ou "permanente":',
      l.expira_em ? l.expira_em.slice(0, 10) : 'permanente'
    );
    if (!v) return;
    const val = v.trim().toLowerCase();
    act('update_license', {
      id: l.id,
      fields: { expira_em: val === 'permanente' ? null : `${val}T23:59:59Z` },
    });
  };
  const editarPlano = (l: Licenca) => {
    const v = window.prompt('Plano (trial, pro_individual, multi_cnpj, parceiro, vitalicio):', l.plano);
    if (v) act('update_license', { id: l.id, fields: { plano: v.trim() } });
  };
  const excluir = (l: Licenca) => {
    if (window.confirm(`EXCLUIR a licença de ${l.email}? As máquinas vinculadas também serão removidas.`))
      act('delete_license', { id: l.id });
  };
  const verMaquinas = (l: Licenca) => {
    setBusca(l.id);
    setTab('maquinas');
  };

  const salvarNovo = async () => {
    if (!novo) return;
    await act('create_license', novo);
    setNovo(null);
  };

  const th = 'text-left px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400';
  const td = 'px-3 py-2 text-xs align-middle';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-extrabold">🛡️ NFSe Nacional Suite — Painel Admin</div>
            <div className="text-[11px] text-slate-400">
              {adminEmail} • atualizado {lastSync ? lastSync.toLocaleTimeString('pt-BR') : '—'} (auto 30s)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn onClick={refresh} cls="bg-teal-600 hover:bg-teal-500 text-white">
              🔄 Atualizar
            </Btn>
            <a href="/" className="text-xs text-slate-300 hover:text-white px-2">
              Site
            </a>
            <Btn onClick={sair}>Sair</Btn>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {erro && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {erro}
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            ['Licenças', kpi.total, 'text-slate-100'],
            ['Assinantes pagos', kpi.pagos, 'text-teal-300'],
            ['Em carência', kpi.pendentes, 'text-amber-300'],
            ['Parceiros', kpi.parceiros, 'text-sky-300'],
            ['Online agora', kpi.online, 'text-emerald-300'],
            ['MRR estimado', `R$ ${kpi.mrr}`, 'text-emerald-300'],
          ].map(([t, v, c]) => (
            <div key={String(t)} className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-bold uppercase text-slate-400">{t}</div>
              <div className={`text-xl font-extrabold ${c}`}>{v}</div>
            </div>
          ))}
        </section>

        <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {(
            [
              ['online', `🟢 Online agora (${kpi.online})`],
              ['licencas', `📋 Licenças (${licencas.length})`],
              ['maquinas', `🖥️ Máquinas (${maquinas.length})`],
              ['feedbacks', `💬 Feedbacks (${feedbacks.length})`],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                tab === k ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ------------------------------------------------------ ONLINE */}
        {tab === 'online' && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            <div className="px-3 py-2 text-[11px] text-slate-400 border-b border-slate-800">
              Online = batimento recebido nos últimos 5 minutos (o programa envia a cada 3 min enquanto aberto).
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className={th}>Computador</th>
                  <th className={th}>Cliente</th>
                  <th className={th}>Plano</th>
                  <th className={th}>Versão</th>
                  <th className={th}>Último sinal</th>
                </tr>
              </thead>
              <tbody>
                {onlineList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-xs text-slate-500">
                      Nenhuma máquina online no momento.
                    </td>
                  </tr>
                )}
                {onlineList.map((m) => {
                  const l = licMap.get(m.licenca_id);
                  return (
                    <tr key={m.id} className="border-b border-slate-800/60">
                      <td className={td}>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                        <strong>{m.nome_computador || 'PC'}</strong>
                        <div className="text-[10px] text-slate-500 font-mono ml-4">{m.machine_id}</div>
                      </td>
                      <td className={td}>
                        {l?.cliente_nome || '—'}
                        <div className="text-[10px] text-slate-500">{l?.email}</div>
                      </td>
                      <td className={td}>{l?.plano || '—'}</td>
                      <td className={td}>{m.versao_app ? `v${m.versao_app}` : '—'}</td>
                      <td className={td}>{ago(m.ultimo_ping)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* ---------------------------------------------------- LICENÇAS */}
        {tab === 'licencas' && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome, e-mail ou UUID…"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs w-64 outline-none focus:border-teal-500"
              />
              <select
                value={filtroPlano}
                onChange={(e) => setFiltroPlano(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
              >
                {['todos', 'pro_individual', 'multi_cnpj', 'parceiro', 'trial', 'vitalicio'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs"
              >
                {['todos', 'ativo', 'pendente', 'bloqueado', 'cancelado'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <Btn
                cls="bg-teal-600 hover:bg-teal-500 text-white"
                onClick={() =>
                  setNovo({ email: '', cliente_nome: '', plano: 'pro_individual', max_computadores: '2', dias: '30' })
                }
              >
                ➕ Nova licença
              </Btn>
            </div>

            {novo && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
                {(
                  [
                    ['email', 'E-mail'],
                    ['cliente_nome', 'Nome'],
                    ['max_computadores', 'PCs'],
                    ['dias', 'Dias (ou permanente)'],
                  ] as [string, string][]
                ).map(([k, label]) => (
                  <label key={k} className="text-[10px] font-bold text-slate-400">
                    {label}
                    <input
                      value={novo[k]}
                      onChange={(e) => setNovo({ ...novo, [k]: e.target.value })}
                      className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 outline-none"
                    />
                  </label>
                ))}
                <label className="text-[10px] font-bold text-slate-400">
                  Plano
                  <select
                    value={novo.plano}
                    onChange={(e) => setNovo({ ...novo, plano: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                  >
                    {['pro_individual', 'multi_cnpj', 'parceiro', 'trial', 'vitalicio'].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-2">
                  <Btn cls="bg-teal-600 hover:bg-teal-500 text-white" onClick={salvarNovo}>
                    Salvar
                  </Btn>
                  <Btn onClick={() => setNovo(null)}>Cancelar</Btn>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className={th}>Cliente</th>
                    <th className={th}>Plano</th>
                    <th className={th}>Status</th>
                    <th className={th}>PCs</th>
                    <th className={th}>Validade</th>
                    <th className={th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {licFiltradas.map((l) => (
                    <tr key={l.id} className="border-b border-slate-800/60">
                      <td className={td}>
                        <strong>{l.cliente_nome || '—'}</strong>
                        <div className="text-[10px] text-slate-500">{l.email}</div>
                      </td>
                      <td className={td}>{l.plano}</td>
                      <td className={td}>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            statusCls[l.status] || statusCls.cancelado
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className={td}>
                        {usoPorLic.get(l.id) || 0} / {l.max_computadores}
                      </td>
                      <td className={td}>{fmtDate(l.expira_em)}</td>
                      <td className={`${td} space-x-1 space-y-1 whitespace-nowrap`}>
                        <Btn cls="bg-sky-600 hover:bg-sky-500 text-white" onClick={() => act('add_days', { id: l.id, days: 30 })}>
                          +30d
                        </Btn>
                        <Btn onClick={() => editarValidade(l)}>Validade</Btn>
                        <Btn onClick={() => editarLimite(l)}>PCs</Btn>
                        <Btn onClick={() => editarPlano(l)}>Plano</Btn>
                        <Btn
                          cls="bg-amber-600 hover:bg-amber-500 text-white"
                          onClick={() =>
                            act('update_license', {
                              id: l.id,
                              fields: { status: l.status === 'bloqueado' ? 'ativo' : 'bloqueado' },
                            })
                          }
                        >
                          {l.status === 'bloqueado' ? 'Ativar' : 'Bloquear'}
                        </Btn>
                        <Btn onClick={() => verMaquinas(l)}>Máquinas</Btn>
                        <Btn cls="bg-rose-700 hover:bg-rose-600 text-white" onClick={() => excluir(l)}>
                          Excluir
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ---------------------------------------------------- MÁQUINAS */}
        {tab === 'maquinas' && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Filtrar computador, cliente ou UUID…"
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs w-72 outline-none focus:border-teal-500"
              />
              <Btn onClick={() => setBusca('')}>Limpar</Btn>
              {busca.match(/^[0-9a-f-]{36}$/i) && (
                <Btn
                  cls="bg-amber-600 hover:bg-amber-500 text-white"
                  onClick={() =>
                    window.confirm('Desconectar TODAS as máquinas desta licença?') &&
                    act('disconnect_all', { licencaId: busca })
                  }
                >
                  Desconectar todas
                </Btn>
              )}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className={th}>Estado</th>
                    <th className={th}>Computador</th>
                    <th className={th}>Cliente</th>
                    <th className={th}>Versão</th>
                    <th className={th}>Último sinal</th>
                    <th className={th}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {maqFiltradas.map((m) => {
                    const l = licMap.get(m.licenca_id);
                    const on = isOnline(m);
                    return (
                      <tr key={m.id} className="border-b border-slate-800/60">
                        <td className={td}>
                          {on ? '🟢 Online' : m.ativo ? '🟡 Ausente' : '⚪ Desconectada'}
                        </td>
                        <td className={td}>
                          <strong>{m.nome_computador || 'PC'}</strong>
                          <div className="text-[10px] text-slate-500 font-mono">{m.machine_id}</div>
                        </td>
                        <td className={td}>
                          {l?.cliente_nome || '—'}
                          <div className="text-[10px] text-slate-500">{l?.email}</div>
                        </td>
                        <td className={td}>{m.versao_app ? `v${m.versao_app}` : '—'}</td>
                        <td className={td}>
                          {ago(m.ultimo_ping)}
                          <div className="text-[10px] text-slate-500">{fmtDateTime(m.ultimo_ping)}</div>
                        </td>
                        <td className={`${td} space-x-1 whitespace-nowrap`}>
                          {m.ativo && (
                            <Btn
                              cls="bg-teal-600 hover:bg-teal-500 text-white"
                              onClick={() => act('disconnect_machine', { id: m.id })}
                            >
                              Desconectar
                            </Btn>
                          )}
                          <Btn
                            cls="bg-rose-700 hover:bg-rose-600 text-white"
                            onClick={() =>
                              window.confirm('Remover registro desta máquina?') &&
                              act('delete_machine', { id: m.id })
                            }
                          >
                            Remover
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --------------------------------------------------- FEEDBACKS */}
        {tab === 'feedbacks' && (
          <section className="space-y-2">
            {feedbacks.length === 0 && (
              <div className="text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
                Nenhum feedback ainda (ou a tabela feedbacks_cancelamento ainda não foi criada no Supabase).
              </div>
            )}
            {feedbacks.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div className="flex flex-wrap justify-between gap-2 text-[11px] text-slate-400">
                  <span>
                    <strong className="text-slate-200">{f.email}</strong> • {f.plano || '—'} •{' '}
                    {f.tipo_solicitacao}
                  </span>
                  <span>{fmtDateTime(f.criado_em)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Motivo:</span> {f.motivo}
                </div>
                <div>
                  <span className="text-slate-400">Melhoria:</span> {f.sugestao_melhoria}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
