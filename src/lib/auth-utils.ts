import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me');
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me');

// ── Password hashing ──────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT access token (15 min) ─────────────────────────────────

export async function generateAccessToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET);
}

export async function verifyAccessToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

// ── JWT refresh token (7 days) ────────────────────────────────

export async function generateRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

// ── Invite token ──────────────────────────────────────────────

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
