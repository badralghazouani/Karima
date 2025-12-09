import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
// GET /api/payments - Get user's payment history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch course details for each payment
    const paymentsWithCourses = await Promise.all(
      payments.map(async (payment) => {
        const course = await prisma.course.findUnique({
          where: { id: payment.courseId },
          select: {
            id: true,
            title: true,
            slug: true,
            instructor: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          ...payment,
          course,
        };
      })
    );

    return NextResponse.json(paymentsWithCourses);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
