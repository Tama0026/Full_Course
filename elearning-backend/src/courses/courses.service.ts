import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CourseRepository } from './course.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { CreateSectionInput } from './dto/create-section.input';
import { CreateLessonInput } from './dto/create-lesson.input';
import { Course as PrismaCourse, Section, Lesson } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
  ) { }

  // ==================== VALIDATION ====================

  /**
   * Validate that all lessons in a course have body content and a quiz.
   * Throws BadRequestException with detailed error listing invalid lessons.
   */
  async validateCourseContent(courseId: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              include: { quiz: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    const allLessons = course.sections.flatMap((s) => s.lessons);

    if (allLessons.length === 0) {
      throw new BadRequestException(
        'Không thể công khai khóa học. Khóa học chưa có bài học nào.',
      );
    }

    const invalidLessons = allLessons.filter(
      (lesson) => !lesson.body || lesson.body.trim() === '' || !lesson.quiz,
    );

    if (invalidLessons.length > 0) {
      const errorDetails = invalidLessons
        .map(
          (l) =>
            `Bài học "${l.title}" thiếu nội dung văn bản (body) hoặc chưa có bài trắc nghiệm (quiz).`,
        )
        .join(' ');
      throw new BadRequestException(
        `Không thể công khai khóa học vì có bài học chưa hoàn thiện nội dung. ${errorDetails}`,
      );
    }
  }

  // ==================== COURSES ====================

  /**
   * Create a new course (Instructor only).
   * If published/isActive is requested, validate content first.
   */
  async createCourse(
    input: CreateCourseInput,
    instructorId: string,
  ): Promise<PrismaCourse> {
    // Block publishing on creation if requested (new course has no lessons)
    if (input.published || (input as any).isActive) {
      throw new BadRequestException(
        'Không thể công khai khóa học khi tạo mới. Vui lòng tạo bài học và quiz trước, sau đó bật công khai.',
      );
    }

    // Auto-generate enrollCode for PRIVATE courses
    let enrollCode: string | undefined;
    if (input.type === 'PRIVATE') {
      enrollCode = await this.generateUniqueEnrollCode(input.category);
    }

    return this.courseRepository.create({
      ...input,
      enrollCode,
      learningOutcomes: input.learningOutcomes
        ? JSON.stringify(input.learningOutcomes)
        : '[]',
      instructorId,
    });
  }

  /**
   * Update an existing course (Instructor + Owner only).
   */
  async updateCourse(
    id: string,
    input: UpdateCourseInput,
  ): Promise<PrismaCourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    // If trying to publish/activate, validate all lessons have content + quiz
    if (input.published === true || input.isActive === true) {
      await this.validateCourseContent(id);
    }

    const updateData: any = { ...input };
    if (input.learningOutcomes !== undefined) {
      updateData.learningOutcomes = JSON.stringify(input.learningOutcomes);
    }

    return this.courseRepository.update(id, updateData);
  }

  /**
   * Delete a course (Instructor + Owner or Admin only).
   */
  async deleteCourse(id: string): Promise<PrismaCourse> {
    const course = await this.courseRepository.findById(id);
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    return this.courseRepository.delete(id);
  }

  /**
   * Get all published courses (Public).
   */
  async getPublishedCourses(): Promise<PrismaCourse[]> {
    return this.courseRepository.findPublished();
  }

  /**
   * Get ALL courses for Admin dashboard (no publish filter).
   * Supports pagination and search.
   */
  async getAllCoursesForAdmin(
    take: number = 12,
    skip: number = 0,
    search?: string,
  ) {
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, email: true } },
          _count: { select: { enrollments: true, sections: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      items,
      totalCount,
      hasMore: skip + items.length < totalCount,
    };
  }

  /**
   * Get a single course by ID with full relations.
   */
  async getCourseById(id: string): Promise<PrismaCourse> {
    const course = await this.courseRepository.findByIdWithRelations(id);
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    return course;
  }

  /**
   * Get all courses by a specific instructor.
   */
  async getMyCourses(instructorId: string): Promise<PrismaCourse[]> {
    return this.courseRepository.findByInstructor(instructorId);
  }

  // ==================== SECTIONS ====================

  /**
   * Create a new section for a course.
   */
  async createSection(input: CreateSectionInput): Promise<Section> {
    return this.prisma.section.create({
      data: {
        title: input.title,
        order: input.order,
        courseId: input.courseId,
      },
      include: { lessons: true },
    });
  }

  /**
   * Delete a section by ID.
   */
  async deleteSection(id: string): Promise<Section> {
    const section = await this.prisma.section.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID "${id}" not found`);
    }
    return this.prisma.section.delete({ where: { id } });
  }

  // ==================== LESSONS ====================

  /**
   * Create a new lesson for a section.
   */
  async createLesson(input: CreateLessonInput): Promise<Lesson> {
    // @ts-ignore
    return this.prisma.lesson.create({
      data: {
        title: input.title,
        type: input.type || 'VIDEO',
        videoUrl: input.videoUrl || null,
        body: input.body || null,
        order: input.order,
        sectionId: input.sectionId,
      },
    });
  }

  /**
   * Delete a lesson by ID.
   */
  async deleteLesson(id: string): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }
    return this.prisma.lesson.delete({ where: { id } });
  }

  /**
   * Generate video takeaways using AI and save to the lesson.
   */
  async generateLessonTakeaways(lessonId: string): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${lessonId}" not found`);
    }

    if (lesson.type !== 'VIDEO') {
      throw new BadRequestException('Chỉ có thể tạo ghi chú cho bài học dạng Video.');
    }

    // Call AI to generate simulating transcript and takeaways
    // @ts-ignore
    const { transcript, keyTakeaways } = await this.prisma.aiService.generateVideoTakeaways(lesson.title);

    // Save to database
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        transcript,
        keyTakeaways
      }
    });
  }

  /**
   * Get a lesson by ID (protected by EnrollmentGuard).
   */
  async getLessonById(id: string): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { section: true },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID "${id}" not found`);
    }
    return lesson;
  }

  /**
   * Toggle isActive status of a course.
   */
  async toggleCourseStatus(id: string): Promise<PrismaCourse> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }

    // If we are about to publish the course (isActive: false -> true)
    if (!course.isActive) {
      await this.validateCourseContent(id);
    }

    return this.prisma.course.update({
      where: { id },
      data: { isActive: !course.isActive },
    });
  }

  /**
   * Aggregate statistics for an instructor, including per-course breakdown.
   */
  async getInstructorStats(instructorId: string): Promise<{
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    avgCompletionRate: number;
    courseBreakdown: {
      courseId: string;
      title: string;
      studentCount: number;
      completionRate: number;
      avgQuizScore: number;
    }[];
  }> {
    // All instructor courses with title
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      select: { id: true, title: true, price: true },
    });
    const totalCourses = courses.length;
    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        totalCourses,
        totalStudents: 0,
        totalRevenue: 0,
        avgCompletionRate: 0,
        courseBreakdown: [],
      };
    }

    // Enrollments per course
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, courseId: true },
    });
    const totalStudents = enrollments.length;

    // Revenue
    const completedOrders = await this.prisma.order.findMany({
      where: { courseId: { in: courseIds }, status: 'COMPLETED' },
      select: { courseId: true },
    });
    const coursePriceMap = new Map(courses.map((c) => [c.id, c.price]));
    const totalRevenue = completedOrders.reduce(
      (sum, o) => sum + (coursePriceMap.get(o.courseId) ?? 0),
      0,
    );

    // Completion rate (global)
    const totalLessons = await this.prisma.lesson.count({
      where: { section: { courseId: { in: courseIds } } },
    });
    const completedLessons = await this.prisma.progress.count({
      where: { enrollment: { courseId: { in: courseIds } } },
    });
    const maxPossible = totalLessons * Math.max(totalStudents, 1);
    const avgCompletionRate =
      maxPossible > 0 ? Math.round((completedLessons / maxPossible) * 100) : 0;

    // --- Per-course breakdown ---
    const courseBreakdown = await Promise.all(
      courses.map(async (course) => {
        const courseEnrollmentIds = enrollments
          .filter((e) => e.courseId === course.id)
          .map((e) => e.id);
        const studentCount = courseEnrollmentIds.length;

        // Completion rate for this course
        const courseLessons = await this.prisma.lesson.count({
          where: { section: { courseId: course.id } },
        });
        const courseCompletedLessons = await this.prisma.progress.count({
          where: { enrollmentId: { in: courseEnrollmentIds } },
        });
        const maxPoss = courseLessons * Math.max(studentCount, 1);
        const completionRate =
          maxPoss > 0
            ? Math.round((courseCompletedLessons / maxPoss) * 100)
            : 0;

        // Average quiz score for this course (from QuizSubmission if exists)
        let avgQuizScore = 0;
        try {
          const submissions = await (
            this.prisma as any
          ).quizSubmission.findMany({
            where: { quiz: { lesson: { section: { courseId: course.id } } } },
            select: { score: true, totalQuestions: true },
          });
          if (submissions.length > 0) {
            const totalScore = submissions.reduce(
              (sum: number, s: any) =>
                sum +
                (s.totalQuestions > 0 ? (s.score / s.totalQuestions) * 100 : 0),
              0,
            );
            avgQuizScore = Math.round(totalScore / submissions.length);
          }
        } catch {
          /* quizSubmission table may not exist */
        }

        return {
          courseId: course.id,
          title: course.title,
          studentCount,
          completionRate,
          avgQuizScore,
        };
      }),
    );

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      avgCompletionRate,
      courseBreakdown,
    };
  }

  async updateCurriculum(courseId: string, input: any) {
    // Run everything in a transaction to prevent partial updates
    return this.prisma.$transaction(async (tx) => {
      const existingSections = await tx.section.findMany({
        where: { courseId },
        include: { lessons: true },
      });

      const incomingSectionIds = input.sections
        .map((s: any) => s.id)
        .filter(Boolean);
      const sectionsToDelete = existingSections.filter(
        (es) => !incomingSectionIds.includes(es.id),
      );

      // Delete removed sections (cascades to lessons)
      if (sectionsToDelete.length > 0) {
        await tx.section.deleteMany({
          where: { id: { in: sectionsToDelete.map((s) => s.id) } },
        });
      }

      // UPSERT sections
      for (let i = 0; i < input.sections.length; i++) {
        const sData = input.sections[i];
        let sectionId = sData.id;

        if (sectionId && existingSections.some((es) => es.id === sectionId)) {
          await tx.section.update({
            where: { id: sectionId },
            data: { title: sData.title, order: i },
          });
        } else {
          const newSection = await tx.section.create({
            data: {
              title: sData.title,
              order: i,
              courseId,
            },
          });
          sectionId = newSection.id;
        }

        // UPSERT lessons inside this section
        const existingLessons =
          existingSections.find((es) => es.id === sectionId)?.lessons || [];
        const incomingLessonIds = sData.lessons
          .map((l: any) => l.id)
          .filter(Boolean);
        const lessonsToDelete = existingLessons.filter(
          (el) => !incomingLessonIds.includes(el.id),
        );

        if (lessonsToDelete.length > 0) {
          await tx.lesson.deleteMany({
            where: { id: { in: lessonsToDelete.map((l) => l.id) } },
          });
        }

        for (let j = 0; j < sData.lessons.length; j++) {
          const lData = sData.lessons[j];
          if (lData.id && existingLessons.some((el) => el.id === lData.id)) {
            await tx.lesson.update({
              where: { id: lData.id },
              data: {
                title: lData.title,
                type: lData.type || 'VIDEO',
                videoUrl: lData.videoUrl,
                body: lData.body,
                duration: lData.duration,
                isPreview: lData.isPreview,
                order: j,
              },
            });
          } else {
            await tx.lesson.create({
              data: {
                title: lData.title,
                type: lData.type || 'VIDEO',
                videoUrl: lData.videoUrl,
                body: lData.body,
                duration: lData.duration,
                isPreview: lData.isPreview,
                order: j,
                sectionId: sectionId,
              },
            });
          }
        }
      }

      // Final step: Recalculate course totalDuration
      const updatedSections = await tx.section.findMany({
        where: { courseId },
        include: { lessons: { select: { duration: true } } },
      });

      let newTotalDuration = 0;
      for (const section of updatedSections) {
        for (const lesson of section.lessons) {
          newTotalDuration += lesson.duration || 0;
        }
      }

      await tx.course.update({
        where: { id: courseId },
        data: { totalDuration: newTotalDuration },
      });

      return tx.course.findUnique({
        where: { id: courseId },
        include: {
          sections: {
            include: { lessons: { orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  // ==================== INSTRUCTOR STUDENT TRACKING ====================

  async getCourseStudents(courseId: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    // Admin also bypasses this in Resolver, but for service let's just make it a soft check
    // The real check is in Resolver relying on RolesGuard or checking roles manually.
    // We will pass instructorId = 'ADMIN' if the user is Admin
    if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
      throw new ForbiddenException(
        'Bạn không phải giảng viên của khóa học này',
      );
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: true,
        progresses: {
          include: {
            lesson: {
              include: { section: true },
            },
          },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    const totalLessons = await this.prisma.lesson.count({
      where: { section: { courseId } },
    });

    return enrollments.map((en) => {
      const progressPercent =
        totalLessons === 0
          ? 0
          : Math.min(
            100,
            Math.round((en.progresses.length / totalLessons) * 100),
          );

      const progressTimeline = en.progresses.map((p) => ({
        lessonTitle: p.lesson.title,
        chapterTitle: p.lesson.section.title,
        completedAt: p.completedAt,
      }));

      // Calculate last active from newest progress
      const lastActive =
        en.progresses.length > 0 ? en.progresses[0].completedAt : undefined;

      return {
        id: en.user.id,
        name: en.user.name || 'Học viên ẩn danh',
        email: en.user.email,
        avatar: en.user.avatar, // Ensure UI handles nulls
        progressPercent,
        lastActive,
        progressTimeline,
        lastRemindedAt: en.lastRemindedAt,
        requestedAt: en.requestedAt,
        enrolledAt: en.enrolledAt,
        status: en.status,
      };
    });
  }

  async approveEnrollment(
    studentId: string,
    courseId: string,
    instructorId: string,
  ): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    });
    if (!course) throw new NotFoundException('Khóa học không tồn tại');
    if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
      throw new ForbiddenException(
        'Bạn không có quyền duyệt học viên khóa học này',
      );
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: studentId, courseId } },
      include: { user: true },
    });

    if (!enrollment)
      throw new NotFoundException('Học viên chưa đăng ký khóa học này');
    if (enrollment.status === 'APPROVED') return true; // Already approved

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'APPROVED', enrolledAt: new Date() },
    });

    // Trigger Notification Notification
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const courseUrl = `${frontendUrl}/courses/${courseId}`;

    await this.emailService.sendEnrollmentApprovedEmail(
      enrollment.user.email,
      enrollment.user.name || 'Học viên',
      course.title,
      courseUrl,
    );

    // In-app notification
    await this.notificationsService.create({
      userId: studentId,
      type: 'ENROLLMENT',
      title: 'Đăng ký được duyệt',
      message: `Bạn đã được duyệt vào khóa học "${course.title}". Hãy bắt đầu học ngay!`,
      link: `/courses/${courseId}`,
    });

    console.log(
      `[NOTIFICATION OUTBOX] Đã gửi thông báo phê duyệt tới: ${enrollment.user.email}`,
    );

    return true;
  }

  async rejectEnrollment(
    studentId: string,
    courseId: string,
    instructorId: string,
  ): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Khóa học không tồn tại');
    if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
      throw new ForbiddenException(
        'Bạn không có quyền từ chối học viên khóa học này',
      );
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: studentId, courseId } },
    });

    if (!enrollment)
      throw new NotFoundException('Học viên chưa đăng ký khóa học này');

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'REJECTED' },
    });

    return true;
  }

  async sendLearningReminder(
    studentId: string,
    courseId: string,
    instructorId: string,
  ): Promise<boolean> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { instructor: true },
    });
    if (!course) throw new NotFoundException('Khóa học không tồn tại');
    if (course.instructorId !== instructorId && instructorId !== 'ADMIN') {
      throw new ForbiddenException(
        'Bạn không có quyền gửi nhắc nhở cho khóa học này',
      );
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: studentId, courseId } },
      include: { user: true },
    });

    if (!enrollment)
      throw new NotFoundException('Học viên chưa đăng ký khóa học này');

    // Removed Rate Limit for testing

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { lastRemindedAt: new Date() },
    });

    const studentName = enrollment.user.name || 'Bạn';
    const instName = course.instructor.name || 'Giảng viên';

    // Trigger Notification Email
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const courseUrl = `${frontendUrl}/courses/${courseId}`;

    await this.emailService.sendLearningReminderEmail(
      enrollment.user.email,
      studentName,
      course.title,
      instName,
      courseUrl,
    );
    console.log(`[EMAIL SEND] Đã gửi nhắc nhở tới: ${enrollment.user.email}`);

    return true;
  }

  // ==================== ENROLL CODE ====================

  /**
   * Generate a unique enroll code like "JS-2026-X8Y".
   */
  async generateUniqueEnrollCode(category?: string): Promise<string> {
    const prefix = category
      ? category
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, 'X')
      : 'CRS';
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I

    for (let attempt = 0; attempt < 20; attempt++) {
      let suffix = '';
      for (let i = 0; i < 4; i++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
      }
      const code = `${prefix}-${year}-${suffix}`;

      const existing = await this.prisma.course.findUnique({
        where: { enrollCode: code },
      });
      if (!existing) return code;
    }

    // Fallback: UUID-based
    return `${prefix}-${year}-${Date.now().toString(36).toUpperCase()}`;
  }

  /**
   * Enroll a student by entering a course code.
   * Case-insensitive: always toUpperCase().
   */
  async enrollByCode(code: string, userId: string) {
    const normalizedCode = code.toUpperCase().trim();

    const course = await this.prisma.course.findUnique({
      where: { enrollCode: normalizedCode },
      select: { id: true, title: true, type: true, maxStudents: true },
    });

    if (!course) {
      throw new NotFoundException(
        'Mã khóa học không hợp lệ hoặc không tồn tại.',
      );
    }

    // Check if already enrolled
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    if (existing) {
      throw new BadRequestException('Bạn đã đăng ký khóa học này rồi.');
    }

    // Check max students
    if (course.maxStudents) {
      const count = await this.prisma.enrollment.count({
        where: { courseId: course.id },
      });
      if (count >= course.maxStudents) {
        throw new BadRequestException('Khóa học đã đầy.');
      }
    }

    // Auto-approve for code-based enrollment
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        courseId: course.id,
        status: 'APPROVED',
        enrolledAt: new Date(),
      },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, email: true, name: true } },
            sections: {
              include: { lessons: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return enrollment;
  }

  // ==================== DISCOVERY ====================

  /**
   * Get courses for the Explore/Discovery page.
   * PRIVATE courses have their sections/lessons stripped for security.
   */
  async getDiscoveryCourses(
    search?: string,
    category?: string,
    take: number = 12,
    skip: number = 0,
    minRating?: number,
    priceMin?: number,
    priceMax?: number,
    sortBy?: string,
  ) {
    const where: any = {
      published: true,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minRating !== undefined && minRating > 0) {
      where.averageRating = { gte: minRating };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // default: newest
    switch (sortBy) {
      case 'highest_rated':
        orderBy = { averageRating: 'desc' };
        break;
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'most_popular':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [courses, totalCount] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, email: true, name: true } },
          sections: {
            include: {
              lessons: {
                select: { id: true, title: true, order: true, duration: true },
              },
            },
            orderBy: { order: 'asc' },
          },
          _count: { select: { enrollments: true } },
        },
        orderBy,
        take,
        skip,
      }),
      this.prisma.course.count({ where }),
    ]);

    // Strip lesson details for PRIVATE courses (API-level security)
    const items = courses.map((course) => {
      if (course.type === 'PRIVATE') {
        return {
          ...course,
          sections: [], // Hide all content for PRIVATE courses
        };
      }
      return course;
    });

    return {
      items,
      totalCount,
      hasMore: skip + items.length < totalCount,
    };
  }
}
