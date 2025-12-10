import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const submitSchema = z.object({
  exerciseId: z.string().min(1),
  answer: z.string().min(1),
});

// POST /api/exercises/submit
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = submitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { exerciseId, answer } = validation.data;

    // Get the exercise with course info
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        course: true,
        options: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: exercise.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to submit exercises' },
        { status: 403 }
      );
    }

    // Auto-grade if possible
    let isCorrect: boolean | null = null;
    let score: number | null = null;

    if (exercise.type === 'MULTIPLE_CHOICE') {
      // For multiple choice, check against the correct option
      const correctOption = exercise.options.find((opt) => opt.isCorrect);
      if (correctOption) {
        isCorrect = answer === correctOption.id;
        score = isCorrect ? exercise.points : 0;
      }
    } else if (exercise.answer) {
      // For other types with predefined answers, do exact match (case-insensitive)
      isCorrect =
        answer.trim().toLowerCase() === exercise.answer.trim().toLowerCase();
      score = isCorrect ? exercise.points : 0;
    }

    // Create or update submission
    const submission = await prisma.exerciseSubmission.upsert({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
      update: {
        answer,
        isCorrect,
        score,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        exerciseId,
        answer,
        isCorrect,
        score,
      },
    });

    return NextResponse.json({
      submission,
      autoGraded: isCorrect !== null,
    });
  } catch (error) {
    console.error('Submit exercise error:', error);
    return NextResponse.json(
      { error: 'Failed to submit exercise' },
      { status: 500 }
    );
  }
}
