import Stripe from 'stripe';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  const stripeKey = getStripeSecretKey();
  if (!stripeKey) {
    return res.status(500).json({
      error: 'Chave secreta do Stripe não configurada nas variáveis de ambiente da Vercel (STRIPE_SECRET_KEY ou TEST_STRIPE_SECRET_KEY).',
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
        ? (process.env.TEST_STRIPE_PRICE_MULTI || process.env.STRIPE_PRICE_MULTI || 'prod_VTzqoDaoZWc15F')
        : (process.env.TEST_STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO || 'prod_VTzp2lJ34j06ib');

    let priceId = targetId;

    // Se for ID de produto (prod_...), resolve dinamicamente para o ID de preço (price_...)
    if (targetId && targetId.startsWith('prod_')) {
      try {
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
      } catch (err) {
        // Se estiver em modo de teste e o ID do produto Live não existir no Sandbox, gera automaticamente produto/preço de teste
        const isTest = stripeKey.startsWith('sk_test_') || stripeKey.startsWith('rk_test_');
        if (isTest) {
          console.log(`[Stripe Test] Produto ${targetId} não existe no Sandbox. Localizando ou criando produto de teste...`);
          const testProdName = plan === 'multi' ? 'NFSe Suite - Plano Multi-CNPJ (Teste)' : 'NFSe Suite - Plano Pro Individual (Teste)';
          const testAmount = plan === 'multi' ? 12900 : 4900;

          const existing = await stripe.products.list({ active: true, limit: 20 });
          const matched = existing.data.find((p) => p.name === testProdName);
          if (matched && matched.default_price) {
            priceId = typeof matched.default_price === 'string' ? matched.default_price : matched.default_price.id;
          } else {
            const newProduct = await stripe.products.create({
              name: testProdName,
              default_price_data: {
                unit_amount: testAmount,
                currency: 'brl',
                recurring: { interval: 'month' },
              },
            });
            priceId = typeof newProduct.default_price === 'string' ? newProduct.default_price : newProduct.default_price.id;
          }
        } else {
          throw err;
        }
      }
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'nfsesuite.com.br';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;

    const sessionParams = {
      ui_mode: 'embedded_page',
      mode: 'subscription',
      locale: 'pt-BR',
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

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (createErr) {
      // Compatibilidade reversa caso a conta do Stripe espere 'embedded' em vez de 'embedded_page'
      if (createErr.message && (createErr.message.includes('embedded_page') || createErr.message.includes('ui_mode'))) {
        session = await stripe.checkout.sessions.create({
          ...sessionParams,
          ui_mode: 'embedded',
        });
      } else {
        throw createErr;
      }
    }

    return res.status(200).json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (err) {
    console.error('[Stripe Create Checkout] Erro:', err);
    return res.status(500).json({ error: err.message || 'Erro ao iniciar checkout do Stripe.' });
  }
}
