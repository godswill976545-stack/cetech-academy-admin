import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendInviteEmail({
  to,
  inviterName,
  role,
  inviteLink,
}: {
  to: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured. Set RESEND_API_KEY.' };
  }

  try {
    console.log(`[Email] Sending invitation to ${to} from onboarding@resend.dev`);

    const { data, error } = await getResend().emails.send({
      from: 'CeTech Admin <onboarding@resend.dev>',
      to: [to],
      subject: `You've been invited to join CeTech Academy Admin`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#1e293b;border-radius:12px;border:1px solid #334155;overflow:hidden;">
            <div style="background:#0ea5e9;padding:24px;text-align:center;">
              <h1 style="color:white;margin:0;font-size:22px;">CeTech Academy Admin</h1>
            </div>
            <div style="padding:32px 24px;">
              <h2 style="color:#f1f5f9;margin:0 0 16px;font-size:20px;">You're Invited!</h2>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 16px;">
                <strong style="color:#e2e8f0;">${inviterName}</strong> has invited you to join the CeTech Academy Admin Portal as a <strong style="color:#0ea5e9;">${role}</strong>.
              </p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Click the button below to accept the invitation and set your password:
              </p>
              <div style="text-align:center;margin:0 0 24px;">
                <a href="${inviteLink}" style="display:inline-block;background:#0ea5e9;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
                  Accept Invitation
                </a>
              </div>
              <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0 0 8px;">
                This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
              <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color:#0ea5e9;word-break:break-all;">${inviteLink}</a>
              </p>
            </div>
            <div style="padding:16px 24px;border-top:1px solid #334155;text-align:center;">
              <p style="color:#475569;font-size:12px;margin:0;">© 2026 CeTech Academy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email] Resend API error:', JSON.stringify(error));
      return { success: false, error: error.message || 'Email send failed' };
    }

    console.log('[Email] Sent successfully, ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Email] Exception:', err?.message || err);
    return { success: false, error: err?.message || 'Email send failed' };
  }
}
