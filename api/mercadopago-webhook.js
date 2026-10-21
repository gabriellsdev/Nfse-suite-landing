/**
 * Serverless API Route para Webhook do Mercado Pago (/api/mercadopago-webhook).
 * Recebe notificações de pagamento e assinaturas recorrentes (IPN / Webhook)
 * e atualiza automaticamente a licença no Supabase.
 */

export default async function handler(req, res) {
  // O Mercado Pago pode enviar GET para validação de URL ou POST para eventos
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Endpoint do Webhook Mercado Pago ativo.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST ou GET.' });
  }

  try {
    const query = req.query || {};
    const body = req.body || {};

    // Extrai o ID do recurso (pagamento ou assinatura preapproval)
    const resourceId = query['data.id'] || query.id || body?.data?.id || body?.id;
    const topic = query.type || query.topic || body?.type || body?.topic || 'payment';

    console.log('[Mercado Pago Webhook] Evento recebido:', { topic, resourceId });

    if (!resourceId) {
      return res.status(200).json({ ok: true, message: 'Ping recebido sem ID de recurso.' });
    }

    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!mpAccessToken || !supabaseUrl || !supabaseKey) {
      console.warn('[Mercado Pago Webhook] Variáveis de ambiente MERCADOPAGO_ACCESS_TOKEN ou SUPABASE não configuradas no Vercel.');
      return res.status(200).json({
        ok: true,
        warning: 'Variáveis de ambiente pendentes no Vercel. Evento registrado.',
        received: { topic, resourceId },
      });
    }

    // Consulta os detalhes no Mercado Pago
    let payerEmail = null;
    let isApproved = false;
    let planType = 'pro';
    let maxMaquinas = 1;

    if (topic.includes('subscription') || topic === 'preapproval') {
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${resourceId}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` },
      });
      if (mpRes.ok) {
        const subData = await mpRes.json();
        payerEmail = subData.payer_email || subData.payer?.email;
        isApproved = subData.status === 'authorized';
        const amount = Number(subData.auto_recurring?.transaction_amount || 0);
        if (amount >= 100 || (subData.reason && subData.reason.toLowerCase().includes('multi'))) {
          planType = 'multi';
          maxMaquinas = 5;
        }
      }
    } else {
      // Consulta Pagamento Avulso / PIX / Cartão
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` },
      });
      if (mpRes.ok) {
        const payData = await mpRes.json();
        payerEmail = payData.payer?.email;
        isApproved = payData.status === 'approved';
        const amount = Number(payData.transaction_amount || 0);
        if (amount >= 100 || (payData.description && payData.description.toLowerCase().includes('multi'))) {
          planType = 'multi';
          maxMaquinas = 5;
        }
      }
    }

    if (!payerEmail || !isApproved) {
      return res.status(200).json({
        ok: true,
        message: 'Evento processado (pagamento pendente ou sem e-mail do pagador).',
        status: isApproved ? 'approved' : 'pending',
      });
    }

    // Validade: 30 dias a partir de hoje
    const validadeDate = new Date();
    validadeDate.setDate(validadeDate.getDate() + 30);
    const validadeIso = validadeDate.toISOString();

    // Atualiza na tabela 'licencas' do Supabase via REST API
    const cleanEmail = payerEmail.trim().toLowerCase();
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        plano: planType,
        tipo: 'pago',
        status: 'ativo',
        max_maquinas: maxMaquinas,
        validade: validadeIso,
        atualizado_em: new Date().toISOString(),
      }),
    });

    const updated = await updateRes.json();

    console.log('[Mercado Pago Webhook] Licença atualizada com sucesso no Supabase para:', cleanEmail, {
      plano: planType,
      max_maquinas: maxMaquinas,
      validade: validadeIso,
    });

    return res.status(200).json({
      ok: true,
      message: 'Licença liberada com sucesso!',
      email: cleanEmail,
      plano: planType,
      validade: validadeIso,
    });
  } catch (err) {
    console.error('[Mercado Pago Webhook] Erro ao processar:', err);
    return res.status(200).json({ ok: false, error: err.message });
  }
}
