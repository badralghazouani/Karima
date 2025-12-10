'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface GroupMember {
  id: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

interface StudentGroup {
  id: string;
  name: string;
  description: string | null;
  maxSize: number | null;
  members: GroupMember[];
  courseRequirements: Array<{
    id: string;
    course: {
      id: string;
      title: string;
      status: string;
    };
  }>;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<StudentGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/admin/student-groups/${groupId}`);
      const data = await response.json();
      setGroup(data);
    } catch (error) {
      console.error('Failed to fetch group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (email: string) => {
    if (!email || email.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?search=${email}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/student-groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setShowAddMember(false);
        setUserEmail('');
        setSearchResults([]);
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('An error occurred');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/student-groups/${groupId}/members?userId=${userId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        fetchGroup();
      } else {
        alert('Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading group...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Group not found</h2>
        <Link href="/admin/student-groups">
          <Button>Back to Groups</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/student-groups"
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>
        <h1 className="text-3xl font-bold">{group.name}</h1>
        {group.description && (
          <p className="text-muted-foreground mt-1">{group.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Members</CardDescription>
            <CardTitle className="text-3xl">
              {group.members.length}
              {group.maxSize ? ` / ${group.maxSize}` : ''}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Linked Courses</CardDescription>
            <CardTitle className="text-3xl">{group.courseRequirements.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Available Slots</CardDescription>
            <CardTitle className="text-3xl">
              {group.maxSize ? group.maxSize - group.members.length : '∞'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Group Members</CardTitle>
              <CardDescription>Manage students in this group</CardDescription>
            </div>
            <Button onClick={() => setShowAddMember(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddMember && (
            <div className="mb-6 p-4 border rounded-lg bg-accent/50">
              <h4 className="font-medium mb-3">Add New Member</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Search by email..."
                  value={userEmail}
                  onChange={(e) => {
                    setUserEmail(e.target.value);
                    searchUsers(e.target.value);
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-accent"
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAddMember(user.id)}>
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" onClick={() => setShowAddMember(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {group.members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No members yet</p>
              <Button onClick={() => setShowAddMember(true)}>Add First Member</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {member.user.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMember(member.user.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Courses */}
      {group.courseRequirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Courses</CardTitle>
            <CardDescription>Courses with enrollment requirements for this group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.courseRequirements.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{req.course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {req.course.status}
                    </p>
                  </div>
                  <Link href={`/admin/courses/${req.course.id}`}>
                    <Button variant="outline" size="sm">
                      View Course
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
