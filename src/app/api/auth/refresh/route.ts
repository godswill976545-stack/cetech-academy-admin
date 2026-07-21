import { NextRequest } from 'next/server';
import { refreshSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('admin_refresh_token')?.value || '';
  if (!refreshToken) {
    return refreshSession(''); // Will return 401 + clear cookies
  }
  return refreshSession(refreshToken);
}
