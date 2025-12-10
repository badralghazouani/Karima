import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

import { getPaymentMethods, updatePaymentMethod, initializePaymentMethods } from '@/lib/payment-utils';



// Force dynamic rendering
export const dynamic = 'force-dynamic';
/**
 * GET /api/admin/payments/methods
 * Get all payment methods (Admin only)
 * Query params:
 *   - active: only return active methods (default true)
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
    const active = searchParams.get('active') !== 'false';

    const methods = await getPaymentMethods(active);

    return NextResponse.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payments/methods/init
 * Initialize default payment methods (Admin only)
 * Can be called multiple times - it checks if already initialized
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

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'init') {
      await initializePaymentMethods();
      const methods = await getPaymentMethods(false);
      return NextResponse.json({
        message: 'Payment methods initialized',
        methods,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error initializing payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to initialize payment methods' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/payments/methods/[id]
 * Update payment method (Admin only)
 */
export async function PUT(req: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { isActive, name, description } = body;

    const method = await updatePaymentMethod(id, {
      isActive,
      name,
      description,
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}
