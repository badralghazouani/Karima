# Testing Guide - Karima Course Platform

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- (Optional) Stripe account for payment testing
- (Optional) AWS S3 or Cloudinary account for file uploads

## 1. Initial Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

**Minimum required variables for testing:**

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/karima_db?schema=public"

# NextAuth (Required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-secret-key-for-development"

# Stripe (Optional - for payment testing)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# File Uploads (Optional - for video/image uploads)
# Option 1: Use Cloudinary (easier for testing)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev

# Seed database with test data (categories + test users)
npm run seed
```

This will create:
- 10 course categories (Web Development, Data Science, etc.)
- 3 test users:
  - **Student**: student@karima.com / student123
  - **Instructor**: instructor@karima.com / instructor123
  - **Admin**: admin@karima.com / admin123

### Step 4: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 2. Testing Authentication

### Sign Up as New User

1. Go to http://localhost:3000/auth/signup
2. Fill in:
   - Name: "John Doe"
   - Email: "john@test.com"
   - Password: "password123"
   - Role: Choose "Student" or "Instructor"
3. Click "Create Account"
4. You'll be redirected to the dashboard

### Login with Test Accounts

1. Go to http://localhost:3000/auth/login
2. Use one of these credentials:
   - Student: student@karima.com / student123
   - Instructor: instructor@karima.com / instructor123
3. Click "Sign In"

---

## 3. Testing Course Creation (Instructor)

### Create a Course

1. Login as instructor (instructor@karima.com)
2. Go to http://localhost:3000/instructor/courses
3. Click "Create New Course"
4. Fill in course details:
   - Title: "JavaScript Masterclass"
   - Description: "Learn JavaScript from scratch"
   - Price: 49.99 (or 0 for free)
   - Level: "Beginner"
   - Categories: Select "Web Development"
5. Click "Create Course"

### Add Lessons to Course

1. Open the course you created
2. Click "Curriculum" tab
3. Click "Add Lesson"
4. Fill in lesson details:
   - Title: "Introduction to JavaScript"
   - Description: "Your first steps"
   - Video URL: Use any video URL (e.g., sample videos)
   - Duration: 600 (seconds)
   - Check "Free Preview" to allow preview
5. Click "Add Lesson"
6. Repeat to add more lessons

**Note:** For video URLs, you can use:
- YouTube video URLs (for testing)
- Local video files
- Or placeholder URLs like: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"

### Publish the Course

1. Go to "Settings" tab
2. Click "Publish Course"
3. The course is now visible to students

---

## 4. Testing Reviews & Ratings ⭐ (NEW)

### As Student - Leave a Review

1. Login as student (student@karima.com)
2. Go to http://localhost:3000/courses
3. Find the course created by the instructor
4. Click "Enroll for Free" (or buy if it's paid)
5. After enrollment, go back to the course page
6. Scroll down to "Student Reviews" section
7. Click "Write a Review"
8. Select star rating (1-5 stars)
9. Write a comment (optional)
10. Click "Submit Review"

**Expected Results:**
- ✅ Review appears immediately
- ✅ Average rating updates
- ✅ Rating distribution chart updates
- ✅ Can edit your own review
- ✅ Can delete your own review
- ✅ Cannot review twice (will show error)

### Test Review Features

- **View Reviews:** Go to any course page and scroll to reviews section
- **Rating Stats:** See average rating and total count
- **Distribution:** View bar chart showing 5-star to 1-star counts
- **Edit Review:** Click "Edit" on your own review
- **Delete Review:** Click "Delete" on your own review

### As Another Student

1. Create/login as another student
2. Enroll in the same course
3. Leave a different review
4. Verify both reviews appear
5. Check that average rating is calculated correctly

---

## 5. Testing Exercises & Quizzes 📝 (NEW)

### As Instructor - Create Exercises

1. Login as instructor (instructor@karima.com)
2. Go to your course editor
3. Click "Exercises & Quizzes" tab
4. Click "Add Exercise"

#### Create a Multiple Choice Question

1. Fill in:
   - Title: "JavaScript Basics Quiz"
   - Description: "Test your JavaScript knowledge"
   - Type: "Multiple Choice"
   - Points: 10
   - Question: "What keyword is used to declare a variable in JavaScript?"
2. Add options:
   - Option 1: "var" (mark as correct)
   - Option 2: "variable"
   - Option 3: "v"
   - Option 4: "let"
3. Click "Add Exercise"

#### Create a Text Answer Question

1. Click "Add Exercise" again
2. Fill in:
   - Title: "Define JavaScript"
   - Type: "Text Answer"
   - Points: 5
   - Question: "What is JavaScript?"
   - Expected Answer: "programming language" (for auto-grading)
3. Click "Add Exercise"

#### Create a Code Exercise

1. Click "Add Exercise"
2. Fill in:
   - Title: "Write Hello World"
   - Type: "Code Exercise"
   - Points: 15
   - Question: "Write a function that returns 'Hello World'"
   - Leave answer blank (will be manually graded)
3. Click "Add Exercise"

### As Student - Take Exercises

1. Login as student (student@karima.com)
2. Enroll in the course (if not already)
3. Go to http://localhost:3000/learn/[course-slug]
4. Click "Exercises" tab in the sidebar
5. You'll see:
   - Progress stats (0/3 completed, 0/30 points)
   - List of all exercises

#### Take a Multiple Choice Quiz

1. Click on the first exercise to expand it
2. Read the question
3. Select your answer by clicking a radio button
4. Click "Submit Answer"
5. **Expected Results:**
   - ✅ Auto-graded immediately
   - ✅ Shows "✓ Correct" or "✗ Incorrect"
   - ✅ Shows score (10/10 or 0/10)
   - ✅ Progress updates (1/3 completed)
   - ✅ Cannot submit again (shows previous submission)

#### Submit a Text Answer

1. Click on the text question
2. Type your answer
3. Click "Submit Answer"
4. If it matches the expected answer (case-insensitive), it's marked correct

#### Submit a Code Answer

1. Click on code exercise
2. Write your code in the text area
3. Click "Submit Answer"
4. Shows as submitted (awaiting manual grading)

### View Exercise Progress

- Top of exercises section shows:
  - Exercises completed: X/Y
  - Progress bar
  - Total score: X/Y pts (percentage)
- Each exercise shows completion status
- Click any exercise to see your submission and score

---

## 6. Testing Student Learning Flow

### Complete Learning Experience

1. Login as student
2. Go to "My Courses" dashboard
3. Click "Continue Learning" on a course
4. **Lessons Tab:**
   - Watch video lessons
   - Mark lessons as complete
   - Track progress percentage
5. **Exercises Tab:**
   - Take all available exercises
   - View your scores
   - See overall progress
6. Go back to course page
7. Leave a review with rating

---

## 7. Testing Payment Flow (If Stripe configured)

1. Create a paid course as instructor (price > 0)
2. Publish the course
3. Login as student
4. Try to enroll in the paid course
5. Click "Buy Now"
6. Use Stripe test card: 4242 4242 4242 4242
7. Any future expiry date
8. Any 3-digit CVC
9. Complete payment
10. Verify automatic enrollment

---

## 8. Common Test Scenarios

### Scenario 1: Complete Course Journey

1. Instructor creates course with 3 lessons + 3 exercises
2. Student enrolls
3. Student completes all lessons (100% lesson progress)
4. Student completes all exercises (100% exercise progress)
5. Student leaves 5-star review
6. Verify all progress is tracked

### Scenario 2: Multiple Students Same Course

1. Have 3 students enroll in same course
2. Each student leaves different rating (5, 4, 3 stars)
3. Verify average rating shows 4.0
4. Verify rating distribution shows 1 review for each
5. Each student takes exercises
6. Instructor sees all submissions

### Scenario 3: Edit and Delete Content

1. Instructor edits course details
2. Instructor edits lesson information
3. Instructor edits exercise questions
4. Instructor deletes an exercise
5. Student edits their review
6. Student deletes their review
7. Verify all changes persist

---

## 9. Testing Edge Cases

### Reviews

- ❌ Try to review without enrollment → Should show error
- ❌ Try to review twice → Should show error
- ✅ Edit your own review → Should work
- ❌ Edit someone else's review → Should not show edit button
- ❌ Leave review without rating → Should show error
- ✅ Leave review without comment → Should work

### Exercises

- ❌ Try to access exercises without enrollment → Should show error
- ❌ Try to create exercise as student → Should get 403 error
- ✅ Submit multiple choice answer → Should auto-grade
- ✅ Submit without answer → Should show error
- ✅ View submission history → Should show previous answers
- ❌ Submit same exercise twice → Should update submission

---

## 10. Database Inspection

### View data in Prisma Studio

```bash
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can:
- View all reviews in the Review table
- View all exercises in the Exercise table
- View quiz options in the QuizOption table
- View exercise submissions in ExerciseSubmission table
- Check scores and feedback

