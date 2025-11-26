# Free Courses Guide

## Overview

The Karima Course Platform fully supports both **FREE** and **PAID** courses. This guide explains how free courses work and how to create and enroll in them.

## ✅ Yes, You Can Publish Free Courses!

**Answer to your questions:**
1. ✅ **YES** - You can publish free courses
2. ✅ **YES** - Students can enroll without paying

---

## How Free Courses Work

### For Instructors

#### Creating a Free Course

1. **Go to Instructor Dashboard**: `/instructor/courses`

2. **Create New Course**: Click "Create New Course"

3. **Set Price to $0**: When editing course details:
   - Set price to `0` or `0.00`
   - The system automatically marks it as `isFree = true`

4. **Add Content**: Add lessons, exercises, and materials as usual

5. **Publish**: Click "Publish Course" when ready

#### Free Course Indicators

- **FREE Badge**: Free courses show a green "FREE" badge
- **Price Display**: Shows "Free" or "$0.00"
- **Auto-enrollment**: Students enroll instantly without payment

### For Students

#### Enrolling in Free Courses

1. **Browse Courses**: Go to `/courses`

2. **Filter Free Courses**: Use the price filter "Free" to see only free courses

3. **View Course Details**: Click on a course card

4. **Enroll Instantly**:
   - Click "Enroll for Free" button
   - No payment required
   - Instant access granted
   - Automatically redirected to video player

5. **Start Learning**: Begin watching videos immediately

---

## User Workflow

### 1. Browse Courses Page (`/courses`)

```
+------------------+------------------+
|  Course A - $49  |  Course B - FREE |
|  [Buy Now]       |  [View Course]   |
+------------------+------------------+
```

**Free Course Filter:**
- All Prices / Free / Paid dropdown
- Shows only free courses when "Free" selected

### 2. Course Detail Page (`/courses/[id]`)

**For FREE Courses:**
```
Course Title
Description...

FREE [Badge]
Created by: John Doe
100 students enrolled

[Enroll for Free] ← Click to enroll instantly
```

**For PAID Courses:**
```
Course Title
Description...

$49.99
Created by: John Doe
100 students enrolled

[Buy Course] ← Goes to checkout
```

### 3. After Enrollment

**Enrolled courses show:**
```
[Go to Course] ← Click to start learning
```

Or from "My Courses" page:
```
[Watch] ← YouTube-style player
```

---

## Technical Implementation

### Database Schema

```prisma
model Course {
  id          String   @id
  title       String
  price       Decimal  @default(0)
  isFree      Boolean  @default(true)  // Auto-set based on price
  isPublished Boolean  @default(false)
  // ...
}
```

### Price → isFree Logic

When updating course price:
```typescript
const updatedCourse = await prisma.course.update({
  where: { id: courseId },
  data: {
    price: parsedPrice,
    isFree: parsedPrice === 0,  // Auto-set
  },
});
```

### Enrollment API

**Free Course Enrollment** (`/api/enrollments`):

```typescript
// For free courses - skip payment verification
if (!course.isFree) {
  // Check for payment
  const payment = await prisma.payment.findFirst({
    where: { userId, courseId, status: 'COMPLETED' },
  });
  
  if (!payment) {
    return NextResponse.json(
      { error: 'Payment required' },
      { status: 402 }
    );
  }
}

// Free courses skip payment check and enroll directly
const enrollment = await prisma.enrollment.create({
  data: { userId, courseId },
});
```

---

## Step-by-Step: Creating Your First Free Course

### As an Instructor:

1. **Navigate to Instructor Dashboard**
   ```
   /instructor/courses
   ```

2. **Click "Create New Course"**
   - Enter title: "Introduction to JavaScript"
   - Enter description
   - **Set price: 0**
   - Select level: Beginner
   - Click "Create"

3. **Add Lessons**
   - Go to "Curriculum" tab
   - Click "Add Lesson"
   - Add video URL, title, duration
   - Repeat for all lessons

4. **Publish Course**
   - Go to "Settings" tab
   - Click "Publish Course"
   - ✅ Course is now live and FREE!

### As a Student:

