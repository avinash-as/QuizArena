const { Resend } = require('resend')

// Lazily constructed — RESEND_API_KEY may not be set in every environment
// (local dev without email configured), and requiring it at module-load
// time would crash the whole server on boot rather than failing only when
// an email actually needs to go out.
let resendClient = null
const getClient = () => {
  if (!process.env.RESEND_API_KEY) return null
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY)
  return resendClient
}

const FROM = process.env.EMAIL_FROM || 'QuizPitara <onboarding@resend.dev>'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const wrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#151515;border-radius:16px;overflow:hidden;border:1px solid #262626;">
        <tr><td style="padding:28px 32px 0;">
          <div style="font-size:20px;font-weight:900;color:#fff;">Quiz<span style="color:#22c55e;">Pitara</span></div>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;">
          <h1 style="color:#fff;font-size:20px;margin:0 0 12px;">${title}</h1>
          ${bodyHtml}
        </td></tr>
      </table>
      <p style="color:#666;font-size:12px;margin-top:20px;">© ${new Date().getFullYear()} QuizPitara. If you didn't request this, you can safely ignore this email.</p>
    </td></tr>
  </table>
</body>
</html>`

const send = async ({ to, subject, html }) => {
  const client = getClient()
  console.log("================================");
  console.log("EMAIL SERVICE STARTED");
  console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Loaded ✅" : "Missing ❌");
  console.log("EMAIL_FROM:", FROM);
  console.log("CLIENT_URL:", CLIENT_URL);
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("================================");
  if (!client) {
    // No API key configured — don't silently pretend it worked, and don't
    // crash signup either. Log loudly so this is impossible to miss in
    // dev/staging, matching how this codebase already handles optional
    // services elsewhere (e.g. Redis falling back with a console.warn).
    console.warn(`[Email] RESEND_API_KEY not set — would have sent "${subject}" to ${to}. Email NOT sent.`)
    return { sent: false }
  }

  const { data, error } = await client.emails.send({ from: FROM, to, subject, html })
  console.log("Resend Data:", data);
  console.log("Resend Error:", error);
  if (error) {
    console.error('[Email] Resend error:', error)
    throw new Error('Failed to send email')
  }
  return { sent: true, id: data?.id }
}

exports.sendVerificationEmail = async (user, rawToken) => {
  const link = `${CLIENT_URL}/verify-email/${rawToken}`
  return send({
    to: user.email,
    subject: 'Verify your QuizPitara email',
    html: wrapper('Confirm your email', `
      <p style="color:#a3a3a3;font-size:14px;line-height:1.6;">
        Hi ${user.name}, welcome to QuizPitara! Click below to verify your email and activate your account.
        This link expires in 24 hours.
      </p>
      <a href="${link}" style="display:inline-block;margin-top:16px;background:#22c55e;color:#000;font-weight:700;
        text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;">Verify Email</a>
      <p style="color:#666;font-size:12px;margin-top:20px;word-break:break-all;">
        Or paste this link in your browser: ${link}
      </p>
    `),
  })
}

exports.sendPasswordResetEmail = async (user, rawToken) => {
  const link = `${CLIENT_URL}/reset-password/${rawToken}`
  return send({
    to: user.email,
    subject: 'Reset your QuizPitara password',
    html: wrapper('Reset your password', `
      <p style="color:#a3a3a3;font-size:14px;line-height:1.6;">
        Hi ${user.name}, we received a request to reset your password. This link expires in 1 hour.
      </p>
      <a href="${link}" style="display:inline-block;margin-top:16px;background:#22c55e;color:#000;font-weight:700;
        text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;">Reset Password</a>
      <p style="color:#666;font-size:12px;margin-top:20px;word-break:break-all;">
        Or paste this link in your browser: ${link}
      </p>
    `),
  })
}