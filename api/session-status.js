import Stripe from 'stripe';

async function ativarLicencaSupabase({ email, name, plan }) {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://nqdzhtfejmxynjfwadmi.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!email || !supabaseUrl || !supabaseKey) return;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const planSlug = plan === 'multi' ? 'multi_cnpj' : 'pro_individual';
    const maxComputadores = plan === 'multi' ? 5 : 2;
    const expiraDate = new Date();
    expiraDate.setDate(expiraDate.getDate() + 30);
    const expiraIso = expiraDate.toISOString();

    // 1. Verifica se já existe registro com esse e-mail
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}&select=id`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const existing = checkRes.ok ? await checkRes.json() : [];

    if (Array.isArray(existing) && existing.length > 0) {
      // 2. Atualiza licença existente
      await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}`, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plano: planSlug,
          max_computadores: maxComputadores,
          expira_em: expiraIso,
          status: 'ativo',
          atualizado_em: new Date().toISOString(),
        }),
      });
      console.log('[Session Status] Licença atualizada no Supabase para:', cleanEmail);
    } else {
      // 3. Cria nova licença para o comprador
      await fetch(`${supabaseUrl}/rest/v1/licencas`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          cliente_nome: name || cleanEmail.split('@')[0],
          plano: planSlug,
          max_computadores: maxComputadores,
          expira_em: expiraIso,
          status: 'ativo',
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        }),
      });
      console.log('[Session Status] Nova licença criada no Supabase para:', cleanEmail);
    }
  } catch (err) {
    console.warn('[Session Status] Falha ao atualizar Supabase:', err.message);
  }
}

function getStripeSecretKey() {
  const mode = (process.env.STRIPE_MODE || '').toLowerCase();
  if (mode === 'live') {
    return process.env.STRIPE_SECRET_KEY || process.env.TEST_STRIPE_SECRET_KEY;
  }
  if (mode === 'test') {
    return process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  }
  return process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
}

export default async function handler(req, res) {
  const stripeKey = getStripeSecretKey();
  if (!stripeKey) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada.' });
  }

  const stripe = new Stripe(stripeKey);
  const sessionId = req.query.session_id;

  if (!sessionId) {
    return res.status(400).json({ error: 'session_id é obrigatório.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isPaid = session.status === 'complete' || session.payment_status === 'paid';
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name;
    const plan = session.metadata?.plan || (session.amount_total >= 10000 ? 'multi' : 'pro');

    // Se o pagamento foi concluído, ativa a licença no Supabase imediatamente como fallback do webhook
    if (isPaid && customerEmail) {
      await ativarLicencaSupabase({
        email: customerEmail,
        name: customerName,
        plan,
      });
    }

    return res.status(200).json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: customerEmail,
      plan: session.metadata?.plan,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
