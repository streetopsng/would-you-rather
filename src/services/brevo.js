const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY
const BREVO_SENDER_NAME = import.meta.env.VITE_BREVO_SENDER_NAME || 'GummyGum'
const BREVO_SENDER_EMAIL = import.meta.env.VITE_BREVO_SENDER_EMAIL || 'no-reply@gummygum.com'

export const isBrevoConfigured = Boolean(
  BREVO_API_KEY &&
  BREVO_API_KEY !== 'your_brevo_api_key_here'
)

/**
 * Send an email invite using the Brevo Transactional Email API v3
 */
export async function sendGameInviteEmail({
  recipientEmail,
  recipientName,
  sessionName,
  gameUrl,
}) {
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
          <p>Hey ${recipientName}, you've been invited to join the <strong>${sessionName}</strong> team bonding session.</p>
          <a href="${gameUrl}" class="btn">Join Game Session &rsaquo;</a>
          <div class="footer">No sign-up or preparation required. Just jump in and make your choices!</div>
        </div>
      </body>
    </html>
  `

  if (!isBrevoConfigured) {
    console.info(`[Brevo Simulation] Email invitation generated for ${recipientName} (${recipientEmail}) with URL: ${gameUrl}`)
    return { success: true, simulated: true, recipient: recipientEmail }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: recipientEmail,
            name: recipientName,
          },
        ],
        subject: `You're invited: Would You Rather — ${sessionName}`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Brevo API error: ${response.status}`)
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId, recipient: recipientEmail }
  } catch (error) {
    console.error(`[Brevo] Failed to send email to ${recipientEmail}:`, error)
    return { success: false, error: error.message, recipient: recipientEmail }
  }
}

/**
 * Send invites to all selected participants
 */
export async function sendBulkGameInvites({ participants, sessionName, gameUrl }) {
  const results = await Promise.allSettled(
    participants.map((p) =>
      sendGameInviteEmail({
        recipientEmail: p.email || `${p.name.toLowerCase()}@gummygum.com`,
        recipientName: p.name,
        sessionName,
        gameUrl: `${gameUrl}?session=${encodeURIComponent(sessionName)}&email=${encodeURIComponent(p.email || `${p.name.toLowerCase()}@gummygum.com`)}`,
      })
    )
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success).length
  return {
    total: participants.length,
    succeeded,
    isSimulated: !isBrevoConfigured,
  }
}
