import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/student-groups/[id] - Get single group
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const group = await prisma.studentGroup.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
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
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching student group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student group' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/student-groups/[id] - Update group
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, maxSize } = body;

    const group = await prisma.studentGroup.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(maxSize !== undefined && { maxSize: maxSize ? parseInt(maxSize) : null }),
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error updating student group:', error);
    return NextResponse.json(
      { error: 'Failed to update student group' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/student-groups/[id] - Delete group
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if group has course requirements
    const group = await prisma.studentGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            courseRequirements: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group._count.courseRequirements > 0) {
      return NextResponse.json(
        { error: 'Cannot delete group with active course requirements' },
        { status: 400 }
      );
    }

    await prisma.studentGroup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student group:', error);
    return NextResponse.json(
      { error: 'Failed to delete student group' },
      { status: 500 }
    );
  }
}
