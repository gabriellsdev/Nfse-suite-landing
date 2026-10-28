import crypto from 'node:crypto';
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

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://nqdzhtfejmxynjfwadmi.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    serviceKey;
  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ''),
    serviceKey,
    anonKey,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
  };
}

function getHmacSecret() {
  return (
    process.env.PORTAL_JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.TEST_STRIPE_SECRET_KEY ||
    'nfse-suite-portal-secret-key'
  );
}

function signToken(payloadObj) {
  const data = Buffer.from(JSON.stringify(payloadObj), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', getHmacSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifySignedToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', getHmacSecret()).update(data).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (parsed.exp && Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchCustomerDashboard(cleanEmail) {
  const { supabaseUrl, headers } = getSupabaseConfig();
  const stripeKey = getStripeSecretKey();
  const stripe = stripeKey ? new Stripe(stripeKey) : null;

  // 1. Busca licença no Supabase
  const licRes = await fetch(
    `${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}&select=*&limit=1`,
    { headers }
  );
  const licRows = licRes.ok ? await licRes.json() : [];
  const licenca = Array.isArray(licRows) && licRows.length > 0 ? licRows[0] : null;

  if (!licenca) {
    return null;
  }

  // 2. Busca máquinas ativas vinculadas a esta licença
  let maquinas = [];
  if (licenca.id) {
    const maqRes = await fetch(
      `${supabaseUrl}/rest/v1/maquinas_ativas?licenca_id=eq.${encodeURIComponent(licenca.id)}&ativo=eq.true&order=ultimo_ping.desc`,
      { headers }
    );
    if (maqRes.ok) {
      const maqRows = await maqRes.json();
      if (Array.isArray(maqRows)) {
        maquinas = maqRows;
      }
    }
  }

  // 3. Consulta informações da assinatura no Stripe (se existir)
  let stripeInfo = {
    hasStripeCustomer: false,
    subscriptionId: null,
    subscriptionStatus: null,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    eligibleFor7DayRefund: false,
    latestChargeId: null,
    latestPaymentIntentId: null,
  };

  if (stripe) {
    try {
      const customers = await stripe.customers.list({ email: cleanEmail, limit: 1 });
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        stripeInfo.hasStripeCustomer = true;

        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 5,
        });

        const activeSub =
          subs.data.find((s) => ['active', 'trialing', 'past_due'].includes(s.status)) ||
          subs.data[0];

        if (activeSub) {
          stripeInfo.subscriptionId = activeSub.id;
          stripeInfo.subscriptionStatus = activeSub.status;
          stripeInfo.cancelAtPeriodEnd = Boolean(activeSub.cancel_at_period_end);
          stripeInfo.currentPeriodEnd = activeSub.current_period_end
            ? new Date(activeSub.current_period_end * 1000).toISOString()
            : null;

          // Verifica elegibilidade de reembolso de 7 dias (Art. 49 do CDC)
          const subCreatedMs = (activeSub.created || 0) * 1000;
          const diffDays = (Date.now() - subCreatedMs) / (1000 * 60 * 60 * 24);
          if (diffDays <= 7.5 && ['active', 'trialing', 'past_due'].includes(activeSub.status)) {
            stripeInfo.eligibleFor7DayRefund = true;
          }
        }

        const charges = await stripe.charges.list({ customer: customer.id, limit: 3 });
        const paidCharge = charges.data.find((c) => c.paid && !c.refunded);
        if (paidCharge) {
          stripeInfo.latestChargeId = paidCharge.id;
          stripeInfo.latestPaymentIntentId =
            typeof paidCharge.payment_intent === 'string'
              ? paidCharge.payment_intent
              : paidCharge.payment_intent?.id || null;

          const chargeCreatedMs = (paidCharge.created || 0) * 1000;
          const chargeDiffDays = (Date.now() - chargeCreatedMs) / (1000 * 60 * 60 * 24);
          if (chargeDiffDays <= 7.5 && stripeInfo.subscriptionStatus !== 'canceled') {
            stripeInfo.eligibleFor7DayRefund = true;
          }
        }
      }
    } catch (err) {
      console.warn('[Client Portal] Aviso ao consultar Stripe:', err.message);
    }
  }

  return {
    licenca,
    maquinas,
    stripeInfo,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { action } = body || {};
  const { supabaseUrl, serviceKey, anonKey, headers } = getSupabaseConfig();

  if (!serviceKey) {
    return res.status(500).json({
      error: 'Configuração do servidor incompleta (SUPABASE_SERVICE_ROLE_KEY ausente).',
    });
  }

  try {
    // =========================================================================
    // 1. ENVIAR CÓDIGO DE 6 DÍGITOS POR E-MAIL (send_otp)
    // =========================================================================
    if (action === 'send_otp') {
      const cleanEmail = String(body.email || '').trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      }

      // Verifica se existe licença associada a este e-mail
      const licRes = await fetch(
        `${supabaseUrl}/rest/v1/licencas?email=eq.${encodeURIComponent(cleanEmail)}&select=id,email,cliente_nome,plano,status&limit=1`,
        { headers }
      );
      const licRows = licRes.ok ? await licRes.json() : [];
      if (!Array.isArray(licRows) || licRows.length === 0) {
        return res.status(404).json({
          error:
            'Nenhuma licença ou assinatura foi encontrada para este e-mail. Verifique se digitou o mesmo e-mail utilizado na compra ou no login do aplicativo.',
        });
      }

      const otpCode = String(crypto.randomInt(100000, 999999));
      const challengeToken = signToken({
        type: 'otp_challenge',
        email: cleanEmail,
        codeHash: crypto.createHash('sha256').update(`${cleanEmail}:${otpCode}`).digest('hex'),
        exp: Date.now() + 15 * 60 * 1000, // 15 minutos
      });

      let sentViaResend = false;

      // Se houver RESEND_API_KEY configurada, envia e-mail transacional com o código de 6 dígitos
      if (process.env.RESEND_API_KEY) {
        try {
          const resendFrom =
            process.env.RESEND_FROM_EMAIL || 'NFSe Nacional Suite <nao-responda@nfsesuite.com.br>';
          const rRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: resendFrom,
              to: [cleanEmail],
              subject: `${otpCode} é o seu código de acesso — NFSe Nacional Suite`,
              html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; color: #0f172a;">
                  <h2 style="margin: 0 0 8px; color: #0f172a;">Código de Verificação — Área do Cliente</h2>
                  <p style="font-size: 14px; color: #475569; line-height: 1.5;">
                    Utilize o código de 6 dígitos abaixo para acessar o gerenciamento da sua assinatura e computadores no site <strong>NFSe Nacional Suite</strong>:
                  </p>
                  <div style="background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #0f766e; font-family: monospace;">${otpCode}</span>
                  </div>
                  <p style="font-size: 12px; color: #64748b;">
                    Este código é válido por 15 minutos. Se você não solicitou este código, ignore este e-mail.
                  </p>
                </div>
              `,
            }),
          });
          if (rRes.ok) {
            sentViaResend = true;
          }
        } catch (err) {
          console.warn('[Client Portal] Falha ao enviar via Resend:', err.message);
        }
      }

      // Se não enviou via Resend, dispara o OTP nativo do Supabase Auth (/auth/v1/otp)
      if (!sentViaResend) {
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'nfsesuite.com.br';
        const proto = req.headers['x-forwarded-proto'] || 'https';
        const redirectTo = `${proto}://${host}/?portal_auth=1`;

        const supOtpRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
          method: 'POST',
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            create_user: true,
            options: {
              emailRedirectTo: redirectTo,
            },
          }),
        });

        if (!supOtpRes.ok) {
          const errData = await supOtpRes.json().catch(() => ({}));
          return res.status(429).json({
            error:
              errData.msg ||
              errData.error_description ||
              'Aguarde 60 segundos antes de solicitar um novo código para este e-mail.',
          });
        }
      }

      return res.status(200).json({
        ok: true,
        challengeToken,
        message: 'Enviamos um código de verificação de 6 dígitos para o seu e-mail.',
      });
    }

    // =========================================================================
    // 2. VALIDAR CÓDIGO DE 6 DÍGITOS OU TOKEN DE SESSÃO (verify_otp)
    // =========================================================================
    if (action === 'verify_otp') {
      const cleanEmail = String(body.email || '').trim().toLowerCase();
      const cleanCode = String(body.code || '').trim();
      const challengeToken = String(body.challengeToken || '');
      const accessToken = String(body.accessToken || '');

      let verifiedEmail = null;

      // Caso A: Autenticação via token de sessão do Supabase (ex: Magic Link / OAuth)
      if (accessToken) {
        const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData && userData.email) {
            verifiedEmail = userData.email.trim().toLowerCase();
          }
        }
      }

      // Caso B: Código de 6 dígitos validado pelo challengeToken HMAC (Resend)
      if (!verifiedEmail && cleanEmail && cleanCode && challengeToken) {
        const parsedChallenge = verifySignedToken(challengeToken);
        if (
          parsedChallenge &&
          parsedChallenge.type === 'otp_challenge' &&
          parsedChallenge.email === cleanEmail
        ) {
          const expectedHash = crypto
            .createHash('sha256')
            .update(`${cleanEmail}:${cleanCode}`)
            .digest('hex');
          if (parsedChallenge.codeHash === expectedHash) {
            verifiedEmail = cleanEmail;
          }
        }
      }

      // Caso C: Código de 6 dígitos validado via Supabase Auth (/auth/v1/verify)
      if (!verifiedEmail && cleanEmail && cleanCode) {
        for (const verifyType of ['email', 'magiclink', 'signup']) {
          const verifyRes = await fetch(`${supabaseUrl}/auth/v1/verify`, {
            method: 'POST',
            headers: {
              apikey: anonKey,
              Authorization: `Bearer ${anonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: verifyType,
              email: cleanEmail,
              token: cleanCode,
            }),
          });
          if (verifyRes.ok) {
            verifiedEmail = cleanEmail;
            break;
          }
        }
      }

      if (!verifiedEmail) {
        return res.status(401).json({
          error: 'Código inválido ou expirado. Verifique os 6 dígitos enviados ao seu e-mail e tente novamente.',
        });
      }

      const dashboard = await fetchCustomerDashboard(verifiedEmail);
      if (!dashboard) {
        return res.status(404).json({
          error: 'Nenhuma licença encontrada para este e-mail.',
        });
      }

      const portalToken = signToken({
        type: 'portal_session',
        email: verifiedEmail,
        licencaId: dashboard.licenca.id,
        exp: Date.now() + 60 * 60 * 1000, // 1 hora
      });

      return res.status(200).json({
        ok: true,
        portalToken,
        ...dashboard,
      });
    }

    // =========================================================================
    // DEMAIS AÇÕES AUTENTICADAS PELO PORTAL TOKEN
    // =========================================================================
    const session = verifySignedToken(body.portalToken);
    if (!session || session.type !== 'portal_session' || !session.email) {
      return res.status(401).json({
        error: 'Sua sessão na Área do Cliente expirou. Por favor, valide seu e-mail novamente.',
      });
    }

    // 3. ATUALIZAR DASHBOARD (get_dashboard)
    if (action === 'get_dashboard') {
      const dashboard = await fetchCustomerDashboard(session.email);
      return res.status(200).json({
        ok: true,
        ...dashboard,
      });
    }

    // 4. DESCONECTAR COMPUTADOR (disconnect_machine)
    if (action === 'disconnect_machine') {
      const machineRowId = String(body.machineRowId || '').trim();
      if (!machineRowId) {
        return res.status(400).json({ error: 'ID da máquina não informado.' });
      }

      const dashboardBefore = await fetchCustomerDashboard(session.email);
      if (!dashboardBefore || !dashboardBefore.licenca) {
        return res.status(404).json({ error: 'Licença não localizada.' });
      }

      const targetMachine = dashboardBefore.maquinas.find((m) => m.id === machineRowId);
      if (!targetMachine) {
        return res.status(403).json({
          error: 'Este computador não pertence à sua licença ou já foi desconectado.',
        });
      }

      // Desativa a máquina na tabela maquinas_ativas
      await fetch(
        `${supabaseUrl}/rest/v1/maquinas_ativas?id=eq.${encodeURIComponent(machineRowId)}&licenca_id=eq.${encodeURIComponent(dashboardBefore.licenca.id)}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            ativo: false,
          }),
        }
      );

      const dashboardAfter = await fetchCustomerDashboard(session.email);
      return res.status(200).json({
        ok: true,
        message: 'Computador desconectado com sucesso! A vaga já está liberada.',
        ...dashboardAfter,
      });
    }

    // 5. ABRIR PORTAL DE FATURAS / CARTÃO DO STRIPE (billing_portal)
    if (action === 'billing_portal') {
      const stripeKey = getStripeSecretKey();
      if (!stripeKey) {
        return res.status(500).json({ error: 'Chave do Stripe não configurada.' });
      }
      const stripe = new Stripe(stripeKey);
      const customers = await stripe.customers.list({ email: session.email, limit: 1 });
      if (customers.data.length === 0) {
        return res.status(404).json({
          error: 'Nenhum cadastro de faturamento recorrente encontrado no Stripe para este e-mail.',
        });
      }

      const host = req.headers['x-forwarded-host'] || req.headers.host || 'nfsesuite.com.br';
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const returnUrl = `${proto}://${host}/#planos`;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customers.data[0].id,
        return_url: returnUrl,
      });

      return res.status(200).json({
        ok: true,
        url: portalSession.url,
      });
    }

    // 6. CANCELAR ASSINATURA OU SOLICITAR REEMBOLSO DE 7 DIAS COM FEEDBACK (cancel_or_refund)
    if (action === 'cancel_or_refund') {
      const requestType = body.requestType === 'refund' ? 'refund' : 'cancel';
      const motivo = String(body.motivo || '').replace(/[<>]/g, '').trim();
      const melhoria = String(body.melhoria || '').replace(/[<>]/g, '').trim();

      if (!motivo) {
        return res.status(400).json({
          error: 'Por favor, selecione o motivo principal para prosseguir.',
        });
      }
      if (!melhoria || melhoria.length < 5) {
        return res.status(400).json({
          error: 'Por favor, conte-nos brevemente o que poderíamos melhorar (mínimo de 5 caracteres).',
        });
      }

      const dashboard = await fetchCustomerDashboard(session.email);
      if (!dashboard || !dashboard.licenca) {
        return res.status(404).json({ error: 'Licença não encontrada.' });
      }

      // 6.1 Registra o feedback na tabela public.feedbacks_cancelamento (se existir no Supabase)
      try {
        await fetch(`${supabaseUrl}/rest/v1/feedbacks_cancelamento`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            licenca_id: dashboard.licenca.id,
            email: session.email,
            plano: dashboard.licenca.plano,
            tipo_solicitacao: requestType === 'refund' ? 'reembolso_7_dias' : 'cancelamento_renovacao',
            motivo,
            sugestao_melhoria: melhoria,
            criado_em: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.warn('[Client Portal] Aviso ao gravar em feedbacks_cancelamento:', err.message);
      }

      const stripeKey = getStripeSecretKey();
      const stripe = stripeKey ? new Stripe(stripeKey) : null;

      if (!stripe) {
        return res.status(500).json({ error: 'Stripe não configurado no servidor.' });
      }

      const customers = await stripe.customers.list({ email: session.email, limit: 1 });
      const customer = customers.data[0];

      // Salva o feedback também nos metadados do cliente no Stripe para auditoria garantida
      if (customer) {
        await stripe.customers
          .update(customer.id, {
            metadata: {
              ...(customer.metadata || {}),
              ultimo_feedback_tipo: requestType === 'refund' ? 'reembolso_7_dias' : 'cancelamento',
              ultimo_feedback_motivo: motivo.slice(0, 450),
              ultimo_feedback_melhoria: melhoria.slice(0, 450),
              ultimo_feedback_data: new Date().toISOString(),
            },
          })
          .catch(() => null);
      }

      if (requestType === 'refund') {
        if (!dashboard.stripeInfo.eligibleFor7DayRefund) {
          return res.status(400).json({
            error:
              'O prazo legal de 7 dias corridos para reembolso automático já foi encerrado. Você ainda pode cancelar a renovação da assinatura sem multas.',
          });
        }

        // Executa o estorno no Stripe
        if (dashboard.stripeInfo.latestPaymentIntentId) {
          await stripe.refunds.create({
            payment_intent: dashboard.stripeInfo.latestPaymentIntentId,
            reason: 'requested_by_customer',
            metadata: {
              email: session.email,
              motivo: motivo.slice(0, 450),
              melhoria: melhoria.slice(0, 450),
            },
          });
        } else if (dashboard.stripeInfo.latestChargeId) {
          await stripe.refunds.create({
            charge: dashboard.stripeInfo.latestChargeId,
            reason: 'requested_by_customer',
          });
        }

        // Cancela a assinatura imediatamente no Stripe
        if (dashboard.stripeInfo.subscriptionId) {
          await stripe.subscriptions.cancel(dashboard.stripeInfo.subscriptionId).catch(() => null);
        }

        // Atualiza a licença no Supabase para 'cancelado' e encerra validade
        await fetch(
          `${supabaseUrl}/rest/v1/licencas?id=eq.${encodeURIComponent(dashboard.licenca.id)}`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              status: 'cancelado',
              expira_em: new Date().toISOString(),
              atualizado_em: new Date().toISOString(),
            }),
          }
        );

        const updatedDashboard = await fetchCustomerDashboard(session.email);
        return res.status(200).json({
          ok: true,
          message:
            'Reembolso integral solicitado e assinatura encerrada com sucesso! O estorno aparecerá na fatura do seu cartão conforme o prazo da operadora.',
          ...updatedDashboard,
        });
      } else {
        // Cancelamento de renovação futura (mantém o acesso até o fim do período já pago)
        if (dashboard.stripeInfo.subscriptionId) {
          await stripe.subscriptions.update(dashboard.stripeInfo.subscriptionId, {
            cancel_at_period_end: true,
            metadata: {
              feedback_motivo: motivo.slice(0, 450),
              feedback_melhoria: melhoria.slice(0, 450),
            },
          });
        } else {
          // Caso não tenha assinatura Stripe vinculada, marca como cancelado mantendo a data expira_em
          await fetch(
            `${supabaseUrl}/rest/v1/licencas?id=eq.${encodeURIComponent(dashboard.licenca.id)}`,
            {
              method: 'PATCH',
              headers,
              body: JSON.stringify({
                status: 'cancelado',
                atualizado_em: new Date().toISOString(),
              }),
            }
          );
        }

        const updatedDashboard = await fetchCustomerDashboard(session.email);
        return res.status(200).json({
          ok: true,
          message:
            'Renovação automática cancelada com sucesso! Agradecemos o seu feedback. Seu acesso permanece liberado até o final do período vigente.',
          ...updatedDashboard,
        });
      }
    }

    return res.status(400).json({ error: 'Ação inválida.' });
  } catch (err) {
    console.error('[Client Portal API] Erro:', err);
    return res.status(500).json({
      error: err.message || 'Erro interno ao processar solicitação na Área do Cliente.',
    });
  }
}