1. **Browse Courses**
   ```
   /courses
   ```

2. **Filter by "Free"**
   - Price dropdown → "Free"
   - See all free courses

3. **Click Course Card**
   - View "Introduction to JavaScript"
   - See FREE badge
   - See course content

4. **Click "Enroll for Free"**
   - Instant enrollment
   - No payment
   - Redirect to `/watch/[courseId]`

5. **Start Learning!**
   - Watch videos
   - Complete lessons
   - Track progress

---

## Course Pricing Options

### Free Course ($0)
- ✅ Instant enrollment
- ✅ No payment required
- ✅ Shows "FREE" badge
- ✅ "Enroll for Free" button

### Paid Course ($X)
- 💳 Requires payment
- 💳 Stripe checkout
- 💵 Shows price amount
- 💵 "Buy Course" button

---

## UI Elements for Free Courses

### 1. Course Card
```jsx
{course.isFree && (
  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
    FREE
  </span>
)}
```

### 2. Price Display
```jsx
<div className="text-3xl font-bold">
  {course.isFree ? 'Free' : formatPrice(course.price)}
</div>
```

### 3. Enrollment Button
```jsx
{course.isFree ? (
  <Button onClick={handleEnroll}>
    Enroll for Free
  </Button>
) : (
  <Button onClick={handleBuyCourse}>
    Buy Course
  </Button>
)}
```

---

## Access Control

### Who Can Access Videos:

1. **Enrolled Students** ✅
   - Must enroll (free or paid)
   - Can watch all videos
   - Track progress

2. **Course Instructor** ✅
   - Can watch own course videos
   - No enrollment needed
   - Preview before publishing

3. **Administrators** ✅
   - Can watch any course
   - No enrollment needed
   - Platform management

---

## Common Questions

### Q: Can I change a paid course to free later?
**A:** Yes! Edit the course and set price to $0. The `isFree` flag updates automatically.

### Q: Can I change a free course to paid?
**A:** Yes! Set a price > $0. Existing enrollments remain valid, new students must pay.

### Q: Do free courses show in search?
**A:** Yes! Free courses appear in all course listings with a "FREE" badge.

### Q: Can I offer some lessons as free preview?
**A:** Yes! When creating lessons, check "Allow free preview" for specific lessons.

### Q: Is there a limit on free courses?
**A:** No limits! Create as many free courses as you want.

### Q: Can students get certificates for free courses?
**A:** Yes! Certificate system works the same for free and paid courses.

---

## Testing Free Course Workflow

### Test Scenario 1: Create & Enroll

1. **As Instructor:**
   - Create course
   - Set price to $0
   - Add lessons
   - Publish

2. **As Student:**
   - Browse courses
   - Find free course
   - Click "Enroll for Free"
   - Verify instant access

### Test Scenario 2: Price Change

1. **Start with Free:**
   - Create free course ($0)
   - Student enrolls

2. **Change to Paid:**
   - Update price to $49
   - Check `isFree` becomes `false`
   - New students must pay
   - Existing enrollments still valid

---

## API Endpoints

### Enroll in Free Course

```bash
POST /api/enrollments
Content-Type: application/json

{
  "courseId": "clxxx..."
}

# Response (Free Course)
200 OK
{
  "id": "enrollment-id",
  "userId": "user-id",
  "courseId": "course-id",
  "enrolledAt": "2025-11-24T..."
}
```

### Get Course Details

```bash
GET /api/courses/{courseId}

# Response
{
  "id": "course-id",
  "title": "Intro to JavaScript",
  "price": "0",
  "isFree": true,
  "isEnrolled": true,
  "canAccess": true,
  ...
}
```

---

## Summary

✅ **Free courses fully supported**
✅ **Instant enrollment (no payment)**
✅ **Same features as paid courses**
✅ **Easy to create and manage**
✅ **Clear UI indicators (FREE badge)**
✅ **Filter by price in course catalog**

### Quick Setup:

1. Create course
2. Set price to $0
3. Add content
4. Publish
5. Students enroll for free!

---

**Happy Teaching! 🎓**

Create amazing free courses and share your knowledge with the world!
