import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

import { createFakePayment } from '@/lib/payment-utils';



// Force dynamic rendering
export const dynamic = 'force-dynamic';
/**
 * POST /api/admin/payments/test-payment
 * Create a fake payment for testing purposes (Admin only)
 *
 * Request body:
 * {
 *   "userId": "user-id",
 *   "courseId": "course-id",
 *   "amount": 99.99,
 *   "currency": "USD" (optional, defaults to USD),
 *   "status": "COMPLETED" (optional, defaults to COMPLETED)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, courseId, amount, currency, status } = body;

    // Validate required fields
    if (!userId || !courseId || amount === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['userId', 'courseId', 'amount'],
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create fake payment
    const payment = await createFakePayment({
      userId,
      courseId,
      amount,
      currency: currency || 'USD',
      status: status || 'COMPLETED',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Fake payment created successfully for user ${targetUser.email}`,
        payment: {
          id: payment.id,
          userId: payment.userId,
          courseId: payment.courseId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          isFake: payment.isFake,
          createdAt: payment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating fake payment:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('already has a completed payment') ||
        error.message.includes('Course not found') ||
        error.message.includes('not found')
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create fake payment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/payments/test-payment
 * Get information about test payment functionality
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      name: 'Test Payment Endpoint',
      description: 'Create fake payments for testing purposes',
      method: 'POST',
      endpoint: '/api/admin/payments/test-payment',
      requiresAdmin: true,
      requestBody: {
        userId: {
          type: 'string',
          required: true,
          description: 'ID of the user to create payment for',
        },
        courseId: {
          type: 'string',
          required: true,
          description: 'ID of the course to create payment for',
        },
        amount: {
          type: 'number',
          required: true,
          description: 'Payment amount (must be positive)',
        },
        currency: {
          type: 'string',
          required: false,
          default: 'USD',
          description: 'Currency code',
        },
        status: {
          type: 'string',
          required: false,
          default: 'COMPLETED',
          enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
          description: 'Payment status',
        },
      },
      examples: {
        createCompletedPayment: {
          method: 'POST',
          body: {
            userId: 'user-123',
            courseId: 'course-456',
            amount: 49.99,
            currency: 'USD',
            status: 'COMPLETED',
          },
        },
        createPendingPayment: {
          method: 'POST',
          body: {
            userId: 'user-123',
            courseId: 'course-456',
            amount: 49.99,
            status: 'PENDING',
          },
        },
      },
      notes: [
        'This endpoint is for testing purposes only',
        'Only administrators can use this endpoint',
        'Creating a COMPLETED payment automatically enrolls the user in the course',
        'User cannot have multiple completed payments for the same course',
        'Test payments are marked with isFake: true for tracking',
      ],
    });
  } catch (error) {
    console.error('Error getting test payment info:', error);
    return NextResponse.json(
      { error: 'Failed to get test payment info' },
      { status: 500 }
    );
  }
}
