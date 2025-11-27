import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

export interface FakePaymentOptions {
  userId: string;
  courseId: string;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
}

/**
 * Initialize default payment methods in the database
 * Call this once during setup or in a migration
 */
export async function initializePaymentMethods() {
  const existingMethods = await prisma.paymentMethod.count();

  if (existingMethods > 0) {
    return; // Already initialized
  }

  const paymentMethods = [
    {
      name: 'Stripe',
      type: 'STRIPE',
      description: 'Credit/Debit card payments via Stripe',
      testModeSupported: true,
      requiresWebhook: true,
    },
    {
      name: 'Test Payment Method',
      type: 'TEST',
      description: 'Test payment method for administrators only',
      testModeSupported: true,
      requiresWebhook: false,
    },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.create({
      data: method as any,
    });
  }
}

/**
 * Create a fake payment for testing purposes (Admin only)
 * This creates a completed payment without going through Stripe
 */
export async function createFakePayment(options: FakePaymentOptions) {
  const {
    userId,
    courseId,
    amount,
    currency = 'USD',
    status = 'COMPLETED',
  } = options;

  // Get the TEST payment method
  const testPaymentMethod = await prisma.paymentMethod.findFirst({
    where: { type: 'TEST' },
  });

  if (!testPaymentMethod) {
    throw new Error('Test payment method not found. Initialize payment methods first.');
  }

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  // Check if user already has a completed payment for this course
  if (status === 'COMPLETED') {
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        courseId,
        status: 'COMPLETED',
      },
    });

    if (existingPayment) {
      throw new Error('User already has a completed payment for this course');
    }
  }

  // Create the fake payment
  const payment = await prisma.payment.create({
    data: {
      userId,
      courseId,
      amount: new Decimal(amount),
      currency,
      status,
      paymentMethodId: testPaymentMethod.id,
      isFake: true,
    },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  // If payment status is COMPLETED, also create enrollment
  if (status === 'COMPLETED') {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          userId,
          courseId,
        },
      });
    }
  }

  return payment;
}

/**
 * Get all payment methods
 */
export async function getPaymentMethods(onlyActive = true) {
  return prisma.paymentMethod.findMany({
    where: onlyActive ? { isActive: true } : {},
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get payment method by type
 */
export async function getPaymentMethodByType(type: string) {
  return prisma.paymentMethod.findFirst({
    where: { type: type as any },
  });
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(
  id: string,
  data: {
    isActive?: boolean;
    name?: string;
    description?: string;
  }
) {
  return prisma.paymentMethod.update({
    where: { id },
    data,
  });
}

/**
 * Get payment history for admin (all users)
 */
export async function getPaymentHistoryAdmin(filters?: {
  courseId?: string;
  userId?: string;
  status?: PaymentStatus;
  isFake?: boolean;
  limit?: number;
  offset?: number;
}) {
  const {
    courseId,
    userId,
    status,
    isFake,
    limit = 50,
    offset = 0,
  } = filters || {};

  const payments = await prisma.payment.findMany({
    where: {
      ...(courseId && { courseId }),
      ...(userId && { userId }),
      ...(status && { status }),
      ...(isFake !== undefined && { isFake }),
    },
    include: {
      user: { select: { name: true, email: true } },
      paymentMethod: { select: { name: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  const total = await prisma.payment.count({
    where: {
      ...(courseId && { courseId }),
      ...(userId && { userId }),
      ...(status && { status }),
      ...(isFake !== undefined && { isFake }),
    },
  });

  return { payments, total };
}

/**
 * Get payment statistics for admin
 */
export async function getPaymentStatistics() {
  const totalPayments = await prisma.payment.count();
  const completedPayments = await prisma.payment.count({
    where: { status: 'COMPLETED' },
  });
  const failedPayments = await prisma.payment.count({
    where: { status: 'FAILED' },
  });
  const fakePayments = await prisma.payment.count({
    where: { isFake: true },
  });

  const totalRevenue = await prisma.payment.aggregate({
    where: { status: 'COMPLETED', isFake: false },
    _sum: { amount: true },
  });

  const fakeTestRevenue = await prisma.payment.aggregate({
    where: { status: 'COMPLETED', isFake: true },
    _sum: { amount: true },
  });

  return {
    totalPayments,
    completedPayments,
    failedPayments,
    fakePayments,
    totalRevenue: totalRevenue._sum.amount || 0,
    fakeTestRevenue: fakeTestRevenue._sum.amount || 0,
  };
}

// Import Decimal for proper type handling
import { Decimal } from '@prisma/client/runtime/library';
