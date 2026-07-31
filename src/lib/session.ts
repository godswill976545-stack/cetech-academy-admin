import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getPool } from '@/lib/neon/server';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth-utils';

const pool: Pool = getPool();

const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export function setCookies(res: NextResponse, accessToken: string, refreshToken: string): NextResponse {
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

export function clearCookies(res: NextResponse): NextResponse {
  res.cookies.set('admin_access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set('admin_refresh_token', '', { httpOnly: true, path: '/api/auth/refresh', maxAge: 0 });
  return res;
}

export async function createSession(res: NextResponse, userId: string, userAgent?: string): Promise<NextResponse> {
  const accessToken = await generateAccessToken(userId);
  const refreshToken = await generateRefreshToken(userId);

  const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE * 1000).toISOString();

  await pool.query(
    `INSERT INTO admin_sessions (user_id, refresh_token, user_agent, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, refreshToken, userAgent || null, expiresAt]
  );

  return setCookies(res, accessToken, refreshToken);
}

export async function destroySession(res: NextResponse, refreshToken: string): Promise<NextResponse> {
  await pool.query(
    `DELETE FROM admin_sessions WHERE refresh_token = $1`,
    [refreshToken]
  );
  return clearCookies(res);
}

export async function refreshSession(res: NextResponse, oldRefreshToken: string): Promise<NextResponse> {
  const payload = await verifyRefreshToken(oldRefreshToken);
  if (!payload) {
    return clearCookies(
      NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 })
    );
  }

  const sessionResult = await pool.query(
    `SELECT id FROM admin_sessions
     WHERE refresh_token = $1 AND expires_at > $2`,
    [oldRefreshToken, new Date().toISOString()]
  );

  if (sessionResult.rows.length === 0) {
    return clearCookies(
      NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 })
    );
  }

  await pool.query(
    `DELETE FROM admin_sessions WHERE refresh_token = $1`,
    [oldRefreshToken]
  );

  const accessToken = await generateAccessToken(payload.userId);
  const refreshToken = await generateRefreshToken(payload.userId);
  const expiresAt = new Date(Date.now() + REFRESH_MAX_AGE * 1000).toISOString();

  await pool.query(
    `INSERT INTO admin_sessions (user_id, refresh_token, user_agent, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [payload.userId, refreshToken, null, expiresAt]
  );

  return setCookies(res, accessToken, refreshToken);
}
