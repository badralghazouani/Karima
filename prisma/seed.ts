import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. CREATE CATEGORIES
  // ============================================
  console.log('📂 Creating categories...');
  const categories = [
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Mobile Development', slug: 'mobile-development' },
    { name: 'Programming Languages', slug: 'programming-languages' },
    { name: 'Data Science', slug: 'data-science' },
    { name: 'Machine Learning', slug: 'machine-learning' },
    { name: 'Design', slug: 'design' },
    { name: 'Business', slug: 'business' },
    { name: 'Marketing', slug: 'marketing' },
    { name: 'Personal Development', slug: 'personal-development' },
    { name: 'Photography', slug: 'photography' },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories.push(cat);
  }
  console.log(`✅ Created ${categories.length} categories\n`);

  // ============================================
  // 2. CREATE PAYMENT METHODS
  // ============================================
  console.log('💳 Creating payment methods...');
  const paymentMethods = [
    {
      name: 'Stripe',
      type: 'STRIPE',
      description: 'Credit/Debit card payments via Stripe',
      testModeSupported: true,
      requiresWebhook: true,
      isActive: true,
    },
    {
      name: 'Test Payment',
      type: 'TEST',
      description: 'Test payment method for development',
      testModeSupported: true,
      requiresWebhook: false,
      isActive: true,
    },
  ];

  const createdPaymentMethods = [];
  for (const method of paymentMethods) {
    const pm = await prisma.paymentMethod.upsert({
      where: {
        id: (await prisma.paymentMethod.findFirst({ where: { type: method.type as any } }))?.id || 'new-id'
      },
      update: {},
      create: method as any,
    });
    createdPaymentMethods.push(pm);
  }
  console.log(`✅ Created ${paymentMethods.length} payment methods\n`);

  // ============================================
  // 3. CREATE TEST USERS
  // ============================================
  console.log('👥 Creating test users...');

  // Admin User
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@karima.com' },
    update: {},
    create: {
      email: 'admin@karima.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('  ✅ Admin:', admin.email);

  // Instructors
  const instructorPassword = await hash('instructor123', 10);
  const instructor1 = await prisma.user.upsert({
    where: { email: 'john.doe@karima.com' },
    update: {},
    create: {
      email: 'john.doe@karima.com',
      name: 'John Doe',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      emailVerified: new Date(),
    },
  });
  console.log('  ✅ Instructor:', instructor1.email);

  const instructor2 = await prisma.user.upsert({
    where: { email: 'jane.smith@karima.com' },
    update: {},
    create: {
      email: 'jane.smith@karima.com',
      name: 'Jane Smith',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      emailVerified: new Date(),
    },
  });
  console.log('  ✅ Instructor:', instructor2.email);

  const instructor3 = await prisma.user.upsert({
    where: { email: 'maria.garcia@karima.com' },
    update: {},
    create: {
      email: 'maria.garcia@karima.com',
      name: 'Maria Garcia',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      emailVerified: new Date(),
    },
  });
  console.log('  ✅ Instructor:', instructor3.email);

  // Students
  const studentPassword = await hash('student123', 10);
  const students = [];

  const studentData = [
    { email: 'student@karima.com', name: 'Test Student' },
    { email: 'alice.johnson@karima.com', name: 'Alice Johnson' },
    { email: 'bob.williams@karima.com', name: 'Bob Williams' },
    { email: 'carol.brown@karima.com', name: 'Carol Brown' },
    { email: 'david.miller@karima.com', name: 'David Miller' },
  ];

  for (const data of studentData) {
    const student = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        password: studentPassword,
        role: 'STUDENT',
        emailVerified: new Date(),
      },
    });
    students.push(student);
    console.log('  ✅ Student:', student.email);
  }
  console.log('');

  // ============================================
  // 4. CREATE COURSES
  // ============================================
  console.log('📚 Creating courses...');

  // Course 1: Complete Web Development Bootcamp (Paid)
  const course1 = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp',
      slug: 'complete-web-development-bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack web developer.',
      price: 99.99,
      isFree: false,
      isPublished: true,
      level: 'BEGINNER',
      language: 'en',
      instructorId: instructor1.id,
      lessons: {
        create: [
          {
            title: 'Introduction to Web Development',
            description: 'Overview of web development and what you will learn',
            videoUrl: 'https://example.com/videos/web-dev-intro.mp4',
            duration: 600, // 10 minutes
            order: 1,
            isFree: true, // Preview lesson
          },
          {
            title: 'HTML Fundamentals',
            description: 'Learn the basics of HTML structure and elements',
            videoUrl: 'https://example.com/videos/html-basics.mp4',
            duration: 1800,
            order: 2,
            isFree: false,
          },
          {
            title: 'CSS Styling Basics',
            description: 'Introduction to CSS and styling web pages',
            videoUrl: 'https://example.com/videos/css-basics.mp4',
            duration: 2100,
            order: 3,
            isFree: false,
          },
          {
            title: 'JavaScript Essentials',
            description: 'Learn JavaScript fundamentals and DOM manipulation',
            videoUrl: 'https://example.com/videos/js-essentials.mp4',
            duration: 2400,
            order: 4,
            isFree: false,
          },
          {
            title: 'Building Your First Website',
            description: 'Put it all together and build a complete website',
            videoUrl: 'https://example.com/videos/first-website.mp4',
            duration: 3000,
            order: 5,
            isFree: false,
          },
        ],
      },
      categories: {
        create: [
          { categoryId: createdCategories[0].id }, // Web Development
        ],
      },
    },
  });
  console.log('  ✅ Created:', course1.title);

  // Course 2: React for Beginners (Free)
  const course2 = await prisma.course.create({
    data: {
      title: 'React for Beginners',
      slug: 'react-for-beginners',
      description: 'Learn React from scratch. Build modern single-page applications with React hooks and components.',
      price: 0,
      isFree: true,
      isPublished: true,
      level: 'BEGINNER',
      language: 'en',
      instructorId: instructor1.id,
      lessons: {
        create: [
          {
            title: 'What is React?',
            description: 'Introduction to React and its ecosystem',
            videoUrl: 'https://example.com/videos/what-is-react.mp4',
            duration: 480,
            order: 1,
            isFree: true,
          },
          {
            title: 'Setting Up Your Environment',
            description: 'Install Node.js, npm, and create your first React app',
            videoUrl: 'https://example.com/videos/react-setup.mp4',
            duration: 900,
            order: 2,
            isFree: true,
          },
          {
            title: 'Components and Props',
            description: 'Understanding React components and passing props',
            videoUrl: 'https://example.com/videos/components-props.mp4',
            duration: 1200,
            order: 3,
            isFree: true,
          },
        ],
      },
      categories: {
        create: [
          { categoryId: createdCategories[0].id }, // Web Development
        ],
      },
    },
  });
  console.log('  ✅ Created:', course2.title);

  // Course 3: Python Data Science Masterclass (Paid)
  const course3 = await prisma.course.create({
    data: {
      title: 'Python Data Science Masterclass',
      slug: 'python-data-science-masterclass',
      description: 'Master data science with Python. Learn NumPy, Pandas, Matplotlib, and Machine Learning.',
      price: 149.99,
      isFree: false,
      isPublished: true,
      level: 'INTERMEDIATE',
      language: 'en',
      instructorId: instructor2.id,
      lessons: {
        create: [
          {
            title: 'Introduction to Data Science',
            description: 'What is data science and why learn it?',
            videoUrl: 'https://example.com/videos/data-science-intro.mp4',
            duration: 720,
            order: 1,
            isFree: true,
          },
          {
            title: 'Python Basics for Data Science',
            description: 'Python fundamentals you need to know',
            videoUrl: 'https://example.com/videos/python-basics.mp4',
            duration: 1800,
            order: 2,
            isFree: false,
          },
          {
            title: 'NumPy Arrays and Operations',
            description: 'Working with NumPy for numerical computing',
            videoUrl: 'https://example.com/videos/numpy.mp4',
            duration: 2100,
            order: 3,
            isFree: false,
          },
          {
            title: 'Data Analysis with Pandas',
            description: 'Learn to manipulate and analyze data with Pandas',
            videoUrl: 'https://example.com/videos/pandas.mp4',
            duration: 2400,
            order: 4,
            isFree: false,
          },
        ],
      },
      categories: {
        create: [
          { categoryId: createdCategories[3].id }, // Data Science
          { categoryId: createdCategories[2].id }, // Programming Languages
        ],
      },
    },
  });
  console.log('  ✅ Created:', course3.title);

  // Course 4: Mobile App Development with React Native (Paid)
  const course4 = await prisma.course.create({
    data: {
      title: 'Mobile App Development with React Native',
      slug: 'mobile-app-development-react-native',
      description: 'Build iOS and Android apps with React Native. Learn to create beautiful, native mobile applications.',
      price: 129.99,
      isFree: false,
      isPublished: true,
      level: 'INTERMEDIATE',
      language: 'en',
      instructorId: instructor3.id,
      lessons: {
        create: [
          {
            title: 'Introduction to React Native',
            description: 'What is React Native and why use it?',
            videoUrl: 'https://example.com/videos/react-native-intro.mp4',
            duration: 600,
            order: 1,
            isFree: true,
          },
          {
            title: 'Setting Up React Native',
            description: 'Install and configure your development environment',
            videoUrl: 'https://example.com/videos/rn-setup.mp4',
            duration: 1200,
            order: 2,
            isFree: false,
          },
          {
            title: 'Core Components',
            description: 'Learn View, Text, Image, and other core components',
            videoUrl: 'https://example.com/videos/rn-components.mp4',
            duration: 1800,
            order: 3,
            isFree: false,
          },
        ],
      },
      categories: {
        create: [
          { categoryId: createdCategories[1].id }, // Mobile Development
        ],
      },
    },
  });
  console.log('  ✅ Created:', course4.title);

  // Course 5: UI/UX Design Fundamentals (Free)
  const course5 = await prisma.course.create({
    data: {
      title: 'UI/UX Design Fundamentals',
      slug: 'ui-ux-design-fundamentals',
      description: 'Learn the principles of user interface and user experience design. Create beautiful and functional designs.',
      price: 0,
      isFree: true,
      isPublished: true,
      level: 'BEGINNER',
      language: 'en',
      instructorId: instructor2.id,
      lessons: {
        create: [
          {
            title: 'Introduction to UI/UX',
            description: 'Understanding the difference between UI and UX',
            videoUrl: 'https://example.com/videos/ui-ux-intro.mp4',
            duration: 540,
            order: 1,
            isFree: true,
          },
          {
            title: 'Design Principles',
            description: 'Core principles of good design',
            videoUrl: 'https://example.com/videos/design-principles.mp4',
            duration: 900,
            order: 2,
            isFree: true,
          },
        ],
      },
      categories: {
        create: [
          { categoryId: createdCategories[5].id }, // Design
        ],
      },
    },
  });
  console.log('  ✅ Created:', course5.title);

  console.log('');

  // ============================================
  // 5. CREATE ENROLLMENTS
  // ============================================
  console.log('📝 Creating enrollments...');

  // Enroll students in courses
  const enrollments = [
    // Student 1 enrolls in free courses
    { userId: students[0].id, courseId: course2.id },
    { userId: students[0].id, courseId: course5.id },

    // Student 2 enrolls in paid course
    { userId: students[1].id, courseId: course1.id },
    { userId: students[1].id, courseId: course2.id },

    // Student 3 enrolls in multiple courses
    { userId: students[2].id, courseId: course1.id },
    { userId: students[2].id, courseId: course3.id },
    { userId: students[2].id, courseId: course5.id },

    // Student 4
    { userId: students[3].id, courseId: course4.id },
    { userId: students[3].id, courseId: course5.id },
  ];

  for (const enrollment of enrollments) {
    await prisma.enrollment.create({
      data: enrollment,
    });
  }
  console.log(`✅ Created ${enrollments.length} enrollments\n`);

  // ============================================
  // 6. CREATE PAYMENTS
  // ============================================
  console.log('💰 Creating payments...');

  const testPaymentMethod = createdPaymentMethods.find(pm => pm.type === 'TEST');
  const stripePaymentMethod = createdPaymentMethods.find(pm => pm.type === 'STRIPE');

  const payments = [
    // Student 2 paid for course 1
    {
      userId: students[1].id,
      courseId: course1.id,
      amount: 99.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethodId: testPaymentMethod?.id,
      isFake: true,
    },
    // Student 3 paid for courses
    {
      userId: students[2].id,
      courseId: course1.id,
      amount: 99.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethodId: stripePaymentMethod?.id,
      isFake: false,
      stripePaymentId: 'pi_test_' + Math.random().toString(36).substring(7),
    },
    {
      userId: students[2].id,
      courseId: course3.id,
      amount: 149.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethodId: stripePaymentMethod?.id,
      isFake: false,
      stripePaymentId: 'pi_test_' + Math.random().toString(36).substring(7),
    },
    // Student 4 paid
    {
      userId: students[3].id,
      courseId: course4.id,
      amount: 129.99,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethodId: testPaymentMethod?.id,
      isFake: true,
    },
    // Some pending/failed payments
    {
      userId: students[4].id,
      courseId: course1.id,
      amount: 99.99,
      currency: 'USD',
      status: 'PENDING',
      paymentMethodId: stripePaymentMethod?.id,
      isFake: false,
    },
  ];

  for (const payment of payments) {
    await prisma.payment.create({
      data: payment as any,
    });
  }
  console.log(`✅ Created ${payments.length} payments\n`);

  // ============================================
  // 7. CREATE PROGRESS TRACKING
  // ============================================
  console.log('📊 Creating progress records...');

  // Get lessons for progress tracking
  const course1Lessons = await prisma.lesson.findMany({
    where: { courseId: course1.id },
    orderBy: { order: 'asc' },
  });

  const course2Lessons = await prisma.lesson.findMany({
    where: { courseId: course2.id },
    orderBy: { order: 'asc' },
  });

  // Student 1 completed some lessons in course 2
  if (course2Lessons.length > 0) {
    await prisma.progress.create({
      data: {
        userId: students[0].id,
        lessonId: course2Lessons[0].id,
        isCompleted: true,
        watchedAt: new Date(),
      },
    });
    await prisma.progress.create({
      data: {
        userId: students[0].id,
        lessonId: course2Lessons[1].id,
        isCompleted: true,
        watchedAt: new Date(),
      },
    });
  }

  // Student 2 completed first lesson in course 1
  if (course1Lessons.length > 0) {
    await prisma.progress.create({
      data: {
        userId: students[1].id,
        lessonId: course1Lessons[0].id,
        isCompleted: true,
        watchedAt: new Date(),
      },
    });
  }

  console.log('✅ Created progress records\n');

  // ============================================
  // 8. CREATE REVIEWS
  // ============================================
  console.log('⭐ Creating reviews...');

  const reviews = [
    {
      userId: students[1].id,
      courseId: course1.id,
      rating: 5,
      comment: 'Excellent course! Very comprehensive and easy to follow. Highly recommended!',
    },
    {
      userId: students[2].id,
      courseId: course1.id,
      rating: 4,
      comment: 'Great content, but could use more practical examples.',
    },
    {
      userId: students[0].id,
      courseId: course2.id,
      rating: 5,
      comment: 'Perfect for beginners! John explains everything clearly.',
    },
    {
      userId: students[2].id,
      courseId: course3.id,
      rating: 5,
      comment: 'Best data science course I have taken. Jane is an amazing instructor!',
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }
  console.log(`✅ Created ${reviews.length} reviews\n`);

  // ============================================
  // SEED COMPLETE
  // ============================================
  console.log('✅ Seed completed successfully!\n');
  console.log('═══════════════════════════════════════════');
  console.log('📋 TEST ACCOUNTS');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('👑 ADMIN:');
  console.log('   Email: admin@karima.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('👨‍🏫 INSTRUCTORS:');
  console.log('   Email: john.doe@karima.com');
  console.log('   Password: instructor123');
  console.log('   ');
  console.log('   Email: jane.smith@karima.com');
  console.log('   Password: instructor123');
  console.log('   ');
  console.log('   Email: maria.garcia@karima.com');
  console.log('   Password: instructor123');
  console.log('');
  console.log('👨‍🎓 STUDENTS:');
  console.log('   Email: student@karima.com');
  console.log('   Password: student123');
  console.log('   ');
  console.log('   Email: alice.johnson@karima.com');
  console.log('   Password: student123');
  console.log('   ');
  console.log('   Email: bob.williams@karima.com');
  console.log('   Password: student123');
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📊 DATABASE SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log(`✅ ${categories.length} Categories`);
  console.log(`✅ ${paymentMethods.length} Payment Methods`);
  console.log(`✅ 8 Users (1 Admin, 3 Instructors, 5 Students)`);
  console.log(`✅ 5 Courses (2 Free, 3 Paid)`);
  console.log(`✅ 18 Lessons`);
  console.log(`✅ ${enrollments.length} Enrollments`);
  console.log(`✅ ${payments.length} Payments`);
  console.log(`✅ ${reviews.length} Reviews`);
  console.log('✅ Progress tracking records');
  console.log('');
  console.log('═══════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