---

## 11. Troubleshooting

### Issue: Database errors

```bash
# Reset database
npx prisma migrate reset

# Re-seed data
npm run seed
```

### Issue: "Module not found" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Prisma client out of sync

```bash
# Regenerate Prisma client
npx prisma generate
```

### Issue: Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

---

## 12. Quick Test Checklist

### Basic Features ✓
- [ ] Sign up new user
- [ ] Login with test account
- [ ] Create course as instructor
- [ ] Add lessons to course
- [ ] Publish course
- [ ] Enroll as student
- [ ] Watch lessons
- [ ] Mark lessons complete

### Reviews & Ratings ⭐ (NEW)
- [ ] Write review after enrollment
- [ ] See review appear immediately
- [ ] View average rating
- [ ] See rating distribution
- [ ] Edit own review
- [ ] Delete own review
- [ ] Multiple students leave reviews
- [ ] Average rating calculates correctly

### Exercises & Quizzes 📝 (NEW)
- [ ] Create multiple-choice exercise
- [ ] Create text answer exercise
- [ ] Create code exercise
- [ ] Student takes multiple-choice quiz
- [ ] Auto-grading works
- [ ] Score displayed correctly
- [ ] Progress tracking updates
- [ ] Submit text answer
- [ ] Submit code answer
- [ ] View submission history
- [ ] See total score calculation

---

## 13. API Testing (Optional)

You can also test APIs directly using curl or Postman:

### Get Reviews

```bash
curl http://localhost:3000/api/reviews?courseId=<COURSE_ID>
```

### Get Exercises

```bash
curl -H "Cookie: next-auth.session-token=<TOKEN>" \
  http://localhost:3000/api/exercises?courseId=<COURSE_ID>
```

### Submit Exercise

```bash
curl -X POST http://localhost:3000/api/exercises/submit \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<TOKEN>" \
  -d '{"exerciseId":"<EXERCISE_ID>","answer":"var"}'
```

---

## Need Help?

If you encounter issues:

1. Check the browser console for errors (F12)
2. Check the terminal for server errors
3. Verify `.env` file has required variables
4. Ensure database is running
5. Try clearing browser cache
6. Check Prisma Studio for data

Happy Testing! 🚀
