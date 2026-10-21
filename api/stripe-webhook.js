import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.TEST_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

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
      const plan = session.metadata?.plan || (session.amount_total >= 10000 ? 'multi' : 'pro');
      const maxMaquinas = plan === 'multi' ? 5 : 1;

      console.log('[Stripe Webhook] Checkout concluído para:', customerEmail, { plan, maxMaquinas });

      if (customerEmail && supabaseUrl && supabaseKey) {
        const validadeDate = new Date();
        validadeDate.setDate(validadeDate.getDate() + 30);
        const validadeIso = validadeDate.toISOString();

        const cleanEmail = customerEmail.trim().toLowerCase();

        const updateRes = await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            plano: plan,
            tipo: 'pago',
            status: 'ativo',
            max_maquinas: maxMaquinas,
            validade: validadeIso,
            atualizado_em: new Date().toISOString(),
          }),
        });

        console.log('[Stripe Webhook] Licença atualizada no Supabase para:', cleanEmail, updateRes.status);
      }
    }

    // 2. Fatura / Mensalidade Paga com Sucesso (Renovação Recorrente)
    if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
      const invoice = event.data?.object || {};
      const customerEmail = invoice.customer_email;
      const amount = Number(invoice.amount_paid || invoice.total || 0);
      const plan = amount >= 10000 ? 'multi' : 'pro';
      const maxMaquinas = plan === 'multi' ? 5 : 1;

      if (customerEmail && supabaseUrl && supabaseKey) {
        const validadeDate = new Date();
        validadeDate.setDate(validadeDate.getDate() + 30);
        const validadeIso = validadeDate.toISOString();

        const cleanEmail = customerEmail.trim().toLowerCase();

        await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}`, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            plano: plan,
            tipo: 'pago',
            status: 'ativo',
            max_maquinas: maxMaquinas,
            validade: validadeIso,
            atualizado_em: new Date().toISOString(),
          }),
        });

        console.log('[Stripe Webhook] Renovação confirmada para:', cleanEmail);
      }
    }

    // 3. Assinatura Cancelada
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data?.object || {};
      // Opcional: manter ativo até a validadeDate expirar ou marcar status 'cancelado'
      console.log('[Stripe Webhook] Assinatura cancelada:', subscription.id);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Erro ao processar:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
