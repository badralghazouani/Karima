import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
// GET /api/courses - Get all published courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const isFree = searchParams.get('isFree');
    const search = searchParams.get('search');

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category && {
          categories: {
            some: {
              category: {
                slug: category,
              },
            },
          },
        }),
        ...(level && { level: level as any }),
        ...(isFree !== null && { isFree: isFree === 'true' }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        lessons: {
          select: {
            id: true,
            duration: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course (instructor only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role === 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Instructor access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, price, level, language, categoryIds } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const slug = slugify(title);

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this title already exists' },
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        price: price || 0,
        isFree: !price || price === 0,
        level: level || 'BEGINNER',
        language: language || 'en',
        instructorId: (session.user as any).id,
        ...(categoryIds && {
          categories: {
            create: categoryIds.map((categoryId: string) => ({
              categoryId,
            })),
          },
        }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
