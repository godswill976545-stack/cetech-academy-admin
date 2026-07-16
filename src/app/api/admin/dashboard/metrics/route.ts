import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  return NextResponse.json({
    totalStudents: 0,
    applications: 0,
    revenueMTD: 0,
    activeCohorts: 0,
    completionRate: 0,
    onTrack: 0,
    atRisk: 0,
    inactive: 0,
  });
});
