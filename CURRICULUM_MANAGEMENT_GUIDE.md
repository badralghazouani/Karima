# Enhanced Course Curriculum Management Guide

## Overview

The Karima Course Platform now includes advanced curriculum management features including:

1. **Publication Scheduling** - Schedule courses to publish automatically at specific dates/times
2. **Student Group Management** - Create groups of students with enrollment requirements
3. **Group-Based Enrollment** - Courses can require specific student groups to be fully enrolled before publishing
4. **Publication Calendar** - Visual dashboard to manage all course publications

---

## 🎯 Features Implemented

### ✅ 1. Publication Scheduling

Courses now have sophisticated publication controls:

**Status Types:**
- **DRAFT** - Course is being created, not visible to students
- **SCHEDULED** - Course will auto-publish at scheduled date/time
- **PENDING_GROUP** - Waiting for required student group enrollment
- **PUBLISHED** - Course is live and accessible

**Publication Date:**
- Set future date/time for automatic publication
- Manual publish option (bypass schedule)
- Admin can override and publish early

**Auto-Publication Logic:**
```
IF current_time >= publication_date
  AND status == SCHEDULED
  THEN status = PUBLISHED
```

### ✅ 2. Student Groups

Create and manage groups of students:

**Group Properties:**
- Name and description
- Optional maximum size
- Member list with join dates
- Linked courses

**Use Cases:**
- Class cohorts (e.g., "Computer Science 2024")
- Program groups (e.g., "MBA Program - Spring Intake")
- Special access groups (e.g., "Beta Testers")

**Member Management:**
- Search users by email
- Add/remove members
- View member profiles
- Track join dates

### ✅ 3. Group-Based Course Requirements

Link courses to student groups:

**Requirement Types:**
- **Full Group Required** - ALL group members must enroll before course publishes
- **Partial Group** - Course available when some members enroll

**Enrollment Tracking:**
- Progress bar showing enrolled vs total members
- Percentage completion
- Automatic status updates
- Admin dashboard visibility

**Example Workflow:**
```
1. Admin creates "Data Science Cohort 2024" group (30 students)
2. Admin creates course "Advanced Machine Learning"
3. Admin links course to group with "Full Group Required"
4. Status = PENDING_GROUP
5. As students enroll, progress updates (e.g., 20/30)
6. When all 30 enroll, status → PUBLISHED
```

### ✅ 4. Publication Calendar

Admin dashboard to manage all publications:

**Features:**
- View all courses with publication status
- Filter by status (Draft/Scheduled/Pending/Published)
- Stats cards showing counts
- Group enrollment progress bars
- Manual publish buttons
- Force publish option

**Information Displayed:**
- Course title and instructor
- Publication date
- Current status
- Enrollment count
- Lesson count
- Group enrollment progress

---

## 📊 Database Schema

### New Models

#### CourseStatus Enum
```prisma
enum CourseStatus {
  DRAFT
  SCHEDULED
  PENDING_GROUP
  PUBLISHED
}
```

#### Course Model Updates
```prisma
model Course {
  // ... existing fields
  publicationDate DateTime?
  status          CourseStatus @default(DRAFT)
  groupRequirements CourseGroupRequirement[]
}
```

#### StudentGroup
```prisma
model StudentGroup {
  id          String
  name        String
  description String?
  maxSize     Int?
  members     StudentGroupMember[]
  courseRequirements CourseGroupRequirement[]
}
```

#### StudentGroupMember
```prisma
model StudentGroupMember {
  id      String
  userId  String
  groupId String
  user    User
  group   StudentGroup
  joinedAt DateTime
}
```

#### CourseGroupRequirement
```prisma
model CourseGroupRequirement {
  id               String
  courseId         String
  groupId          String
  requireFullGroup Boolean @default(true)
  course           Course
  group            StudentGroup
}
```

---

## 🔧 API Endpoints

### Student Groups

**List All Groups**
```http
GET /api/admin/student-groups
Response: Array of groups with members and stats
```

**Create Group**
```http
POST /api/admin/student-groups
Body: { name, description?, maxSize? }
Response: Created group
```

**Get Single Group**
```http
GET /api/admin/student-groups/[id]
Response: Group with full details
```

**Update Group**
```http
PUT /api/admin/student-groups/[id]
Body: { name?, description?, maxSize? }
Response: Updated group
```

**Delete Group**
```http
DELETE /api/admin/student-groups/[id]
Response: Success (blocked if has course requirements)
```

### Group Members

**Add Member**
```http
POST /api/admin/student-groups/[id]/members
Body: { userId }
Response: New membership
```

