import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/courses/[id] - Get a single course
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const courseId = params.id;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
        documents: true,
        exercises: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if user has access to the course
    let isEnrolled = false;
    let canAccess = false;
    if (session?.user) {
      const userId = (session.user as any).id;
      const userRole = (session.user as any).role;

      // Check enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });
      isEnrolled = !!enrollment;

      // Instructors can access their own courses
      // Admins can access all courses
      // Students need to be enrolled
      canAccess = isEnrolled || course.instructorId === userId || userRole === 'ADMIN';
    }

    return NextResponse.json({ ...course, isEnrolled, canAccess });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update a course
export async function PUT(
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

    // Check if course exists and user owns it
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (
      existingCourse.instructorId !== (session.user as any).id &&
      (session.user as any).role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Not authorized to edit this course' },
        { status: 403 }
      );
    }

    const { title, description, price, level, language, isPublished, isArchived, thumbnail, categoryIds } = body;

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && {
          price,
          isFree: price === 0,
        }),
        ...(level && { level }),
        ...(language && { language }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isArchived !== undefined && { isArchived }),
        ...(thumbnail && { thumbnail }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    // Update categories if provided
    if (categoryIds) {
      // Delete existing category relations
      await prisma.courseCategory.deleteMany({
        where: { courseId },
      });

      // Create new category relations
      await prisma.courseCategory.createMany({
        data: categoryIds.map((categoryId: string) => ({
          courseId,
          categoryId,
        })),
      });
    }

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role === 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const courseId = params.id;

    // Check if course exists and user owns it
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (
      existingCourse.instructorId !== (session.user as any).id &&
      (session.user as any).role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Not authorized to delete this course' },
        { status: 403 }
      );
    }

    // Delete course (cascades will handle related records)
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
