import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/student-groups - List all student groups
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.studentGroup.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        courseRequirements: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            courseRequirements: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching student groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student groups' },
      { status: 500 }
    );
  }
}

// POST /api/admin/student-groups - Create new student group
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, maxSize } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      );
    }

    const group = await prisma.studentGroup.create({
      data: {
        name,
        description,
        maxSize: maxSize ? parseInt(maxSize) : null,
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating student group:', error);
    return NextResponse.json(
      { error: 'Failed to create student group' },
      { status: 500 }
    );
  }
}
