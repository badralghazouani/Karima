import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
// POST /api/progress - Mark a lesson as complete
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, isCompleted } = await req.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Verify user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: (session.user as any).id,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: (session.user as any).id,
          lessonId,
        },
      },
      update: {
        isCompleted: isCompleted ?? true,
        watchedAt: new Date(),
      },
      create: {
        userId: (session.user as any).id,
        lessonId,
        isCompleted: isCompleted ?? true,
        watchedAt: new Date(),
      },
    });

    // Check if all lessons in the course are completed
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId },
    });

    const completedLessons = await prisma.progress.count({
      where: {
        userId: (session.user as any).id,
        lesson: {
          courseId: lesson.courseId,
        },
        isCompleted: true,
      },
    });

    // If all lessons completed, mark enrollment as complete
    if (completedLessons === totalLessons && !enrollment.completedAt) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      progress,
      courseProgress: {
        completed: completedLessons,
        total: totalLessons,
        percentage: Math.round((completedLessons / totalLessons) * 100),
      },
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

// GET /api/progress?courseId=xxx - Get user's progress for a course
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const progressRecords = await prisma.progress.findMany({
      where: {
        userId: (session.user as any).id,
        lesson: {
          courseId,
        },
      },
      include: {
        lesson: true,
      },
    });

    return NextResponse.json(progressRecords);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}
