import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  return NextResponse.json({
    portalAccess: 'first',
    auditLogRetention: true,
    allowAdminRefunds: false,
  });
});

export const PATCH = withAdminAuth(async (req: NextRequest) => {
  const body = await req.json();
  return NextResponse.json(body);
});
