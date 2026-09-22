export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.BREVO_API_KEY || process.env.VITE_BREVO_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'BREVO_API_KEY is not configured on the server' })
  }

  const { recipientEmail, recipientName, sessionName, gameUrl } = req.body || {}
  if (!recipientEmail) {
    return res.status(400).json({ error: 'recipientEmail is required' })
  }

  const senderName = process.env.BREVO_SENDER_NAME || 'GummyGum'
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@gummygum.com'

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; background: #EDEAE4; margin: 0; padding: 24px; color: #1A1A1A; }
          .card { background: #FAF7F2; border-radius: 16px; border: 1.5px solid #E0DBD4; max-width: 500px; margin: 0 auto; padding: 32px 24px; text-align: center; }
          .brand { font-size: 13px; font-weight: 900; letter-spacing: 1.5px; color: #F5821F; text-transform: uppercase; margin-bottom: 12px; }
          h1 { font-size: 26px; font-weight: 900; margin: 0 0 12px; line-height: 1.2; }
          p { font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 24px; }
          .btn { display: inline-block; background: #F5821F; color: #1A1A1A; text-decoration: none; padding: 14px 28px; border-radius: 50px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 0 #E8710A; }
          .footer { font-size: 11px; color: #999999; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">GummyGum</div>
          <h1>You're invited to play Would You Rather!</h1>
          <p>Hey ${recipientName || 'there'}, you've been invited to join the <strong>${sessionName || 'Team Bonding'}</strong> session.</p>
          <a href="${gameUrl}" class="btn">Join Game Session &rsaquo;</a>
          <div class="footer">No sign-up or preparation required. Just jump in and make your choices!</div>
        </div>
      </body>
    </html>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail, name: recipientName || recipientEmail }],
        subject: `You're invited: Would You Rather — ${sessionName || 'Team Bonding'}`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: errorData.message || 'Brevo API error' })
    }

    const data = await response.json()
    return res.status(200).json({ success: true, messageId: data.messageId })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to dispatch email' })
  }
}
