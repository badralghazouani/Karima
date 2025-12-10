import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/courses/[id]/publish - Manually publish a course
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
    const { force } = body; // Force publish even if group requirements not met

    // Check group requirements
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        groupRequirements: {
          include: {
            group: {
              include: {
                _count: {
                  select: {
                    members: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if group requirements are met
    if (!force && course.groupRequirements.length > 0) {
      for (const req of course.groupRequirements) {
        if (req.requireFullGroup) {
          const groupMemberCount = req.group._count.members;
          const enrolledCount = await prisma.enrollment.count({
            where: {
              courseId: course.id,
              user: {
                groupMemberships: {
                  some: {
                    groupId: req.group.id,
                  },
                },
              },
            },
          });

          if (enrolledCount < groupMemberCount) {
            return NextResponse.json(
              {
                error: 'Group enrollment requirements not met',
                groupName: req.group.name,
                enrolled: enrolledCount,
                required: groupMemberCount,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Publish the course
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        isPublished: true,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Error publishing course:', error);
    return NextResponse.json(
      { error: 'Failed to publish course' },
      { status: 500 }
    );
  }
}
