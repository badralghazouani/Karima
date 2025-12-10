import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
// PUT /api/lessons/[id] - Update a lesson
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const lessonId = params.id;
    const body = await req.json();

    // Get lesson and verify ownership through course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (
      lesson.course.instructorId !== (session.user as any).id &&
      (session.user as any).role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Not authorized to edit this lesson' },
        { status: 403 }
      );
    }

    const { title, description, videoUrl, duration, order, isFree } = body;

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl && { videoUrl }),
        ...(duration && { duration }),
        ...(order !== undefined && { order }),
        ...(isFree !== undefined && { isFree }),
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

// DELETE /api/lessons/[id] - Delete a lesson
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const lessonId = params.id;

    // Get lesson and verify ownership through course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (
      lesson.course.instructorId !== (session.user as any).id &&
      (session.user as any).role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this lesson' },
        { status: 403 }
      );
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
