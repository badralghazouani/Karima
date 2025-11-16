import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  return session.user;
}

/**
 * Require specific role - redirect if user doesn't have the role
 */
export async function requireRole(role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
  const user = await requireAuth();

  if ((user as any).role !== role) {
    if (role === 'INSTRUCTOR') {
      redirect('/dashboard/my-courses');
    } else if (role === 'STUDENT') {
      redirect('/instructor/dashboard');
    }
  }

  return user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') {
  const user = await getCurrentUser();
  return user && (user as any).role === role;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}
