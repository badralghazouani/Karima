# Quick Start - Testing in 5 Minutes ⚡

## Step 1: Install Dependencies (if not done)

```bash
npm install
```

## Step 2: Configure Database

Edit your `.env` file - make sure this line is correct:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/karima_db?schema=public"
```

Replace `user`, `password`, and database name with your PostgreSQL credentials.

**Minimum .env for testing:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/karima_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="test-secret-key-123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 3: Setup Database & Seed Data

```bash
# Generate Prisma client with new models (Review, Exercise, QuizOption)
npx prisma generate

# Create/update database tables
npx prisma migrate dev --name init

# Add test data (3 test users + 10 categories)
npm run seed
```

## Step 4: Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## Test Accounts (Created by seed)

| Role | Email | Password |
|------|-------|----------|
| **Student** | student@karima.com | student123 |
| **Instructor** | instructor@karima.com | instructor123 |
| **Admin** | admin@karima.com | admin123 |

---

## Quick Test Flow (10 minutes)

### 1. Test Reviews ⭐ (3 minutes)

```
1. Login as instructor → Create course → Add 2 lessons → Publish
2. Login as student → Enroll in course → Watch lessons
3. Go to course page → Leave 5-star review with comment
4. Create another student account → Enroll → Leave 4-star review
5. Check average rating shows 4.5 stars ✅
```

### 2. Test Exercises 📝 (5 minutes)

```
1. Login as instructor → Open course editor
2. Click "Exercises & Quizzes" tab
3. Add Multiple Choice quiz:
   - Question: "What is 2+2?"
   - Options: 3, 4 (correct), 5, 6
   - Points: 10
4. Add Text Answer:
   - Question: "Capital of France?"
   - Answer: "Paris"
   - Points: 5
5. Login as student → Go to course player
6. Click "Exercises" tab
7. Take both exercises
8. Check score shows 15/15 points ✅
9. Check progress shows 2/2 completed ✅
```

### 3. Test Edge Cases (2 minutes)

```
1. Try to review without enrollment → ❌ Error
2. Try to review twice → ❌ Error
3. Edit your review → ✅ Works
4. Delete review → ✅ Works
5. Submit exercise without answer → ❌ Error
6. Take exercise again → ✅ Updates submission
```

---

## Visual Verification

### Reviews Section Should Show:
- ⭐⭐⭐⭐⭐ Average rating with count
- Rating distribution bar chart (5 stars, 4 stars, etc.)
- List of reviews with user avatars
- Edit/Delete buttons on your own reviews

### Exercises Section Should Show:
- Progress bars for completion and score
- List of exercises with type badges (MULTIPLE CHOICE, TEXT, CODE)
- Point values for each exercise
- ✓ Correct / ✗ Incorrect indicators
- Expandable exercise cards

---

## Verify in Database (Optional)

```bash
# Open Prisma Studio
npx prisma studio
```

Visit http://localhost:5555 to see:
- **Review** table - Your reviews with ratings
- **Exercise** table - All created exercises
- **QuizOption** table - Multiple choice options
- **ExerciseSubmission** table - Student answers and scores

---

## Common Issues

### "Prisma Client is not generated"
```bash
npx prisma generate
```

### "Migration failed"
```bash
# Reset and try again
npx prisma migrate reset
npm run seed
```

### "Port 3000 in use"
```bash
# Kill the process
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

### Cannot connect to database
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env file
- Try: `psql -U youruser -d postgres` to test connection

---

## What's New in This Update? 🎉

### Course Reviews & Ratings ⭐
- Students can rate courses 1-5 stars
- Leave text reviews (optional)
- Edit/delete own reviews
- See average rating and distribution
- Only enrolled students can review
- One review per student per course

### Exercise & Quiz System 📝
- Instructors create exercises from course editor
- 4 question types: Multiple Choice, Text, Code, File Upload
- Auto-grading for multiple choice and text answers
- Manual grading for code and files
- Points system with score tracking
- Progress tracking for students
- View submission history
- Instant feedback

### API Endpoints Added
- `/api/reviews` - CRUD operations for reviews
- `/api/exercises` - CRUD operations for exercises
- `/api/exercises/submit` - Submit answers

### Database Models Added
- `Review` - Store course ratings and comments
- `QuizOption` - Multiple choice options
- Enhanced `Exercise` with points field
- Enhanced `ExerciseSubmission` with score field

---

## Need More Details?

See **TESTING_GUIDE.md** for comprehensive testing instructions including:
- Detailed test scenarios
- API testing with curl
- Troubleshooting guide
- Complete feature checklist

---

Happy Testing! 🚀

**Tip:** Open browser DevTools (F12) to see API calls and debug any issues.
