export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = req.body || {};
  console.log('📥 Nueva sumisión de formulario:', JSON.stringify(payload, null, 2));

  const webhookUrl = process.env.MONITORING_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Nueva sumisión de formulario de HerencIAs',
          payload
        })
      });
    } catch (error) {
      console.error('Error enviando monitorización al webhook:', error);
    }
  }

  res.status(200).json({ ok: true });
}
