import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();
  const { searchParams } = new URL(_req.url);
  const track = searchParams.get('track');
  const level = searchParams.get('level');
  
  // Build query to get curriculum data
  let query = supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      price,
      thumbnail_url,
      level,
      created_at,
      units!inner(
        id,
        title,
        order_index,
        lessons!inner(
          id,
          title,
          description,
          video_url,
          youtube_id,
          duration,
          order_index,
          type,
          content_markdown
        )
      )
    `)
    .order('created_at', { ascending: false });
  
  if (track) {
    // Filter by track if provided
    query = query.eq('track_id', track);
  }
  
  if (level) {
    query = query.eq('level', level);
  }
  
  const { data: courses, error } = await query;
  
  if (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch curriculum' },
      { status: 500 }
    );
  }
  
  // Transform courses to curriculum format
  const curriculum = courses?.map(course => ({
    id: course.id,
    title: course.title,
    track: track || 'unknown',
    level: course.level || 'beginner',
    lessons: course.units?.flatMap(unit => 
      unit.lessons?.map(lesson => ({
        ...lesson,
        unit_id: unit.id,
        unit_title: unit.title,
      })) || []
    ) || [],
    units: course.units?.map(unit => ({
      id: unit.id,
      title: unit.title,
      order_index: unit.order_index,
      lessons: unit.lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        video_url: lesson.video_url,
        youtube_id: lesson.youtube_id,
        duration: lesson.duration,
        order_index: lesson.order_index,
        type: lesson.type,
        content_markdown: lesson.content_markdown,
      })) || [],
    })) || [],
  })) || [];
  
  return NextResponse.json({
    success: true,
    data: curriculum,
    total: curriculum?.length || 0,
  });
});