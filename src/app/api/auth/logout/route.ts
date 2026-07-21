import { NextRequest } from 'next/server';
import { destroySession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('admin_refresh_token')?.value || '';
  return destroySession(refreshToken);
}
