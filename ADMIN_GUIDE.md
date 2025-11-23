# Admin Panel Guide

## Overview

The admin panel provides comprehensive management capabilities for the entire Karima course platform. Administrators can view and manage all courses from all instructors, monitor platform statistics, and control course publication status.

## Access

### Login as Admin

Use the test admin account created by the seed script:
- **Email**: admin@karima.com
- **Password**: admin123

After logging in, you'll see an "Admin Panel" link in the header navigation.

## Features

### 1. Admin Dashboard

**URL**: `/admin/dashboard`

#### Statistics Overview

The dashboard displays real-time platform statistics:

- **Total Users**: All registered users (students, instructors, admins)
- **Total Courses**: All courses (published and drafts)
- **Total Enrollments**: Active student enrollments
- **Total Revenue**: Sum of all completed payments

#### Recent Activity

- **Recent Courses**: Latest 5 courses added to the platform
  - Shows course title, instructor name, and enrollment count
  - Quick "View" link to course details

- **Top Instructors**: Instructors ranked by number of courses
  - Shows instructor name, email, and course count
  - Displays avatar with first initial

### 2. Course Management

**URL**: `/admin/courses`

#### View All Courses

The course management page shows all courses from all instructors with:

**Stats Cards:**
- Total Courses
- Published Courses
- Draft Courses
- Total Enrollments

**Search & Filter:**
- Search by course title or instructor name
- Filter by status:
  - All courses
  - Published only
  - Drafts only

**Course List Display:**

Each course card shows:
- Course title and status badge (Published/Draft)
- Level badge (Beginner, Intermediate, Advanced)
- Description preview
- Instructor name
- Number of lessons, students, exercises, reviews
- Course price

**Quick Actions:**
- **Edit**: Open course editor
- **View**: Preview course as student
- **Publish/Unpublish**: Toggle publication status
- **Delete**: Remove course (with confirmation)

### 3. Course Editor

**URL**: `/admin/courses/[id]/edit`

Administrators can edit any course regardless of who created it.

#### Details Tab

Edit course information:
- Title
- Description
- Price (USD)
- Level (Beginner, Intermediate, Advanced, All Levels)
- Language

#### Curriculum Tab

Manage course lessons:
- View all lessons in order
- Add new lessons with:
  - Title
  - Description (optional)
  - Video URL
  - Duration (in seconds)
  - Free preview checkbox
- Edit existing lessons
- Delete lessons
- Lessons displayed with duration and preview status

#### Exercises & Quizzes Tab

Full access to the ExerciseManager component:
- Create multiple-choice questions
- Create text answer questions
- Create code exercises
- Create file upload exercises
- Edit exercise details
- Delete exercises
- View submission statistics (if instructor features enabled)

#### Settings Tab

**Publication Control:**
- Publish/unpublish courses
- Shows current publication status

**Danger Zone:**
- Delete course permanently
- Requires confirmation
- Cascades to lessons, exercises, enrollments, etc.

## Security & Permissions

### Role-Based Access Control

**API Level:**
- All `/api/admin/*` endpoints check for ADMIN role
- Returns 403 Forbidden if non-admin tries to access
- Session verification on every request

**Middleware Protection:**
- `/admin/*` routes protected by middleware
- Non-admin users redirected to home page
- Unauthenticated users redirected to login

**Auto-Redirects:**
- Admin users accessing `/dashboard` → redirected to `/admin/dashboard`
- Admin users accessing `/instructor` → redirected to `/admin/dashboard`
- Student/Instructor accessing `/admin` → redirected to home page

### What Admins Can Do

✅ **View All Courses**
- See courses from all instructors
- Access draft and published courses

✅ **Edit Any Course**
- Modify course details
- Add/edit/delete lessons
- Manage exercises
- Update pricing and settings

✅ **Publish/Unpublish Courses**
- Control course visibility
- Override instructor publish status

✅ **Delete Any Course**
- Remove courses completely
- Automatic cascade deletion

✅ **View Platform Statistics**
- Monitor user registrations
- Track course creation
- View enrollment trends
- See revenue totals

### What Admins Cannot Do (Yet)

❌ **User Management**
- Create/edit/delete users
- Change user roles
- Ban users

❌ **Payment Management**
- Issue refunds
- Adjust payment amounts
- View detailed payment history

❌ **Category Management**
- Add/edit/delete categories
- Reorder categories

*These features can be added in future updates*

## API Endpoints

### Get All Courses

```
GET /api/admin/courses
Authorization: Admin role required
```

**Response:**
```json
[
  {
    "id": "course_id",
    "title": "Course Title",
    "description": "Course description",
    "price": "49.99",
    "isPublished": true,
    "level": "BEGINNER",
    "instructor": {
      "id": "user_id",
      "name": "Instructor Name",
      "email": "instructor@example.com"
    },
    "_count": {
      "lessons": 10,
      "enrollments": 25,
      "exercises": 5,
      "reviews": 8
    }
  }
]
```

### Get Specific Course

```
GET /api/admin/courses/[id]
Authorization: Admin role required
```

