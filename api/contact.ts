/**
 * Serverless API Route para validação e recebimento de mensagens de contato (/api/contact).
 * Compatível com Vercel, Netlify Functions ou runtime Node.js.
 */

export interface ContactRequestBody {
  nome?: string;
  email?: string;
  telefone?: string;
  tipoUso?: string;
  mensagem?: string;
  hp_website?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Utilize POST.' });
  }

  try {
    const body: ContactRequestBody = req.body || {};

    // 1. Anti-spam: Honeypot check
    if (body.hp_website && body.hp_website.trim().length > 0) {
      // Retorna 200 para enganar o bot sem executar processamento
      return res.status(200).json({ ok: true });
    }

    // 2. Sanitização
    const nome = (body.nome || '').replace(/[<>]/g, '').trim();
    const email = (body.email || '').replace(/[<>]/g, '').trim();
    const telefone = (body.telefone || '').replace(/[<>]/g, '').trim();
    const tipoUso = (body.tipoUso || '').replace(/[<>]/g, '').trim();
    const mensagem = (body.mensagem || '').replace(/[<>]/g, '').trim();

    // 3. Validação estrita Server-Side
    if (!nome || nome.length < 3 || nome.length > 100) {
      return res.status(400).json({ error: 'Nome inválido. Mínimo de 3 caracteres.' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Endereço de e-mail inválido.' });
    }

    const phoneDigits = telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return res.status(400).json({ error: 'Telefone com DDD inválido.' });
    }

    if (!mensagem || mensagem.length < 10 || mensagem.length > 1000) {
      return res.status(400).json({ error: 'Mensagem inválida. Mínimo de 10 e máximo de 1000 caracteres.' });
    }

    // 4. Processamento bem-sucedido
    // Aqui uma integração com Resend, Sendgrid, Discord Webhook ou Telegram bot pode ser acoplada
    return res.status(200).json({
      ok: true,
      message: 'Mensagem recebida e validada com sucesso.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro interno ao validar dados no servidor.' });
  }
}
