# Video Player Troubleshooting Guide

## Quick Diagnostics

Please check the following and let me know what you're experiencing:

### 1. **Can you access the pages?**

Try these URLs:
- `http://localhost:3000/learn/[your-course-slug]` - Traditional learning page
- `http://localhost:3000/watch/[your-course-slug]` - YouTube-style watch page

Example: `http://localhost:3000/watch/intro-to-javascript`

### 2. **What do you see?**

- [ ] Black screen with no controls
- [ ] Error message (what does it say?)
- [ ] Page loads but video won't play
- [ ] Can't click on lessons
- [ ] Being redirected away from the page
- [ ] Something else (please describe)

### 3. **Check Browser Console**

1. Open browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Click "Console" tab
4. Look for red error messages
5. Share what errors you see

### 4. **Common Issues and Fixes**

#### Issue: "Can't read videos" / Videos won't play

**Possible causes:**
1. **Video URL is incorrect** - Check your lesson has a valid videoUrl
2. **CORS issue** - Video host blocking requests
3. **Video format not supported** - Use MP4 (H.264) format
4. **Access denied** - User doesn't have permission

**How to check:**
```javascript
// Check in browser console:
// 1. Are you logged in?
// 2. Are you enrolled in the course (or are you the instructor/admin)?
// 3. Does the video URL work when opened directly?
```

#### Issue: Page redirects immediately

**Cause:** Access control redirecting you

**Fix:** Make sure:
- You're logged in
- You're enrolled in the course (for students)
- OR you're the instructor of the course
- OR you're an admin

#### Issue: Video player doesn't show

**Cause:** Component not loading

**Check:**
1. Is the VideoPlayer component imported correctly?
2. Are there JavaScript errors in console?
3. Is the page rendering at all?

### 5. **Test with Sample Video**

Try with a public test video:
- Sample: `https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4`

Update a lesson's videoUrl to this and try playing it.

## What to Share

To help diagnose, please provide:

1. **What you're trying to do:**
   - Example: "I'm trying to watch videos as a student"

2. **What happens:**
   - Example: "Page loads but video area is blank"

3. **Any error messages:**
   - From browser console (F12)
   - From the screen

4. **Your role:**
   - Are you testing as: Student, Instructor, or Admin?

5. **Course details:**
   - Do you have courses created?
   - Do courses have lessons with videoUrl?
   - Are you enrolled (if student)?

## Quick Fixes to Try

### Fix 1: Clear and Restart

```bash
# Stop dev server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

### Fix 2: Check Course Data

Make sure your course has:
- At least one lesson
- Lesson has a videoUrl field
- VideoUrl points to a valid video file

### Fix 3: Check Database

```bash
# Check if lesson data exists
npx prisma studio
# Look at Lesson table
# Verify videoUrl field has data
```

### Fix 4: Test Access

Try accessing as different users:
- As the instructor who created the course
- As an admin
- As an enrolled student

## Need Immediate Help?

Tell me:
1. What specific action you're taking
2. What you expect to happen
3. What actually happens
4. Any error messages

And I'll help fix it right away!
