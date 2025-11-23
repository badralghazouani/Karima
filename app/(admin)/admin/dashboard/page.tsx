import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Get statistics
  const [
    totalUsers,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalRevenue,
    recentCourses,
    topInstructors,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.enrollment.count(),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: { name: true, email: true },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: 'INSTRUCTOR' },
      take: 5,
      include: {
        _count: {
          select: { coursesCreated: true },
        },
      },
      orderBy: {
        coursesCreated: {
          _count: 'desc',
        },
      },
    }),
  ]);

  const revenue = totalRevenue._sum.amount
    ? parseFloat(totalRevenue._sum.amount.toString())
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || 'Admin'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Courses</CardDescription>
            <CardTitle className="text-3xl">{totalCourses}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {publishedCourses} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Enrollments</CardDescription>
            <CardTitle className="text-3xl">{totalEnrollments}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Active student enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl">
              ${revenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              From completed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Courses & Top Instructors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>Latest courses added to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No courses yet
                </p>
              ) : (
                recentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{course.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        by {course.instructor.name} • {course._count.enrollments} students
                      </p>
                    </div>
                    <a
                      href={`/admin/courses/${course.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Instructors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Instructors</CardTitle>
            <CardDescription>Instructors with most courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topInstructors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No instructors yet
                </p>
              ) : (
                topInstructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {instructor.name?.charAt(0) || 'I'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{instructor.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {instructor.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {instructor._count.coursesCreated}
                      </div>
                      <div className="text-xs text-muted-foreground">courses</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
