import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create categories
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

  console.log('Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`Created ${categories.length} categories`);

  // Create test users
  console.log('Creating test users...');

  const studentPassword = await hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@karima.com' },
    update: {},
    create: {
      email: 'student@karima.com',
      name: 'Test Student',
      password: studentPassword,
      role: 'STUDENT',
      emailVerified: new Date(),
    },
  });
  console.log('Created student user:', student.email);

  const instructorPassword = await hash('instructor123', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@karima.com' },
    update: {},
    create: {
      email: 'instructor@karima.com',
      name: 'Test Instructor',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      emailVerified: new Date(),
    },
  });
  console.log('Created instructor user:', instructor.email);

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
  console.log('Created admin user:', admin.email);

  console.log('\nSeed completed successfully!');
  console.log('\nTest Accounts:');
  console.log('Student: student@karima.com / student123');
  console.log('Instructor: instructor@karima.com / instructor123');
  console.log('Admin: admin@karima.com / admin123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
