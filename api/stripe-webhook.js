import Stripe from 'stripe';

async function upsertLicencaSupabase({ email, name, plan }) {
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

    const checkRes = await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}&select=id`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const existing = checkRes.ok ? await checkRes.json() : [];

    if (Array.isArray(existing) && existing.length > 0) {
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
      console.log('[Stripe Webhook] Licença atualizada no Supabase para:', cleanEmail);
    } else {
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
      console.log('[Stripe Webhook] Nova licença criada no Supabase para:', cleanEmail);
    }
  } catch (err) {
    console.warn('[Stripe Webhook] Falha ao atualizar Supabase:', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.TEST_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  let event = req.body;

  // Se o webhook secret estiver configurado e houver assinatura do Stripe
  if (stripeKey && webhookSecret && req.headers['stripe-signature']) {
    try {
      const stripe = new Stripe(stripeKey);
      const sig = req.headers['stripe-signature'];
      // Se body for string ou buffer
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.warn('[Stripe Webhook] Falha ao verificar assinatura:', err.message);
      // Continua com event de req.body para flexibilidade de desenvolvimento
    }
  }

  console.log('[Stripe Webhook] Evento recebido:', event?.type);

  if (!event || !event.type) {
    return res.status(200).json({ ok: true, message: 'Ping sem evento recebido.' });
  }

  try {
    // 1. Checkout Concluído com Sucesso
    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {};
      const customerEmail = session.customer_details?.email || session.customer_email;
      const customerName = session.customer_details?.name;
      const plan = session.metadata?.plan || (session.amount_total >= 10000 ? 'multi' : 'pro');

      console.log('[Stripe Webhook] Checkout concluído para:', customerEmail, { plan });

      if (customerEmail) {
        await upsertLicencaSupabase({
          email: customerEmail,
          name: customerName,
          plan,
        });
      }
    }

    // 2. Fatura / Mensalidade Paga com Sucesso (Renovação Recorrente)
    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
      const invoice = event.data?.object || {};
      const customerEmail = invoice.customer_email;
      const customerName = invoice.customer_name;
      const amount = Number(invoice.amount_paid || invoice.total || 0);
      const plan = amount >= 10000 ? 'multi' : 'pro';

      if (customerEmail) {
        await upsertLicencaSupabase({
          email: customerEmail,
          name: customerName,
          plan,
        });
        console.log('[Stripe Webhook] Renovação confirmada para:', customerEmail);
      }
    }

    // 3. Assinatura Cancelada
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data?.object || {};
      console.log('[Stripe Webhook] Assinatura cancelada:', subscription.id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Erro ao processar:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
