import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

function getStripeConfig() {
  const mode = (process.env.STRIPE_MODE || '').toLowerCase();
  if (mode === 'live') {
    return {
      stripeKey: process.env.STRIPE_SECRET_KEY || process.env.TEST_STRIPE_SECRET_KEY,
      webhookSecrets: [process.env.STRIPE_WEBHOOK_SECRET, process.env.TEST_STRIPE_WEBHOOK_SECRET].filter(Boolean),
    };
  }
  return {
    stripeKey: process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY,
    webhookSecrets: [process.env.TEST_STRIPE_WEBHOOK_SECRET, process.env.STRIPE_WEBHOOK_SECRET].filter(Boolean),
  };
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf-8');
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return Buffer.from(JSON.stringify(req.body), 'utf-8');
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk, 'utf-8') : chunk);
  }
  return Buffer.concat(chunks);
}

function getSupabaseHeaders() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://nqdzhtfejmxynjfwadmi.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return {
    supabaseUrl,
    supabaseKey,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
  };
}

async function buscarLicencaPorEmail(cleanEmail) {
  const { supabaseUrl, supabaseKey, headers } = getSupabaseHeaders();
  if (!cleanEmail || !supabaseUrl || !supabaseKey) return null;
  const checkRes = await fetch(
    `${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}&select=*&limit=1`,
    { headers }
  );
  if (!checkRes.ok) return null;
  const rows = await checkRes.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

async function upsertLicencaSupabase({ email, name, plan, expiraIso, status = 'ativo' }) {
  const { supabaseUrl, supabaseKey, headers } = getSupabaseHeaders();
  if (!email || !supabaseUrl || !supabaseKey) return;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const planSlug = plan === 'multi' ? 'multi_cnpj' : 'pro_individual';
    const maxComputadores = plan === 'multi' ? 5 : 2;
    const defaultExpira = new Date();
    defaultExpira.setDate(defaultExpira.getDate() + 30);
    const finalExpira = expiraIso || defaultExpira.toISOString();

    const existing = await buscarLicencaPorEmail(cleanEmail);

    if (existing) {
      await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          plano: planSlug,
          max_computadores: maxComputadores,
          expira_em: finalExpira,
          status,
          atualizado_em: new Date().toISOString(),
        }),
      });
      console.log('[Stripe Webhook] Licença atualizada no Supabase para:', cleanEmail, { status, planSlug });
    } else {
      await fetch(`${supabaseUrl}/rest/v1/licencas`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: cleanEmail,
          cliente_nome: name || cleanEmail.split('@')[0],
          plano: planSlug,
          max_computadores: maxComputadores,
          expira_em: finalExpira,
          status,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString(),
        }),
      });
      console.log('[Stripe Webhook] Nova licença criada no Supabase para:', cleanEmail, { status, planSlug });
    }
  } catch (err) {
    console.warn('[Stripe Webhook] Falha ao atualizar Supabase:', err.message);
  }
}

async function aplicarCarenciaPagamentoSupabase(email, diasCarencia = 3) {
  const { supabaseUrl, supabaseKey, headers } = getSupabaseHeaders();
  if (!email || !supabaseUrl || !supabaseKey) return;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await buscarLicencaPorEmail(cleanEmail);
    if (!existing) return;

    const carenciaDate = new Date();
    carenciaDate.setDate(carenciaDate.getDate() + diasCarencia);

    let novaExpiracao = carenciaDate;
    if (existing.expira_em) {
      const atualExpira = new Date(existing.expira_em);
      if (!isNaN(atualExpira.getTime()) && atualExpira > carenciaDate) {
        novaExpiracao = atualExpira;
      }
    }

    await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: 'pendente',
        expira_em: novaExpiracao.toISOString(),
        atualizado_em: new Date().toISOString(),
      }),
    });
    console.log(`[Stripe Webhook] Carência de ${diasCarencia} dias aplicada para:`, cleanEmail);
  } catch (err) {
    console.warn('[Stripe Webhook] Falha ao aplicar carência no Supabase:', err.message);
  }
}

async function atualizarStatusLicencaSupabase(email, status, expiraIso = null) {
  const { supabaseUrl, supabaseKey, headers } = getSupabaseHeaders();
  if (!email || !supabaseUrl || !supabaseKey) return;

  try {
    const cleanEmail = email.trim().toLowerCase();
    const payload = {
      status,
      atualizado_em: new Date().toISOString(),
    };
    if (expiraIso) {
      payload.expira_em = expiraIso;
    }
    await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    console.log('[Stripe Webhook] Status atualizado no Supabase para:', cleanEmail, status);
  } catch (err) {
    console.warn('[Stripe Webhook] Falha ao atualizar status no Supabase:', err.message);
  }
}

