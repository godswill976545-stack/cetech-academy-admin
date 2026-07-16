import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  return NextResponse.json([]);
});
