import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

import { z } from 'zod';



// Force dynamic rendering
export const dynamic = 'force-dynamic';
const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']).optional(),
  language: z.string().optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/admin/courses/[id] - Get specific course
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access only' },
        { status: 403 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            exercises: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Admin get course error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - Update course
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access only' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = updateCourseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: validation.data,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Admin update course error:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - Delete course
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access only' },
        { status: 403 }
      );
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Delete course (cascades to lessons, exercises, etc.)
    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete course error:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
