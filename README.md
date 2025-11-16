# Karima - Online Course Platform

A comprehensive course platform similar to Udemy with integrated document management system (GED). Built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

### User Management
- User registration and authentication
- Role-based access control (Student, Instructor, Admin)
- User profiles with progress tracking
- Password reset functionality

### Course Management
- Create, edit, and delete courses
- Free and paid courses
- Course categories and levels
- YouTube-style playlist interface
- Video lessons with progress tracking
- Preview lessons for non-enrolled users

### Progress Tracking
- Track watched videos per user
- Course completion percentage
- Automatic course completion detection
- Enrollment history

### Document Management (GED)
- Upload and manage documents (PDF, Word, etc.)
- Link documents to specific courses
- Categorize documents (Resources, Attachments, Homework, Certificates)
- File size and type validation

### Payment Integration
- Stripe integration for course purchases
- One-time payment support
- Payment history and receipts
- Access control based on payment status

### Exercises & Practice
- Create exercises for each course
- Multiple exercise types (Multiple Choice, Text, Code, File Upload)
- Student submissions and feedback
- Auto-grading support

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Backend API
- **Prisma** - ORM for database
- **NextAuth.js** - Authentication
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM

### Payment
- **Stripe** - Payment processing

### File Storage
- **AWS S3** or **Cloudinary** - File and video storage

## Project Structure

```
karima/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes
│   │   ├── auth/          # Authentication pages
│   │   ├── courses/       # Course catalog and details
│   │   ├── dashboard/     # Student dashboard
│   │   ├── instructor/    # Instructor dashboard
│   │   └── admin/         # Admin panel
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── courses/       # Course CRUD
│   │   ├── enrollments/   # Enrollment management
│   │   ├── progress/      # Progress tracking
│   │   ├── payments/      # Payment processing
│   │   ├── documents/     # Document management
│   │   └── exercises/     # Exercise management
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── courses/          # Course-related components
│   ├── dashboard/        # Dashboard components
│   ├── instructor/       # Instructor components
│   └── layout/           # Layout components (Header, Footer)
├── lib/                  # Utility functions and configurations
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # NextAuth configuration
│   ├── stripe.ts         # Stripe configuration
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
├── public/               # Static assets
│   ├── images/
│   └── videos/
├── .env.example          # Environment variables template
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- AWS S3 or Cloudinary account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Karima
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   - Database URL
   - NextAuth secret
   - Stripe keys
   - AWS S3 or Cloudinary credentials
   - Email service credentials

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The platform uses the following main models:

- **User** - User accounts with roles
- **Course** - Course information
- **Lesson** - Individual video lessons
- **Category** - Course categories
- **Enrollment** - User course enrollments
- **Progress** - Lesson completion tracking
- **Payment** - Payment records
- **Document** - File attachments
- **Exercise** - Practice exercises
- **ExerciseSubmission** - Student submissions

See `prisma/schema.prisma` for the complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user

### Courses
- `GET /api/courses` - Get all published courses
- `POST /api/courses` - Create course (instructor only)
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course (instructor only)
- `DELETE /api/courses/[id]` - Delete course (instructor only)

### Enrollments
- `GET /api/enrollments` - Get user's enrolled courses
- `POST /api/enrollments` - Enroll in a course

### Progress
- `GET /api/progress?courseId=xxx` - Get course progress
- `POST /api/progress` - Mark lesson as complete

### Payments
- `POST /api/payments/create-checkout` - Create Stripe checkout
- `POST /api/payments/webhook` - Stripe webhook handler

### Documents
- `GET /api/documents?courseId=xxx` - Get course documents
- `POST /api/documents` - Upload document (instructor only)

### Exercises
- `GET /api/exercises?courseId=xxx` - Get course exercises
- `POST /api/exercises` - Create exercise (instructor only)
- `POST /api/exercises/submit` - Submit exercise answer

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Database schema
- [x] Authentication system
- [x] Basic UI components

### Phase 2: Core Features (In Progress)
- [ ] Course creation and management
- [ ] Video player integration
- [ ] Progress tracking
- [ ] User dashboard

### Phase 3: Payments
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Payment webhooks
- [ ] Access control

### Phase 4: Documents & Exercises
- [ ] Document upload
- [ ] File storage integration
- [ ] Exercise system
- [ ] Submission handling

### Phase 5: Polish & Deploy
- [ ] UI/UX improvements
- [ ] Testing
- [ ] Performance optimization
- [ ] Production deployment

## Deployment

### Recommended Platforms

- **Frontend & API**: Vercel, Railway, or Render
- **Database**: Neon, Supabase, or AWS RDS
- **File Storage**: AWS S3 or Cloudinary
- **CDN**: Cloudflare or AWS CloudFront

### Deployment Steps

1. Set up production database
2. Configure environment variables on hosting platform
3. Deploy to Vercel (recommended):
   ```bash
   npm install -g vercel
   vercel --prod
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@karima.com or open an issue in the repository.

---

Built with ❤️ using Next.js, Prisma, and TypeScript
