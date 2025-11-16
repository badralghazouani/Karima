import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  }
}