**Remove Member**
```http
DELETE /api/admin/student-groups/[id]/members?userId=[userId]
Response: Success
```

### Publication Schedule

**Get Schedule**
```http
GET /api/admin/publication-schedule?status=[status]&startDate=[date]&endDate=[date]
Response: Courses with publication status and group enrollment
```

**Bulk Update Dates**
```http
PUT /api/admin/publication-schedule
Body: { updates: [{ courseId, publicationDate, status }] }
Response: Update results
```

**Manual Publish**
```http
POST /api/admin/courses/[id]/publish
Body: { force: boolean }
Response: Published course
```

---

## 🖥️ Admin UI Pages

### Student Groups Page
**URL:** `/admin/student-groups`

**Features:**
- Grid view of all groups
- Create new group modal
- Member and course counts
- Quick delete action
- Navigate to detail page

### Group Detail Page
**URL:** `/admin/student-groups/[id]`

**Features:**
- Group information
- Stats cards (members, courses, slots)
- Member list with avatars
- Add member with user search
- Remove member action
- Linked courses list

### Publication Calendar
**URL:** `/admin/publication-calendar`

**Features:**
- Status filter buttons
- Stats dashboard
- Course list with details
- Group enrollment progress
- Manual publish buttons
- Edit course links

---

## 📋 Usage Examples

### Example 1: Schedule Course for Future Publication

```typescript
// Admin creates course
const course = await prisma.course.create({
  data: {
    title: "Introduction to React",
    publicationDate: new Date("2025-12-25T09:00:00"),
    status: "SCHEDULED",
    // ... other fields
  },
});

// On December 25, 2025 at 9:00 AM, status auto-updates to PUBLISHED
```

### Example 2: Create Group and Link to Course

```typescript
// 1. Create student group
const group = await prisma.studentGroup.create({
  data: {
    name: "React Masterclass 2024",
    description: "Students enrolled in React certification program",
    maxSize: 25,
  },
});

// 2. Add students to group
await prisma.studentGroupMember.createMany({
  data: students.map(s => ({
    userId: s.id,
    groupId: group.id,
  })),
});

// 3. Link group to course
await prisma.courseGroupRequirement.create({
  data: {
    courseId: course.id,
    groupId: group.id,
    requireFullGroup: true,
  },
});

// 4. Course status → PENDING_GROUP until all 25 students enroll
```

### Example 3: Manual Publish with Validation

```typescript
// Admin clicks "Publish Now"
const result = await fetch(`/api/admin/courses/${courseId}/publish`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ force: false }),
});

// If group requirements not met:
// Response: { error: "Group enrollment requirements not met", enrolled: 18, required: 25 }

// Admin can force publish:
const forceResult = await fetch(`/api/admin/courses/${courseId}/publish`, {
  method: 'POST',
  body: JSON.stringify({ force: true }),
});
// Course published regardless of group status
```

---

## 🔄 Automatic Publication System

### Background Job (To Be Implemented)

Create a scheduled job to check and auto-publish courses:

```typescript
// Every 5 minutes, check for courses ready to publish
async function autoPublishCourses() {
  const now = new Date();

  const coursesToPublish = await prisma.course.findMany({
    where: {
      status: 'SCHEDULED',
      publicationDate: {
        lte: now,
      },
    },
  });

  for (const course of coursesToPublish) {
    // Check group requirements
    const groupsReady = await checkGroupRequirements(course.id);

    if (groupsReady) {
      await prisma.course.update({
        where: { id: course.id },
        data: { status: 'PUBLISHED', isPublished: true },
      });

      // Send notifications
      await notifyStudents(course.id);
    } else {
      // Update to PENDING_GROUP
      await prisma.course.update({
        where: { id: course.id },
        data: { status: 'PENDING_GROUP' },
      });
    }
  }
}
```

### Cron Job Setup

**Option 1: Vercel Cron**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/auto-publish",
    "schedule": "*/5 * * * *"
  }]
}
```

**Option 2: Node-Cron**
```typescript
import cron from 'node-cron';

// Run every 5 minutes
cron.schedule('*/5 * * * *', autoPublishCourses);
```

---

## 🎓 Admin Workflows

### Workflow 1: Create Class Cohort with Scheduled Course

```
1. Navigate to /admin/student-groups
2. Click "Create Group"
3. Enter:
   - Name: "Web Development Bootcamp Q1 2025"
   - Description: "January - March 2025 cohort"
   - Max Size: 30
