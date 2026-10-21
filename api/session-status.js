import Stripe from 'stripe';

export default async function handler(req, res) {
  const stripeKey = process.env.TEST_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
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

    return res.status(200).json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
      plan: session.metadata?.plan,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