async function resolverEmailClienteStripe(stripe, customerId, fallbackEmail) {
  if (fallbackEmail) return fallbackEmail;
  if (!stripe || !customerId || typeof customerId !== 'string') return null;
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer && !customer.deleted && customer.email) {
      return customer.email;
    }
  } catch (err) {
    console.warn('[Stripe Webhook] Não foi possível recuperar e-mail do customer:', err.message);
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const { stripeKey, webhookSecrets } = getStripeConfig();
  const stripe = stripeKey ? new Stripe(stripeKey) : null;
  const rawBuffer = await readRawBody(req);

  let event = null;

  // Verificação estrita da assinatura do Stripe quando o Webhook Secret estiver configurado
  if (stripe && webhookSecrets.length > 0) {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      console.warn('[Stripe Webhook] Rejeitado: cabeçalho stripe-signature ausente.');
      return res.status(400).json({ error: 'Cabeçalho stripe-signature ausente.' });
    }

    let lastErr = null;
    for (const secret of webhookSecrets) {
      try {
        event = stripe.webhooks.constructEvent(rawBuffer, sig, secret);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
      }
    }

    if (!event && lastErr) {
      console.warn('[Stripe Webhook] Assinatura inválida rejeitada:', lastErr.message);
      return res.status(400).json({ error: `Assinatura de webhook inválida: ${lastErr.message}` });
    }
  } else {
    try {
      event = JSON.parse(rawBuffer.toString('utf-8') || '{}');
    } catch {
      return res.status(400).json({ error: 'Payload JSON inválido.' });
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
      const customerEmail = await resolverEmailClienteStripe(
        stripe,
        session.customer,
        session.customer_details?.email || session.customer_email
      );
      const customerName = session.customer_details?.name;
      const plan = session.metadata?.plan || (session.amount_total >= 10000 ? 'multi' : 'pro');

      if (customerEmail) {
        await upsertLicencaSupabase({
          email: customerEmail,
          name: customerName,
          plan,
          status: 'ativo',
        });
      }
    }

    // 2. Fatura / Mensalidade Paga com Sucesso (Renovação Recorrente)
    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
      const invoice = event.data?.object || {};
      const customerEmail = await resolverEmailClienteStripe(stripe, invoice.customer, invoice.customer_email);
      const customerName = invoice.customer_name;
      const amount = Number(invoice.amount_paid || invoice.total || 0);
      const plan = amount >= 10000 ? 'multi' : 'pro';

      // Calcula nova data de expiração (+30 dias ou fim do período da fatura)
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);
      const linePeriodEnd = invoice.lines?.data?.[0]?.period?.end;
      if (linePeriodEnd) {
        const periodEndDate = new Date(linePeriodEnd * 1000);
        if (periodEndDate > expDate) {
          expDate.setTime(periodEndDate.getTime());
        }
      }

      if (customerEmail) {
        await upsertLicencaSupabase({
          email: customerEmail,
          name: customerName,
          plan,
          expiraIso: expDate.toISOString(),
          status: 'ativo',
        });
      }
    }

    // 3. Falha no Pagamento da Fatura -> Aplica 3 dias de carência (status = 'pendente')
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data?.object || {};
      const customerEmail = await resolverEmailClienteStripe(stripe, invoice.customer, invoice.customer_email);
      if (customerEmail) {
        await aplicarCarenciaPagamentoSupabase(customerEmail, 3);
      }
    }

    // 4. Atualização de Assinatura (Upgrade/Downgrade de Plano ou Mudança de Status)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data?.object || {};
      const customerEmail = await resolverEmailClienteStripe(stripe, subscription.customer, null);
      if (customerEmail) {
        const itemAmount = subscription.items?.data?.[0]?.price?.unit_amount || 0;
        const plan =
          subscription.metadata?.plan || (itemAmount >= 10000 ? 'multi' : 'pro');
        const periodEndIso = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          await aplicarCarenciaPagamentoSupabase(customerEmail, 3);
        } else if (subscription.status === 'canceled') {
          await atualizarStatusLicencaSupabase(customerEmail, 'cancelado', periodEndIso);
        } else if (subscription.status === 'active' || subscription.status === 'trialing') {
          await upsertLicencaSupabase({
            email: customerEmail,
            plan,
            expiraIso: periodEndIso,
            status: 'ativo',
          });
        }
      }
    }

    // 5. Assinatura Cancelada / Encerrada Definitivamente
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data?.object || {};
      const customerEmail = await resolverEmailClienteStripe(stripe, subscription.customer, null);
      if (customerEmail) {
        await atualizarStatusLicencaSupabase(customerEmail, 'cancelado');
      }
    }

    // 6. Reembolso Processado (Garantia de 7 dias ou estorno) -> Encerra vigência imediatamente
    if (event.type === 'charge.refunded') {
      const charge = event.data?.object || {};
      const customerEmail = await resolverEmailClienteStripe(
        stripe,
        charge.customer,
        charge.billing_details?.email || charge.receipt_email
      );
      if (customerEmail) {
        await atualizarStatusLicencaSupabase(customerEmail, 'cancelado', new Date().toISOString());
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Erro ao processar:', err);
    return res.status(500).json({ error: err.message });
  }
}
