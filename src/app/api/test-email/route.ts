import { NextRequest, NextResponse } from 'next/server';
import { sendInviteEmail } from '@/lib/email';

// Temporary test endpoint - remove after verifying emails work
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json({
      error: 'Missing ?to= parameter',
      usage: '/api/test-email?to=your@email.com',
    }, { status: 400 });
  }

  const result = await sendInviteEmail({
    to,
    inviterName: 'Test Admin',
    role: 'ADMIN',
    inviteLink: 'https://cetech-academy-admin.vercel.app/invite/accept?token=test123',
  });

  return NextResponse.json({
    result,
    apiKeySet: !!process.env.RESEND_API_KEY,
    apiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 6) + '...',
  });
}
