export interface User {
    id: string;
    email: string;
    name?: string;
    headline?: string;
    bio?: string;
    avatar?: string;
    aiRank?: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    createdAt: string;
    updatedAt: string;
}

export interface Certificate {
    id: string;
    certificateCode: string;
    userId: string;
    courseId: string;
    userName?: string;
    courseName?: string;
    courseNameAtIssue?: string;
    certificateUrl?: string;
    issueDate: string;
    createdAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface Question {
    id: string;
    quizId: string;
    content: string;
    options: string;
    correctAnswer?: number; // Only returned to admins/instructors
}

export interface Quiz {
    id: string;
    lessonId: string;
    questions: Question[];
}

export interface Lesson {
    id: string;
    title: string;
    type?: string;
    videoUrl?: string;
    body?: string;
    order: number;
    sectionId: string;
    quiz?: Quiz;
    isLocked?: boolean;
    isPreview?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Section {
    id: string;
    title: string;
    order: number;
    courseId: string;
    lessons?: Lesson[];
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    published: boolean;
    instructorId: string;
    instructor?: User;
    sections?: Section[];
    createdAt: string;
    updatedAt: string;
}

export interface Progress {
    id: string;
    lessonId: string;
    enrollmentId: string;
    completedAt: string;
    lesson?: Lesson;
}

export interface Enrollment {
    id: string;
    courseId: string;
    userId: string;
    enrolledAt: string;
    course?: Course;
    user?: User;
}

export interface CourseProgress {
    completedItems: Progress[];
    completedLessons: number;
    enrollment: Enrollment;
    progressPercentage: number;
    totalLessons: number;
}
