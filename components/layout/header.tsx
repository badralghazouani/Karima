'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Karima
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/courses" className="hover:text-primary transition">
            Courses
          </Link>
          {session?.user && (session.user as any).role === 'INSTRUCTOR' && (
            <Link
              href="/instructor/dashboard"
              className="hover:text-primary transition"
            >
              Teach
            </Link>
          )}
          {session?.user && (session.user as any).role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              className="hover:text-primary transition"
            >
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          {session?.user ? (
            <>
              <Link href="/dashboard/my-courses">
                <Button variant="ghost">My Learning</Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Button onClick={() => signOut()} variant="ghost">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
