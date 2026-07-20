import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { createMainRepoAdminClient } from '@/lib/supabase/admin';

export const GET = withAdminAuth(async (_req: NextRequest) => {
  const supabase = createMainRepoAdminClient();

  // courses table: id, title, description, price, thumbnail_url, created_at
  // No level or track_id columns exist on courses
  let query = supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      price,
      thumbnail_url,
      created_at,
      units(
        id,
        title,
        order_index,
        lessons(
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
    track: 'General',
    level: 'beginner',
    lessons: course.units?.flatMap((unit: any) =>
      unit.lessons?.map((lesson: any) => ({
        ...lesson,
        unit_id: unit.id,
        unit_title: unit.title,
      })) || []
    ) || [],
    units: course.units?.map((unit: any) => ({
      id: unit.id,
      title: unit.title,
      order_index: unit.order_index,
      lessons: unit.lessons?.map((lesson: any) => ({
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
