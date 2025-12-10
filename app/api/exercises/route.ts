import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const exerciseSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  question: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'TEXT', 'CODE', 'FILE_UPLOAD']),
  order: z.number().int().min(0),
  answer: z.string().optional().nullable(),
  points: z.number().int().min(1).default(10),
  options: z
    .array(
      z.object({
        text: z.string().min(1),
        isCorrect: z.boolean(),
        order: z.number().int(),
      })
    )
    .optional(),
});

// GET /api/exercises?courseId=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if user is enrolled or is the instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const isInstructor = course.instructorId === session.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (!isInstructor && !enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to view exercises' },
        { status: 403 }
      );
    }

    // Get exercises with options
    const exercises = await prisma.exercise.findMany({
      where: { courseId },
      include: {
        options: {
          orderBy: { order: 'asc' },
          // Don't include isCorrect for students
          select: {
            id: true,
            text: true,
            order: true,
            isCorrect: isInstructor,
          },
        },
        submissions: isInstructor
          ? {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            }
          : {
              where: {
                userId: session.user.id,
              },
            },
      },
      orderBy: { order: 'asc' },
    });

    // Hide correct answers from students
    const sanitizedExercises = exercises.map((exercise) => ({
      ...exercise,
      answer: isInstructor ? exercise.answer : null,
    }));

    return NextResponse.json(sanitizedExercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/exercises
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = exerciseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { courseId, options, ...exerciseData } = validation.data;

    // Verify user is the instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can add exercises' },
        { status: 403 }
      );
    }

    // Create exercise with options
    const exercise = await prisma.exercise.create({
      data: {
        ...exerciseData,
        courseId,
        options: options
          ? {
              create: options,
            }
          : undefined,
      },
      include: {
        options: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Create exercise error:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
