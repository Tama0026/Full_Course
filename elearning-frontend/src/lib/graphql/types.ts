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
    isActive?: boolean;
    thumbnail?: string;
    category?: string;
    learningOutcomes?: string[];
    averageRating: number;
    reviewCount: number;
    totalDuration: number;
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
    requestedAt: string;
    enrolledAt?: string;
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

export interface Review {
    id: string;
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
    user?: User;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewSummary {
    totalCount: number;
    averageRating: number;
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
    reviews: Review[];
}
