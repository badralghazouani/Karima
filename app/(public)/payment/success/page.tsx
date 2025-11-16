'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [isVerifying, setIsVerifying] = useState(true);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPayment();
    } else {
      setIsVerifying(false);
    }
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch user's enrollments to find the newly enrolled course
      const response = await fetch('/api/enrollments');
      const enrollments = await response.json();

      if (enrollments && enrollments.length > 0) {
        // Get the most recent enrollment
        const latestEnrollment = enrollments.sort(
          (a: any, b: any) =>
            new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
        )[0];
        setCourse(latestEnrollment.course);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
              <CardDescription className="text-base">
                Thank you for your purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {course && (
                <div className="p-4 bg-accent rounded-lg">
                  <h3 className="font-semibold mb-2">Course Enrolled:</h3>
                  <p className="text-lg">{course.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    by {course.instructor?.name}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Payment Confirmed</p>
                    <p className="text-sm text-muted-foreground">
                      Your payment has been processed successfully
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Course Access Granted</p>
                    <p className="text-sm text-muted-foreground">
                      You now have lifetime access to all course content
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="font-medium">Receipt Sent</p>
                    <p className="text-sm text-muted-foreground">
                      A receipt has been sent to your email
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                {course && (
                  <Link href={`/learn/${course.slug}`}>
                    <Button className="w-full" size="lg">
                      Start Learning Now
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/my-courses">
                  <Button variant="outline" className="w-full">
                    Go to My Courses
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Need help? Contact us at{' '}
                  <a href="mailto:support@karima.com" className="text-primary hover:underline">
                    support@karima.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
