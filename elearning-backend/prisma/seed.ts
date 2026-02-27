import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clear existing data (optional, but good for idempotent seeds)
    await prisma.progress.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.section.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create Users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const instructor = await prisma.user.create({
        data: {
            email: 'instructor@example.com',
            password: hashedPassword,
            role: Role.INSTRUCTOR,
        },
    });

    const student = await prisma.user.create({
        data: {
            email: 'student@example.com',
            password: hashedPassword,
            role: Role.STUDENT,
        },
    });

    console.log('Users created:', { instructor: instructor.email, student: student.email });

    // 2. Create Courses with Sections and Lessons
    // Sample video URLs for demo/testing purposes
    // Mix of direct video files and YouTube URLs (ReactPlayer supports both)
    const sampleVideos = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  // YouTube sample
        'https://www.youtube.com/watch?v=Ke90Tje7VS0',  // YouTube sample
        'https://www.youtube.com/watch?v=9bZkp7q19f0',  // YouTube sample
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
        'https://www.youtube.com/watch?v=LXb3EKWsInQ',  // YouTube sample
        'https://www.youtube.com/watch?v=kJQP7kiw5Fk',  // YouTube sample
    ];

    const courseData = [
        {
            title: 'Lập trình Web Fullstack với Next.js & NestJS',
            description: 'Xây dựng ứng dụng web hoàn chỉnh từ Frontend đến Backend với các framework hiện đại nhất.',
            price: 1299000,
            published: true,
            sections: [
                {
                    title: 'Phần 1: Giới thiệu Next.js',
                    order: 1,
                    lessons: [
                        { title: 'Bài 1: Cài đặt môi trường', videoUrl: sampleVideos[0], order: 1 },
                        { title: 'Bài 2: Routing trong Next.js', videoUrl: sampleVideos[1], order: 2 },
                        { title: 'Bài 3: Server Actions', videoUrl: sampleVideos[2], order: 3 },
                    ]
                },
                {
                    title: 'Phần 2: Backend với NestJS',
                    order: 2,
                    lessons: [
                        { title: 'Bài 4: Khởi tạo project NestJS', videoUrl: sampleVideos[3], order: 1 },
                        { title: 'Bài 5: Modules & Controllers', videoUrl: sampleVideos[4], order: 2 },
                        { title: 'Bài 6: Tích hợp GraphQL', videoUrl: sampleVideos[5], order: 3 },
                    ]
                }
            ]
        },
        {
            title: 'React Native — Xây dựng App Di động Cross-platform',
            description: 'Học cách phát triển ứng dụng iOS và Android cùng lúc với React Native và Expo.',
            price: 999000,
            published: true,
            sections: [
                {
                    title: 'Phần 1: Bắt đầu với React Native',
                    order: 1,
                    lessons: [
                        { title: 'Bài 1: Cài đặt Expo', videoUrl: sampleVideos[6], order: 1 },
                        { title: 'Bài 2: Các component cơ bản', videoUrl: sampleVideos[7], order: 2 },
                        { title: 'Bài 3: Styling trong React Native', videoUrl: sampleVideos[8], order: 3 },
                    ]
                },
                {
                    title: 'Phần 2: Navigation & State',
                    order: 2,
                    lessons: [
                        { title: 'Bài 4: React Navigation', videoUrl: sampleVideos[9], order: 1 },
                        { title: 'Bài 5: Quản lý state với Zustand', videoUrl: sampleVideos[10], order: 2 },
                        { title: 'Bài 6: Fetch API', videoUrl: sampleVideos[11], order: 3 },
                    ]
                }
            ]
        },
        {
            title: 'Machine Learning cơ bản với Python',
            description: 'Bước vào thế giới AI với các thuật toán Machine Learning từ cơ bản đến nâng cao.',
            price: 1499000,
            published: false,
            sections: [
                {
                    title: 'Phần 1: Xử lý dữ liệu',
                    order: 1,
                    lessons: [
                        { title: 'Bài 1: Giới thiệu Pandas', videoUrl: sampleVideos[12], order: 1 },
                        { title: 'Bài 2: Làm sạch dữ liệu', videoUrl: sampleVideos[13], order: 2 },
                        { title: 'Bài 3: Trực quan hóa dữ liệu', videoUrl: sampleVideos[14], order: 3 },
                    ]
                },
                {
                    title: 'Phần 2: Thuật toán cơ bản',
                    order: 2,
                    lessons: [
                        { title: 'Bài 4: Linear Regression', videoUrl: sampleVideos[15], order: 1 },
                        { title: 'Bài 5: Logistic Regression', videoUrl: sampleVideos[16], order: 2 },
                        { title: 'Bài 6: Decision Trees', videoUrl: sampleVideos[17], order: 3 },
                    ]
                }
            ]
        }
    ];

    for (const data of courseData) {
        const course = await prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                published: data.published,
                instructorId: instructor.id,
                sections: {
                    create: data.sections.map(section => ({
                        title: section.title,
                        order: section.order,
                        lessons: {
                            create: section.lessons.map(lesson => ({
                                title: lesson.title,
                                videoUrl: lesson.videoUrl,
                                order: lesson.order,
                            }))
                        }
                    }))
                }
            }
        });
        console.log(`Course created: ${course.title}`);

        // Enroll student in published courses so they can watch videos
        if (data.published) {
            await prisma.order.create({
                data: {
                    userId: student.id,
                    courseId: course.id,
                    status: 'COMPLETED',
                },
            });

            await prisma.enrollment.create({
                data: {
                    userId: student.id,
                    courseId: course.id,
                },
            });
            console.log(`  → Student enrolled in: ${course.title}`);
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
