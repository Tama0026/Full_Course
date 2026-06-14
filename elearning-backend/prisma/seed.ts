import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with only 3 accounts...');

    // Clear existing data to avoid foreign key errors or duplicates
    await (prisma as any).userBadge.deleteMany();
    await (prisma as any).badge.deleteMany();
    await prisma.progress.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.section.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('Admin@123', 10);

    // 1. Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@elearning.com',
            password: adminPassword,
            name: 'System Admin',
            role: Role.ADMIN,
        },
    });

    // 2. Create Instructor
    const instructor = await prisma.user.create({
        data: {
            email: 'instructor@example.com',
            password: hashedPassword,
            name: 'Nguyễn Văn A (Giảng viên)',
            role: Role.INSTRUCTOR,
        },
    });

    // 3. Create Student
    const student = await prisma.user.create({
        data: {
            email: 'student@example.com',
            password: hashedPassword,
            name: 'Trần Thị B (Học viên)',
            role: Role.STUDENT,
        },
    });

    console.log('Seeding completed! Created accounts:', {
        admin: admin.email,
        instructor: instructor.email,
        student: student.email,
    });
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