4. Click "Create Group"
5. Click "Manage" on the new group
6. Add students using email search
7. Navigate to /admin/courses
8. Create or edit a course
9. Set Publication Date: 2025-01-15 09:00
10. Link to "Web Development Bootcamp Q1 2025" group
11. Require full group enrollment
12. Save course
13. Monitor enrollment progress in /admin/publication-calendar
14. On January 15, 2025 at 9:00 AM (if all enrolled), course auto-publishes
```

### Workflow 2: Emergency Publish

```
1. Go to /admin/publication-calendar
2. Find course stuck in PENDING_GROUP
3. Review group enrollment status (e.g., 22/25)
4. Click "Publish Now"
5. Confirm force publish
6. Course immediately published
```

### Workflow 3: Bulk Schedule Publications

```
1. Prepare list of course IDs with dates
2. Use bulk update API:

const updates = [
  { courseId: "course1", publicationDate: "2025-01-15T09:00:00", status: "SCHEDULED" },
  { courseId: "course2", publicationDate: "2025-02-01T09:00:00", status: "SCHEDULED" },
  { courseId: "course3", publicationDate: "2025-03-01T09:00:00", status: "SCHEDULED" },
];

fetch('/api/admin/publication-schedule', {
  method: 'PUT',
  body: JSON.stringify({ updates }),
});

3. View results in publication calendar
```

---

## ✅ Acceptance Criteria Checklist

| AC | Requirement | Status | Location |
|----|-------------|--------|----------|
| AC1 | Course with future date shows SCHEDULED | ✅ | Database + UI |
| AC2 | Auto-publish when date reached | ⏳ | Needs cron job |
| AC3 | Admin can manually publish anytime | ✅ | `/api/admin/courses/[id]/publish` |
| AC4 | Cannot publish until group fully enrolled (unless forced) | ✅ | Publish API validation |
| AC5 | When group complete → PENDING_GROUP → Admin can publish | ✅ | Status logic |
| AC6 | Bulk update publication dates | ✅ | `/api/admin/publication-schedule` PUT |
| AC7 | Calendar view of publications | ✅ | `/admin/publication-calendar` |
| AC8 | No duplicate publications | ⏳ | Needs validation |

---

## 🚀 Next Steps

### High Priority

1. **Automated Publication Background Job**
   - Set up cron job to check every 5-10 minutes
   - Auto-publish SCHEDULED courses when date reached
   - Update PENDING_GROUP status

2. **Email Notifications**
   - Notify students when course published
   - Notify instructors of publication status
   - Alert admins of pending group requirements

3. **Course Editor Integration**
   - Add publication scheduling to course edit page
   - Group requirement selector
   - Publication date picker

### Medium Priority

4. **Duplicate Prevention**
   - Validate no two publications of same course on same day
   - Warning UI for scheduling conflicts

5. **Calendar View Enhancement**
   - Actual calendar grid view (month/week)
   - Drag-and-drop rescheduling
   - Color coding by status

6. **Reporting**
   - Publication success metrics
   - Group enrollment reports
   - Scheduled vs actual publication times

### Optional Enhancements

7. **Multi-Group Requirements**
   - Support multiple groups per course
   - AND/OR logic for requirements

8. **Auto-Email Reminders**
   - Email students who haven't enrolled yet
   - Deadline reminders for group completion

9. **Dependencies**
   - Course A must publish before Course B
   - Prerequisite chains

---

## 🔐 Security & Permissions

### Access Control

- **Admin Only**: All publication and group management features
- **Instructor**: Cannot modify publication schedule (admin only)
- **Student**: No access to management features

### Data Protection

- Group membership data is private
- Only admins see enrollment progress
- Publication schedules not visible to students until published

---

## 📱 Mobile Responsiveness

All admin pages are fully responsive:
- Grid layouts adapt to mobile
- Touch-friendly buttons
- Readable on tablets
- Optimized for desktop admin work

---

## 🐛 Troubleshooting

### Issue: Course not auto-publishing

**Cause:** Background job not running

**Solution:**
```bash
# Verify cron job is active
# Check logs for errors
# Manually trigger: POST /api/cron/auto-publish
```

### Issue: Cannot delete student group

**Cause:** Group has linked courses

**Solution:**
1. Go to publication calendar
2. Find courses linked to group
3. Remove group requirement from courses
4. Then delete group

### Issue: Group enrollment stuck

**Cause:** Some students haven't enrolled

**Solution:**
1. Go to group detail page
2. View member list
3. Cross-reference with course enrollments
4. Contact missing students or force publish

---

## 📚 Additional Resources

- [Prisma Schema Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Cron Jobs in Vercel](https://vercel.com/docs/cron-jobs)

---

**Implementation Date:** December 10, 2025
**Version:** 1.0.0
**Status:** ✅ Backend Complete | ⏳ Background Jobs Pending
