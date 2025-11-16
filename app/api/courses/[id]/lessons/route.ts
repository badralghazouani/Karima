import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[id]/lessons - Get all lessons for a course
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/lessons - Create a new lesson
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const courseId = params.id;
    const body = await req.json();

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (
      course.instructorId !== (session.user as any).id &&
      (session.user as any).role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Not authorized to edit this course' },
        { status: 403 }
      );
    }

    const { title, description, videoUrl, duration, order, isFree } = body;

    if (!title || !videoUrl || !duration || order === undefined) {
      return NextResponse.json(
        { error: 'Title, videoUrl, duration, and order are required' },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        videoUrl,
        duration,
        order,
        isFree: isFree || false,
        courseId,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
