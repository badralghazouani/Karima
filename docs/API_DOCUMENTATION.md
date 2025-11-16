# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require a valid session cookie from NextAuth.js.

### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "STUDENT"
}
```

---

## Courses

### Get All Courses
```http
GET /api/courses?category=programming&level=BEGINNER&isFree=true&search=javascript
```

**Query Parameters:**
- `category` (optional): Filter by category slug
- `level` (optional): BEGINNER | INTERMEDIATE | ADVANCED | ALL_LEVELS
- `isFree` (optional): true | false
- `search` (optional): Search in title and description

**Response:**
```json
[
  {
    "id": "course_id",
    "title": "JavaScript Fundamentals",
    "slug": "javascript-fundamentals",
    "description": "Learn JavaScript from scratch",
    "thumbnail": "https://...",
    "price": "49.99",
    "isFree": false,
    "isPublished": true,
    "level": "BEGINNER",
    "instructor": {
      "id": "instructor_id",
      "name": "Jane Smith",
      "avatar": "https://..."
    },
    "categories": [
      {
        "category": {
          "id": "cat_id",
          "name": "Programming",
          "slug": "programming"
        }
      }
    ],
    "lessons": [
      {
        "id": "lesson_id",
        "duration": 3600
      }
    ],
    "_count": {
      "enrollments": 1234
    }
  }
]
```

### Create Course (Instructor Only)
```http
POST /api/courses
Content-Type: application/json
Authorization: Required

{
  "title": "Advanced React Patterns",
  "description": "Master advanced React concepts",
  "price": 79.99,
  "level": "ADVANCED",
  "language": "en",
  "categoryIds": ["cat_id_1", "cat_id_2"]
}
```

**Response:**
```json
{
  "id": "new_course_id",
  "title": "Advanced React Patterns",
  "slug": "advanced-react-patterns",
  "description": "Master advanced React concepts",
  "price": "79.99",
  "isFree": false,
  "isPublished": false,
  "level": "ADVANCED",
  "language": "en",
  "instructor": {...},
  "categories": [...]
}
```

### Get Course by ID
```http
GET /api/courses/[id]
```

**Response:**
```json
{
  "id": "course_id",
  "title": "Course Title",
  "description": "Course description",
  "lessons": [
    {
      "id": "lesson_id",
      "title": "Lesson 1",
      "description": "Lesson description",
      "videoUrl": "https://...",
      "duration": 1800,
      "order": 1,
      "isFree": true
    }
  ],
  "documents": [...],
  "exercises": [...]
}
```

### Update Course (Instructor Only)
```http
PUT /api/courses/[id]
Content-Type: application/json
Authorization: Required

{
  "title": "Updated Title",
  "price": 59.99,
  "isPublished": true
}
```

### Delete Course (Instructor Only)
```http
DELETE /api/courses/[id]
Authorization: Required
```

---

## Enrollments

### Get User's Enrollments
```http
GET /api/enrollments
Authorization: Required
```

**Response:**
```json
[
  {
    "id": "enrollment_id",
    "enrolledAt": "2025-01-15T10:00:00Z",
    "completedAt": null,
    "course": {...},
    "progress": {
      "completed": 5,
      "total": 20,
      "percentage": 25
    }
  }
]
```

### Enroll in Course
```http
POST /api/enrollments
Content-Type: application/json
Authorization: Required

{
  "courseId": "course_id"
}
```

**Response:**
```json
{
  "id": "enrollment_id",
  "userId": "user_id",
  "courseId": "course_id",
  "enrolledAt": "2025-01-15T10:00:00Z",
  "completedAt": null
}
```

**Error Responses:**
- `402 Payment Required` - For paid courses without payment
- `409 Conflict` - Already enrolled

---

## Progress

### Get Course Progress
```http
GET /api/progress?courseId=course_id
Authorization: Required
```

**Response:**
```json
[
  {
    "id": "progress_id",
    "userId": "user_id",
    "lessonId": "lesson_id",
    "isCompleted": true,
    "watchedAt": "2025-01-15T10:30:00Z",
    "lesson": {
      "id": "lesson_id",
      "title": "Introduction",
      "duration": 1200
    }
  }
]
```

### Mark Lesson Complete
```http
POST /api/progress
Content-Type: application/json
Authorization: Required

{
  "lessonId": "lesson_id",
  "isCompleted": true
}
```

**Response:**
```json
{
  "progress": {
    "id": "progress_id",
    "userId": "user_id",
    "lessonId": "lesson_id",
    "isCompleted": true,
    "watchedAt": "2025-01-15T10:30:00Z"
  },
  "courseProgress": {
    "completed": 6,
    "total": 20,
    "percentage": 30
  }
}
```

---

## Payments

### Create Checkout Session
```http
POST /api/payments/create-checkout
Content-Type: application/json
Authorization: Required

{
  "courseId": "course_id"
}
```

**Response:**
```json
{
  "sessionId": "stripe_session_id",
  "url": "https://checkout.stripe.com/..."
}
```

### Stripe Webhook
```http
POST /api/payments/webhook
Content-Type: application/json
Stripe-Signature: signature

{
  // Stripe event payload
}
```

**Handled Events:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## Documents

### Get Course Documents
```http
GET /api/documents?courseId=course_id
```

**Response:**
```json
[
  {
    "id": "doc_id",
    "title": "Course Syllabus",
    "description": "Overview of the course",
    "fileUrl": "https://...",
    "fileType": "pdf",
    "fileSize": 1024000,
    "type": "RESOURCE",
    "courseId": "course_id"
  }
]
```

### Upload Document (Instructor Only)
```http
POST /api/documents
Content-Type: multipart/form-data
Authorization: Required

{
  "title": "Course Materials",
  "description": "Supplementary materials",
  "file": <file>,
  "type": "RESOURCE",
  "courseId": "course_id"
}
```

**Response:**
```json
{
  "id": "doc_id",
  "title": "Course Materials",
  "fileUrl": "https://s3.amazonaws.com/...",
  "fileType": "pdf",
  "fileSize": 2048000
}
```

---

## Exercises

### Get Course Exercises
```http
GET /api/exercises?courseId=course_id
```

**Response:**
```json
[
  {
    "id": "exercise_id",
    "title": "Quiz: Variables and Data Types",
    "description": "Test your understanding",
    "question": "What is the difference between let and const?",
    "type": "TEXT",
    "order": 1,
    "courseId": "course_id"
  }
]
```

### Create Exercise (Instructor Only)
```http
POST /api/exercises
Content-Type: application/json
Authorization: Required

{
  "title": "Practice: Functions",
  "description": "Write a function",
  "question": "Create a function that reverses a string",
  "type": "CODE",
  "order": 1,
  "courseId": "course_id",
  "answer": "function reverse(str) { return str.split('').reverse().join(''); }"
}
```

### Submit Exercise Answer
```http
POST /api/exercises/submit
Content-Type: application/json
Authorization: Required

{
  "exerciseId": "exercise_id",
  "answer": "let and const both declare variables, but const cannot be reassigned"
}
```

**Response:**
```json
{
  "id": "submission_id",
  "exerciseId": "exercise_id",
  "answer": "...",
  "isCorrect": true,
  "feedback": "Great job! Your answer is correct."
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Anonymous users**: 100 requests per 15 minutes
- **Authenticated users**: 1000 requests per 15 minutes

---

## Pagination

For endpoints returning lists, pagination is supported:

```http
GET /api/courses?page=1&limit=20
```

**Response includes pagination metadata:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```
