/**
 * Secure Brevo Email Client
 * Dispatches transactional email requests through the backend /api/send-invite endpoint
 * to keep BREVO_API_KEY private on the server and completely shielded from the browser.
 */

export const isBrevoConfigured = true

/**
 * Send an email invite through the backend serverless endpoint
 */
export async function sendGameInviteEmail({
  recipientEmail,
  recipientName,
  sessionName,
  gameUrl,
}) {
  try {
    const response = await fetch('/api/send-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail,
        recipientName,
        sessionName,
        gameUrl,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Server returned ${response.status}`)
    }

    const data = await response.json()
    return { success: true, messageId: data.messageId, recipient: recipientEmail }
  } catch (error) {
    console.error(`[Brevo Client] Failed to send email to ${recipientEmail}:`, error)
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
        gameUrl: `${gameUrl}?session=${encodeURIComponent(sessionName)}&email=${encodeURIComponent(
          p.email || `${p.name.toLowerCase()}@gummygum.com`
        )}`,
      })
    )
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success).length
  return {
    total: participants.length,
    succeeded,
  }
}
