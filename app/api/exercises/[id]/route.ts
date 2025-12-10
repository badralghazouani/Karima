import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const updateExerciseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  question: z.string().min(1).optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'TEXT', 'CODE', 'FILE_UPLOAD']).optional(),
  order: z.number().int().min(0).optional(),
  answer: z.string().optional().nullable(),
  points: z.number().int().min(1).optional(),
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

// PUT /api/exercises/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateExerciseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if exercise exists and user is the instructor
    const existingExercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: { course: true },
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    if (existingExercise.course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can edit exercises' },
        { status: 403 }
      );
    }

    const { options, ...exerciseData } = validation.data;

    // If options are provided, delete old ones and create new ones
    if (options) {
      await prisma.quizOption.deleteMany({
        where: { exerciseId: params.id },
      });
    }

    const exercise = await prisma.exercise.update({
      where: { id: params.id },
      data: {
        ...exerciseData,
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

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Update exercise error:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if exercise exists and user is the instructor
    const existingExercise = await prisma.exercise.findUnique({
      where: { id: params.id },
      include: { course: true },
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    if (existingExercise.course.instructorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can delete exercises' },
        { status: 403 }
      );
    }

    await prisma.exercise.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete exercise error:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}
