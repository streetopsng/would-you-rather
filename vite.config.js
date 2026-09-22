import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function brevoDevServerPlugin() {
  return {
    name: 'brevo-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/send-invite' && req.method === 'POST') {
          const env = loadEnv(server.config.mode, process.cwd(), '')
          const apiKey = env.BREVO_API_KEY || env.VITE_BREVO_API_KEY

          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json')
            if (!apiKey) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'BREVO_API_KEY is not configured in .env' }))
              return
            }

            try {
              const parsed = JSON.parse(body || '{}')
              const { recipientEmail, recipientName, sessionName, gameUrl } = parsed
              const senderName = env.BREVO_SENDER_NAME || 'GummyGum'
              const senderEmail = env.BREVO_SENDER_EMAIL || 'no-reply@gummygum.com'

              const htmlContent = `
                <div style="font-family: 'Inter', sans-serif; padding: 24px; background: #EDEAE4; color: #1A1A1A;">
                  <div style="max-width: 500px; margin: 0 auto; background: #FAF7F2; border-radius: 16px; padding: 32px 24px; text-align: center;">
                    <div style="font-size: 13px; font-weight: 900; letter-spacing: 1.5px; color: #F5821F; text-transform: uppercase;">GummyGum</div>
                    <h1 style="font-size: 24px; font-weight: 900; margin: 12px 0;">You're invited to play Would You Rather!</h1>
                    <p style="font-size: 14px; color: #555555; line-height: 1.6;">Hey ${recipientName || 'there'}, you've been invited to join the <strong>${sessionName || 'Team Bonding'}</strong> session.</p>
                    <a href="${gameUrl}" style="display: inline-block; background: #F5821F; color: #1A1A1A; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: 800; font-size: 14px; margin-top: 12px;">Join Game &rsaquo;</a>
                  </div>
                </div>
              `

              const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
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

              const data = await brevoResponse.json().catch(() => ({}))
              res.statusCode = brevoResponse.status
              res.end(JSON.stringify(data))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    brevoDevServerPlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