**Response:**
```json
{
  "id": "course_id",
  "title": "Course Title",
  "description": "Course description",
  "price": "49.99",
  "isPublished": true,
  "level": "BEGINNER",
  "language": "en",
  "instructor": {
    "id": "user_id",
    "name": "Instructor Name",
    "email": "instructor@example.com"
  },
  "lessons": [...],
  "categories": [...],
  "_count": {
    "enrollments": 25,
    "exercises": 5,
    "reviews": 8
  }
}
```

### Update Course

```
PUT /api/admin/courses/[id]
Authorization: Admin role required
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 59.99,
  "level": "INTERMEDIATE",
  "isPublished": true
}
```

**Response:**
```json
{
  "id": "course_id",
  "title": "Updated Title",
  ...
}
```

### Delete Course

```
DELETE /api/admin/courses/[id]
Authorization: Admin role required
```

**Response:**
```json
{
  "success": true
}
```

## Testing Admin Features

### Test Scenario 1: View All Courses

1. Login as admin (admin@karima.com)
2. Click "Admin Panel" in header
3. Navigate to "All Courses"
4. Verify you see courses from all instructors
5. Use search to find specific courses
6. Try filtering by Published/Draft status

### Test Scenario 2: Edit Another Instructor's Course

1. Login as instructor (instructor@karima.com)
2. Create a course and add some lessons
3. Logout and login as admin
4. Go to Admin Panel → All Courses
5. Find the instructor's course
6. Click "Edit"
7. Modify course details
8. Verify changes are saved
9. Login back as instructor
10. Verify admin's changes appear

### Test Scenario 3: Publish/Unpublish Course

1. Login as admin
2. Go to All Courses
3. Find a draft course
4. Click "Publish" button
5. Verify status changes to "Published"
6. Logout and view course as guest
7. Verify course is now visible
8. Login as admin again
9. Click "Unpublish"
10. Verify course is hidden from public

### Test Scenario 4: Delete Course

1. Create a test course as instructor
2. Add lessons and exercises
3. Login as admin
4. Go to course editor
5. Navigate to Settings tab
6. Click "Delete Course"
7. Confirm deletion
8. Verify redirect to courses list
9. Verify course no longer exists
10. Check database to confirm cascade deletion

### Test Scenario 5: Security Check

1. Login as student or instructor
2. Try to access `/admin/dashboard` directly
3. Verify redirect to home page
4. Try to call `/api/admin/courses` via browser/curl
5. Verify 403 Forbidden response
6. Login as admin
7. Verify access granted

## Navigation Structure

```
Admin Panel
├── Dashboard
│   ├── Statistics Overview
│   ├── Recent Courses
│   └── Top Instructors
├── All Courses
│   ├── Course List
│   ├── Search & Filter
│   └── Quick Actions
├── Users (placeholder)
├── Payments (placeholder)
└── Categories (placeholder)
```

## Future Enhancements

### User Management
- View all users with roles
- Edit user details
- Change user roles
- Suspend/activate accounts
- View user activity

### Payment Management
- View all transactions
- Filter by status/date
- Issue refunds
- Export payment reports
- Revenue analytics

### Category Management
- Add new categories
- Edit category names/slugs
- Delete categories
- Reorder categories
- Set category icons

### Analytics Dashboard
- Course performance metrics
- Instructor leaderboards
- Revenue trends over time
- User growth charts
- Popular courses

### Bulk Operations
- Bulk publish/unpublish
- Bulk delete courses
- Bulk user operations
- Export data to CSV

### Email Notifications
- Notify instructors of changes
- Alert on course approval
- Platform announcements

## Tips for Admins

1. **Regular Monitoring**: Check dashboard daily for platform health
2. **Course Quality**: Review new courses before approving publication
3. **Instructor Support**: Use admin tools to help instructors fix issues
4. **Content Moderation**: Remove inappropriate content promptly
5. **Data Backup**: Ensure database backups before bulk operations
6. **Communication**: Notify instructors before making major changes
7. **Documentation**: Keep notes on policy decisions

## Troubleshooting

### Cannot Access Admin Panel

**Problem**: "Admin Panel" link not showing
**Solution**:
- Verify you're logged in as admin
- Check user role in database: `SELECT role FROM "User" WHERE email = 'admin@karima.com'`
- Clear browser cache and cookies
- Logout and login again

### 403 Error on Admin Routes

**Problem**: Getting "Unauthorized" error
**Solution**:
- Verify ADMIN role in session
- Check middleware is properly configured
- Verify authOptions includes role in JWT
- Check browser console for session errors

### Cannot Edit Courses

**Problem**: Changes not saving
**Solution**:
- Check browser console for errors
- Verify API endpoints are responding
- Check database connection
- Verify Prisma client is generated

### Courses Not Showing

**Problem**: Course list is empty
**Solution**:
- Run seed script: `npm run seed`
- Check database for courses: `npx prisma studio`
- Verify API response in Network tab
- Check if courses exist but are filtered out

## Support

For issues with the admin panel:
1. Check browser console for errors
2. Review server logs
3. Verify database connectivity
4. Check middleware configuration
5. Consult TESTING_GUIDE.md for setup help

---

**Version**: 1.0.0
**Last Updated**: November 2024
**Maintainer**: Karima Platform Team
