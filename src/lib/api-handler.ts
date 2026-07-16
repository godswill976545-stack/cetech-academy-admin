import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export function withAdminAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const { user, isAuthenticated } = await requireAdmin();
    if (!user) {
      return NextResponse.json(
        { error: isAuthenticated ? 'Forbidden' : 'Unauthorized' },
        { status: isAuthenticated ? 403 : 401 }
      );
    }
    return handler(req);
  };
}
