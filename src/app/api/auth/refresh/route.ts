import { NextRequest, NextResponse } from 'next/server';
import { refreshSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('admin_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true });
    await refreshSession(res, refreshToken);

    return res;
  } catch (err) {
    console.error('Refresh error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
