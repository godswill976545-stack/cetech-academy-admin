import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('admin_refresh_token')?.value;
    const res = NextResponse.json({ success: true });

    if (refreshToken) {
      await destroySession(res, refreshToken);
    }

    return res;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
