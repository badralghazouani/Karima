import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, formatAmountForStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const isFreeCourse = course.isFree || Number(course.price) === 0;

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: (session.user as any).id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course', redirect: `/learn/${course.slug}` },
        { status: 409 }
      );
    }

    // If the course is free, enroll immediately without Stripe
    if (isFreeCourse) {
      await prisma.enrollment.create({
        data: {
          userId: (session.user as any).id,
          courseId: course.id,
        },
      });

      return NextResponse.json({
        enrolled: true,
        free: true,
        redirect: `/learn/${course.slug}`,
      });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: (session.user as any).id,
        courseId,
        status: 'COMPLETED',
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already completed for this course' },
        { status: 409 }
      );
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: `Online course by ${course.instructor.name}`,
            },
            unit_amount: formatAmountForStripe(parseFloat(course.price.toString())),
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email!,
      metadata: {
        courseId: course.id,
        userId: (session.user as any).id,
        courseTitle: course.title,
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/courses/${course.slug}?canceled=true`,
    });

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: (session.user as any).id,
        courseId: course.id,
        amount: course.price,
        currency: 'USD',
        status: 'PENDING',
        stripePaymentId: checkoutSession.id,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
