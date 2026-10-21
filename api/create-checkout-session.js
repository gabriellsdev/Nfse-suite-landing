import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return res.status(500).json({
      error: 'Chave secreta do Stripe não configurada nas variáveis de ambiente da Vercel (STRIPE_SECRET_KEY).',
    });
  }

  const stripe = new Stripe(stripeKey);

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { plan, userEmail } = body || {};

    let targetId =
      plan === 'multi'
        ? process.env.STRIPE_PRICE_MULTI || 'prod_VTzqoDaoZWc15F'
        : process.env.STRIPE_PRICE_PRO || 'prod_VTzp2lJ34j06ib';

    let priceId = targetId;

    // Se for ID de produto (prod_...), resolve dinamicamente para o ID de preço (price_...)
    if (targetId.startsWith('prod_')) {
      const product = await stripe.products.retrieve(targetId);
      priceId =
        typeof product.default_price === 'string'
          ? product.default_price
          : product.default_price?.id;

      if (!priceId) {
        const prices = await stripe.prices.list({ product: targetId, active: true, limit: 1 });
        if (prices.data.length > 0) {
          priceId = prices.data[0].id;
        } else {
          throw new Error(`Nenhum preço ativo encontrado para o produto ${targetId}`);
        }
      }
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'nfsesuite.com.br';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;

    const sessionParams = {
      ui_mode: 'embedded',
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      return_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}#planos`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        plan: plan || 'pro',
      },
    };

    if (userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
      sessionParams.customer_email = userEmail.trim().toLowerCase();
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('[Stripe Create Checkout] Erro:', err);
    return res.status(500).json({ error: err.message || 'Erro ao iniciar checkout do Stripe.' });
  }
}
