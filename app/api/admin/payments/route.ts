import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

import { getPaymentHistoryAdmin, getPaymentStatistics } from '@/lib/payment-utils';



// Force dynamic rendering
export const dynamic = 'force-dynamic';
/**
 * GET /api/admin/payments
 * Get payment history and statistics (Admin only)
 * Query params:
 *   - courseId: filter by course
 *   - userId: filter by user
 *   - status: filter by payment status
 *   - isFake: filter by fake payments
 *   - limit: pagination limit (default 50)
 *   - offset: pagination offset (default 0)
 *   - stats: if true, return statistics instead of list
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

    const { searchParams } = new URL(req.url);
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const statistics = await getPaymentStatistics();
      return NextResponse.json(statistics);
    }

    const courseId = searchParams.get('courseId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const status = searchParams.get('status') || undefined;
    const isFake = searchParams.get('isFake');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = await getPaymentHistoryAdmin({
      courseId,
      userId,
      status: status as any,
      isFake: isFake === 'true' ? true : isFake === 'false' ? false : undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
