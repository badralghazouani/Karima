import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/student-groups/[id]/members - Add member to group
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if group exists and has max size
    const group = await prisma.studentGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check max size
    if (group.maxSize && group._count.members >= group.maxSize) {
      return NextResponse.json(
        { error: 'Group is full' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.studentGroupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: params.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 }
      );
    }

    const member = await prisma.studentGroupMember.create({
      data: {
        userId,
        groupId: params.id,
      },
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
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding group member:', error);
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/student-groups/[id]/members - Remove member from group
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await prisma.studentGroupMember.delete({
      where: {
        userId_groupId: {
          userId,
          groupId: params.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    );
  }
}
