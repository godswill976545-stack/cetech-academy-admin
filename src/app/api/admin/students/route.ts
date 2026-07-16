import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  return NextResponse.json({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
  });
});
