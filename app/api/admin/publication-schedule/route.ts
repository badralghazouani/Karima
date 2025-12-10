import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/publication-schedule - Get scheduled publications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const where: any = {};

    if (startDate && endDate) {
      where.publicationDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (status) {
      where.status = status;
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: {
        publicationDate: 'asc',
      },
    });

    // Calculate group enrollment status
    const coursesWithStatus = await Promise.all(
      courses.map(async (course) => {
        let groupEnrollmentComplete = true;
        let totalGroupMembers = 0;
        let enrolledGroupMembers = 0;

        if (course.groupRequirements.length > 0) {
          for (const req of course.groupRequirements) {
            const groupMemberCount = req.group._count.members;
            totalGroupMembers += groupMemberCount;

            // Count how many group members are enrolled
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

            enrolledGroupMembers += enrolledCount;

            if (req.requireFullGroup && enrolledCount < groupMemberCount) {
              groupEnrollmentComplete = false;
            }
          }
        }

        return {
          ...course,
          groupEnrollmentStatus: {
            complete: groupEnrollmentComplete,
            total: totalGroupMembers,
            enrolled: enrolledGroupMembers,
            percentage: totalGroupMembers > 0 
              ? Math.round((enrolledGroupMembers / totalGroupMembers) * 100) 
              : 100,
          },
        };
      })
    );

    return NextResponse.json(coursesWithStatus);
  } catch (error) {
    console.error('Error fetching publication schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch publication schedule' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/publication-schedule - Bulk update publication dates
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { updates } = body; // Array of { courseId, publicationDate, status }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      updates.map(async (update: any) => {
        const { courseId, publicationDate, status } = update;

        try {
          const updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: {
              ...(publicationDate && { publicationDate: new Date(publicationDate) }),
              ...(status && { status }),
            },
            select: {
              id: true,
              title: true,
              publicationDate: true,
              status: true,
            },
          });

          return { success: true, course: updatedCourse };
        } catch (error) {
          return { success: false, courseId, error: 'Failed to update' };
        }
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error bulk updating publication dates:', error);
    return NextResponse.json(
      { error: 'Failed to update publication dates' },
      { status: 500 }
    );
  }
}
