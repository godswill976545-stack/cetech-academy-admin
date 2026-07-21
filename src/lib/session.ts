import { NextResponse } from 'next/server';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth-utils';

const supabase = createMainRepoAdminClient();

const ACCESS_MAX_AGE = 60 * 15;        // 15 minutes
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function setCookies(res: NextResponse, accessToken: string, refreshToken: string): NextResponse {
  res.cookies.set('admin_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookies.set('admin_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: REFRESH_MAX_AGE,
  });
  return res;
}

function clearCookies(res: NextResponse): NextResponse {
  res.cookies.set('admin_access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('admin_refresh_token', '', { httpOnly: true, path: '/api/auth/refresh', maxAge: 0 });
  return res;
}

export async function createSession(userId: string, userAgent?: string): Promise<NextResponse> {
  const accessToken = await generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);

  const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE * 1000).toISOString();

  await supabase.from('admin_sessions').insert({
    user_id: userId,
    refresh_token: refreshToken,
    user_agent: userAgent || null,
    expires_at: expiresAt,
  });

  const res = NextResponse.json({ success: true });
  return setCookies(res, accessToken, refreshToken);
}

export async function destroySession(refreshToken: string): Promise<NextResponse> {
  await supabase.from('admin_sessions').delete().eq('refresh_token', refreshToken);
  const res = NextResponse.json({ success: true });
  return clearCookies(res);
}

export async function refreshSession(oldRefreshToken: string): Promise<NextResponse> {
  const payload = await verifyRefreshToken(oldRefreshToken);
  if (!payload) {
    const res = NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 });
    return clearCookies(res);
  }

  // Verify session exists in DB and not expired
  const { data: session } = await supabase
    .from('admin_sessions')
    .select('id')
    .eq('refresh_token', oldRefreshToken)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!session) {
    const res = NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    return clearCookies(res);
  }

  // Delete old session
  await supabase.from('admin_sessions').delete().eq('refresh_token', oldRefreshToken);

  // Create new session (rotate tokens)
  const accessToken = await generateAccessToken(payload.userId);
  const refreshToken = await generateRefreshToken(payload.userId);
  const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE * 1000).toISOString();

  await supabase.from('admin_sessions').insert({
    user_id: payload.userId,
    refresh_token: refreshToken,
    expires_at: expiresAt,
  });

  const res = NextResponse.json({ success: true });
  return setCookies(res, accessToken, refreshToken);
}
