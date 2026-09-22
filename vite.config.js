import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function serverApiPlugin() {
  return {
    name: 'server-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const env = loadEnv(server.config.mode, process.cwd(), '')

        // Firebase Config Endpoint for local dev
        if (req.url === '/api/firebase-config' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              apiKey: env.FIREBASE_API_KEY || env.VITE_FIREBASE_API_KEY || '',
              authDomain: env.FIREBASE_AUTH_DOMAIN || env.VITE_FIREBASE_AUTH_DOMAIN || '',
              databaseURL: env.FIREBASE_DATABASE_URL || env.VITE_FIREBASE_DATABASE_URL || '',
              projectId: env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || '',
              storageBucket: env.FIREBASE_STORAGE_BUCKET || env.VITE_FIREBASE_STORAGE_BUCKET || '',
              messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
              appId: env.FIREBASE_APP_ID || env.VITE_FIREBASE_APP_ID || '',
              measurementId: env.FIREBASE_MEASUREMENT_ID || env.VITE_FIREBASE_MEASUREMENT_ID || '',
            })
          )
          return
        }

        // Brevo Send Invite Endpoint for local dev
        if (req.url === '/api/send-invite' && req.method === 'POST') {
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Safely map both un-prefixed FIREBASE_* and prefixed VITE_FIREBASE_*
  // so Vercel can accept them without public prefix warnings
  const getVar = (k, vk) => process.env[k] || env[k] || process.env[vk] || env[vk] || ''

  const firebaseDefines = {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(
      getVar('FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY')
    ),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(
      getVar('FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN')
    ),
    'import.meta.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(
      getVar('FIREBASE_DATABASE_URL', 'VITE_FIREBASE_DATABASE_URL')
    ),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(
      getVar('FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID')
    ),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(
      getVar('FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET')
    ),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(
      getVar('FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID')
    ),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(
      getVar('FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID')
    ),
    'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(
      getVar('FIREBASE_MEASUREMENT_ID', 'VITE_FIREBASE_MEASUREMENT_ID')
    ),
  }

  return {
    define: firebaseDefines,
    plugins: [
      react(),
      tailwindcss(),
      serverApiPlugin(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.js',
    },
  }
})
