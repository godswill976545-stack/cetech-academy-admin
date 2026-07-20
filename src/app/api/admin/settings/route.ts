import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();

  const { data: settings, error } = await supabase
    .from('admin_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }

  // Return defaults if no settings row exists
  const defaultSettings = {
    portal_access: 'first',
    audit_log_retention: true,
    allow_admin_refunds: false,
    payment_providers: {
      ngn: ['paystack', 'flutterwave'],
      ghs: ['paystack', 'flutterwave', 'hubtel'],
      xof: ['kkiappay', 'fedapay', 'flutterwave'],
    },
    email_providers: ['resend', 'postmark', 'ses'],
    course_access_policy: 'enrollment_based',
  };

  return NextResponse.json({
    success: true,
    data: settings || defaultSettings,
  });
});

export const PATCH = withAdminAuth(async (req: NextRequest) => {
  const updates = await req.json();
  const supabase = createMainRepoAdminClient();

  const { data: existingSettings } = await supabase
    .from('admin_settings')
    .select('id')
    .single();

  let result;
  if (existingSettings) {
    result = await supabase
      .from('admin_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSettings.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('admin_settings')
      .insert({
        ...updates,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error('Error updating settings:', result.error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
});
