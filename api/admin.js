const SUPABASE_URL_DEFAULT = 'https://nqdzhtfejmxynjfwadmi.supabase.co';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PLANOS = ['trial', 'pro_individual', 'multi_cnpj', 'parceiro', 'vitalicio'];
const STATUS = ['ativo', 'pendente', 'bloqueado', 'cancelado'];

function cfg() {
  const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_URL_DEFAULT).replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || serviceKey;
  return {
    supabaseUrl,
    serviceKey,
    anonKey,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  };
}

function adminEmails() {
  return (process.env.ADMIN_EMAILS || 'gabriel.v.santos23@gmail.com')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Valida o token Google/Supabase e confirma que o e-mail é de um administrador. */
async function verifyAdmin(accessToken) {
  if (!accessToken || typeof accessToken !== 'string') return null;
  const { supabaseUrl, anonKey } = cfg();
  const r = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const u = await r.json();
  const email = String(u.email || '').toLowerCase();
  const viaGoogle =
    u.app_metadata?.provider === 'google' ||
    (Array.isArray(u.identities) && u.identities.some((i) => i.provider === 'google'));
  if (!email || !u.email_confirmed_at || !viaGoogle) return null;
  if (!adminEmails().includes(email)) return null;
  return { email, id: u.id };
}

async function sb(path, method = 'GET', payload) {
  const { supabaseUrl, headers } = cfg();
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: { ...headers, Prefer: 'return=representation' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && (data.message || data.hint)) || text || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

function needUuid(v, nome = 'id') {
  const s = String(v || '');
  if (!UUID_RE.test(s)) throw new Error(`${nome} inválido.`);
  return s;
}

async function dashboard() {
  const [licencas, maquinas] = await Promise.all([
    sb('licencas?select=*&order=criado_em.desc'),
    sb('maquinas_ativas?select=*&order=ultimo_ping.desc'),
  ]);
  let feedbacks = [];
  try {
    feedbacks = await sb('feedbacks_cancelamento?select=*&order=criado_em.desc&limit=200');
  } catch {
    feedbacks = [];
  }
  return { licencas, maquinas, feedbacks, now: new Date().toISOString() };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!cfg().serviceKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY ausente no servidor.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  try {
    const admin = await verifyAdmin(body.accessToken);
    if (!admin) {
      return res.status(403).json({ error: 'Acesso restrito ao administrador.' });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    switch (body.action) {
      case 'me':
        return res.status(200).json({ ok: true, isAdmin: true, email: admin.email });

      case 'dashboard':
        return res.status(200).json({ ok: true, email: admin.email, ...(await dashboard()) });

      case 'create_license': {
        const email = String(body.email || '').trim().toLowerCase();
        if (!email.includes('@')) throw new Error('E-mail inválido.');
        const plano = PLANOS.includes(body.plano) ? body.plano : 'pro_individual';
        const max = Math.min(500, Math.max(1, parseInt(body.max_computadores, 10) || 2));
        let expira = null;
        if (body.dias !== 'permanente' && body.dias !== '' && body.dias != null) {
          const d = parseInt(body.dias, 10);
          if (!Number.isFinite(d) || d < 0) throw new Error('Dias inválidos.');
          expira = new Date(now.getTime() + d * 86400000).toISOString();
        }
        await sb('licencas', 'POST', {
          email,
          cliente_nome: String(body.cliente_nome || '').trim() || email.split('@')[0],
          plano,
          max_computadores: max,
          expira_em: expira,
          status: 'ativo',
          criado_em: nowIso,
          atualizado_em: nowIso,
        });
        return res.status(200).json({ ok: true });
      }

      case 'update_license': {
        const id = needUuid(body.id);
        const f = body.fields || {};
        const patch = { atualizado_em: nowIso };
        if ('cliente_nome' in f) patch.cliente_nome = String(f.cliente_nome || '').slice(0, 200);
        if ('plano' in f) {
          if (!PLANOS.includes(f.plano)) throw new Error('Plano inválido.');
          patch.plano = f.plano;
        }
        if ('status' in f) {
          if (!STATUS.includes(f.status)) throw new Error('Status inválido.');
          patch.status = f.status;
        }
        if ('max_computadores' in f) {
          const m = parseInt(f.max_computadores, 10);
          if (!Number.isFinite(m) || m < 1 || m > 500) throw new Error('Limite de PCs inválido.');
          patch.max_computadores = m;
        }
        if ('expira_em' in f) {
          if (f.expira_em === null || f.expira_em === 'permanente') {
            patch.expira_em = null;
          } else {
            const d = new Date(f.expira_em);
            if (isNaN(d.getTime())) throw new Error('Data inválida.');
            patch.expira_em = d.toISOString();
          }
        }
        await sb(`licencas?id=eq.${id}`, 'PATCH', patch);
        return res.status(200).json({ ok: true });
      }

      case 'add_days': {
        const id = needUuid(body.id);
        const dias = Math.min(3650, Math.max(1, parseInt(body.days, 10) || 30));
        const rows = await sb(`licencas?id=eq.${id}&select=expira_em`);
        let base = now;
        if (rows?.[0]?.expira_em) {
          const cur = new Date(rows[0].expira_em);
          if (!isNaN(cur.getTime()) && cur > now) base = cur;
        }
        await sb(`licencas?id=eq.${id}`, 'PATCH', {
          expira_em: new Date(base.getTime() + dias * 86400000).toISOString(),
          status: 'ativo',
          atualizado_em: nowIso,
        });
        return res.status(200).json({ ok: true });
      }

      case 'delete_license': {
        const id = needUuid(body.id);
        await sb(`maquinas_ativas?licenca_id=eq.${id}`, 'DELETE');
        await sb(`licencas?id=eq.${id}`, 'DELETE');
        return res.status(200).json({ ok: true });
      }

      case 'disconnect_machine': {
        const id = needUuid(body.id);
        await sb(`maquinas_ativas?id=eq.${id}`, 'PATCH', { ativo: false });
        return res.status(200).json({ ok: true });
      }

      case 'disconnect_all': {
        const id = needUuid(body.licencaId, 'licencaId');
        await sb(`maquinas_ativas?licenca_id=eq.${id}`, 'PATCH', { ativo: false });
        return res.status(200).json({ ok: true });
      }

      case 'delete_machine': {
        const id = needUuid(body.id);
        await sb(`maquinas_ativas?id=eq.${id}`, 'DELETE');
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: 'Ação inválida.' });
    }
  } catch (err) {
    console.error('[Admin API]', err);
    return res.status(500).json({ error: err.message || 'Erro interno.' });
  }
}
