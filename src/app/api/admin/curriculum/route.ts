import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/api-handler';
import { Pool } from 'pg';

export const GET = withAdminAuth(async (_req: NextRequest, pool: Pool) => {
  const coursesRes = await pool.query(
    `SELECT id, title, description, price, thumbnail_url, created_at
     FROM courses
     ORDER BY created_at DESC`
  );

  const courses = coursesRes.rows;
  const courseIds = courses.map(c => c.id);

  let units: any[] = [];
  let lessons: any[] = [];

  if (courseIds.length > 0) {
    units = (await pool.query(
      `SELECT id, course_id, title, order_index
       FROM units
       WHERE course_id = ANY($1::text[])
       ORDER BY course_id, order_index`,
      [courseIds]
    )).rows;

    const unitIds = units.map(u => u.id);
    if (unitIds.length > 0) {
      lessons = (await pool.query(
        `SELECT id, unit_id, title, description, video_url, youtube_id, duration, order_index, type, content_markdown
         FROM lessons
         WHERE unit_id = ANY($1::text[])
         ORDER BY unit_id, order_index`,
        [unitIds]
      )).rows;
    }
  }

  const curriculum = courses.map(course => {
    const courseUnits = units.filter(u => u.course_id === course.id);
    const courseLessons = lessons.filter(l => courseUnits.some(u => u.id === l.unit_id));

    return {
      id: course.id,
      title: course.title,
      track: 'General',
      level: 'beginner',
      lessons: courseLessons.map(lesson => {
        const unit = courseUnits.find(u => u.id === lesson.unit_id);
        return {
          ...lesson,
          unit_id: unit?.id,
          unit_title: unit?.title,
        };
      }),
      units: courseUnits.map(unit => ({
        id: unit.id,
        title: unit.title,
        order_index: unit.order_index,
        lessons: lessons.filter(l => l.unit_id === unit.id).map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          video_url: lesson.video_url,
          youtube_id: lesson.youtube_id,
          duration: lesson.duration,
          order_index: lesson.order_index,
          type: lesson.type,
          content_markdown: lesson.content_markdown,
        })),
      })),
    };
  });

  return NextResponse.json({
    success: true,
    data: curriculum,
    total: courses.length,
  });
});
