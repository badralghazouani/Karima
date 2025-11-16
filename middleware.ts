import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to login if trying to access protected routes without auth
    if (!token && (path.startsWith('/dashboard') || path.startsWith('/instructor'))) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Redirect instructors trying to access student dashboard
    if (
      token?.role === 'INSTRUCTOR' &&
      path.startsWith('/dashboard') &&
      !path.startsWith('/dashboard/profile')
    ) {
      return NextResponse.redirect(new URL('/instructor/dashboard', req.url));
    }

    // Redirect students trying to access instructor dashboard
    if (token?.role === 'STUDENT' && path.startsWith('/instructor')) {
      return NextResponse.redirect(new URL('/dashboard/my-courses', req.url));
    }

    // Redirect admin to admin panel
    if (token?.role === 'ADMIN' && (path === '/dashboard' || path === '/instructor')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/instructor/:path*',
    '/admin/:path*',
  ],
};
