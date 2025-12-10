'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Course {
  id: string;
  title: string;
  publicationDate: string | null;
  status: string;
  instructor: {
    id: string;
    name: string;
  };
  groupEnrollmentStatus: {
    complete: boolean;
    total: number;
    enrolled: number;
    percentage: number;
  };
  _count: {
    enrollments: number;
    lessons: number;
  };
}

export default function PublicationCalendarPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchSchedule();
  }, [statusFilter]);

  const fetchSchedule = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/publication-schedule?${params.toString()}`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishNow = async (courseId: string) => {
    if (!confirm('Publish this course now?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force: false }),
      });

      if (response.ok) {
        fetchSchedule();
      } else {
        const error = await response.json();
        if (confirm(`${error.error}\n\nForce publish anyway?`)) {
          const forceResponse = await fetch(`/api/admin/courses/${courseId}/publish`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ force: true }),
          });

          if (forceResponse.ok) {
            fetchSchedule();
          }
        }
      }
    } catch (error) {
      console.error('Error publishing course:', error);
      alert('An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING_GROUP':
        return 'bg-orange-100 text-orange-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not scheduled';
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const groupedCourses = courses.reduce((acc, course) => {
    const status = course.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Publication Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage course publication schedules and requirements
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-3xl">
              {groupedCourses['PUBLISHED']?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-3xl">
              {groupedCourses['SCHEDULED']?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Group</CardDescription>
            <CardTitle className="text-3xl">
              {groupedCourses['PENDING_GROUP']?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Draft</CardDescription>
            <CardTitle className="text-3xl">
              {groupedCourses['DRAFT']?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'SCHEDULED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('SCHEDULED')}
        >
          Scheduled
        </Button>
        <Button
          variant={statusFilter === 'PENDING_GROUP' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('PENDING_GROUP')}
        >
          Pending Group
        </Button>
        <Button
          variant={statusFilter === 'DRAFT' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('DRAFT')}
        >
          Draft
        </Button>
        <Button
          variant={statusFilter === 'PUBLISHED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('PUBLISHED')}
        >
          Published
        </Button>
      </div>

      {/* Course List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading schedule...</p>
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">No courses found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                        {course.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Instructor</p>
                        <p className="font-medium">{course.instructor.name}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Publication Date</p>
                        <p className="font-medium">{formatDate(course.publicationDate)}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Enrollments</p>
                        <p className="font-medium">{course._count.enrollments}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Lessons</p>
                        <p className="font-medium">{course._count.lessons}</p>
                      </div>
                    </div>

                    {course.groupEnrollmentStatus.total > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Group Enrollment: {course.groupEnrollmentStatus.enrolled} / {course.groupEnrollmentStatus.total} ({course.groupEnrollmentStatus.percentage}%)
                        </p>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              course.groupEnrollmentStatus.complete
                                ? 'bg-green-600'
                                : 'bg-orange-600'
                            }`}
                            style={{ width: `${course.groupEnrollmentStatus.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    {course.status !== 'PUBLISHED' && (
                      <Button size="sm" onClick={() => handlePublishNow(course.id)}>
                        Publish Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
