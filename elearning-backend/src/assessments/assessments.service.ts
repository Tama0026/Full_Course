import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RemediationService } from '../remediation/remediation.service';

@Injectable()
export class AssessmentsService {
  // Cache to store the shuffled correct options mapping per attempt
  private attemptCache = new Map<
    string,
    { questions: any[]; correctMap: Record<string, string> }
  >();

  constructor(
    private prisma: PrismaService,
    private remediationService: RemediationService,
  ) { }

  async getAssessments(userRole: string, userId: string) {
    if (userRole === 'INSTRUCTOR' || userRole === 'ADMIN') {
      return this.prisma.assessment.findMany({
        where: userRole === 'INSTRUCTOR' ? { creatorId: userId } : {},
        include: {
          questions: { orderBy: { createdAt: 'asc' } },
          attempts: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.assessment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssessment(id: string) {
    return this.prisma.assessment.findUnique({
      where: { id },
      include: { questions: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async createAssessment(
    userId: string,
    data: {
      title: string;
      description: string;
      timeLimit: number;
      passingScore: number;
      numberOfSets: number;
      isActive: boolean;
    },
  ) {
    return this.prisma.assessment.create({
      data: {
        ...data,
        creatorId: userId,
      },
    });
  }

  async updateAssessment(
    id: string,
    creatorId: string,
    data: Partial<{
      title: string;
      description: string;
      timeLimit: number;
      passingScore: number;
      numberOfSets: number;
      isActive: boolean;
    }>,
  ) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();

    return this.prisma.assessment.update({
      where: { id },
      data,
    });
  }

  async deleteAssessment(id: string, creatorId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();

    return this.prisma.assessment.delete({ where: { id } });
  }

  async createQuestion(
    assessmentId: string,
    creatorId: string,
    data: {
      setCode: string;
      prompt: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      order: number;
    },
  ) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();

    return this.prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        setCode: data.setCode,
        content: data.prompt,
        options: JSON.stringify(data.options),
        correctAnswer: parseInt(data.correctAnswer) || 0,
      },
    });
  }

  async deleteQuestion(id: string, creatorId: string) {
    const question = await this.prisma.assessmentQuestion.findUnique({
      where: { id },
      include: { assessment: true },
    });
    if (!question || question.assessment.creatorId !== creatorId)
      throw new NotFoundException();

    return this.prisma.assessmentQuestion.delete({ where: { id } });
  }

  async startAttempt(assessmentId: string, userId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId, isActive: true },
      include: { questions: true },
    });
    if (!assessment)
      throw new NotFoundException('Assessment not found or inactive');

    // ---- Attempt limit guard ----
    const existingAttempts = await this.prisma.assessmentAttempt.count({
      where: { assessmentId, userId },
    });
    if (existingAttempts >= assessment.maxAttempts) {
      throw new ForbiddenException(
        `Bạn đã sử dụng hết ${assessment.maxAttempts} lượt thi cho bài này.`,
      );
    }

    // Filter questions by distinct setCodes
    const setCodes = [...new Set(assessment.questions.map((q) => q.setCode))];
    const pickedSetCode =
      setCodes.length > 0
        ? setCodes[Math.floor(Math.random() * setCodes.length)]
        : 'SET_1';

    const setQuestions = assessment.questions.filter(
      (q) => q.setCode === pickedSetCode,
    );

    // Shuffle questions
    const shuffledQuestions = [...setQuestions].sort(() => Math.random() - 0.5);
    const correctMap: Record<string, string> = {};

    const clientQuestions = shuffledQuestions.map((q) => {
      const options = JSON.parse(q.options || '[]');
      const correctText = options[q.correctAnswer];
      correctMap[q.id] = correctText; // map by text

      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

      return {
        id: q.id,
        prompt: q.content,
        options: shuffledOptions,
      };
    });

    const attempt = await this.prisma.assessmentAttempt.create({
      data: {
        userId,
        assessmentId,
        setCode: pickedSetCode,
      },
    });

    this.attemptCache.set(attempt.id, {
      questions: clientQuestions,
      correctMap,
    });

    return {
      ...attempt,
      questions: clientQuestions,
    };
  }

  async submitAttempt(
    attemptId: string,
    userId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: { assessment: { include: { questions: true } } },
    });

    if (!attempt || attempt.userId !== userId) throw new NotFoundException();
    if (attempt.completedAt)
      throw new BadRequestException('Attempt already submitted');

    const now = new Date();
    const durationSec = (now.getTime() - attempt.startedAt.getTime()) / 1000;

    // 30s grace period for network latency
    const isInvalid = durationSec > attempt.assessment.timeLimit * 60 + 30;

    let score = 0;
    if (!isInvalid) {
      const cached = this.attemptCache.get(attemptId);
      if (cached) {
        let correctCount = 0;
        for (const ans of answers) {
          if (cached.correctMap[ans.questionId] === ans.answer) {
            correctCount++;
          }
        }
        score =
          cached.questions.length > 0
            ? (correctCount / cached.questions.length) * 100
            : 0;
      } else {
        // Fallback robust logic
        const questions = attempt.assessment.questions.filter(
          (q) => q.setCode === attempt.setCode,
        );
        let correctCount = 0;
        for (const ans of answers) {
          const q = questions.find(
            (q: { id: string; correctAnswer: number; options: string }) =>
              q.id === ans.questionId,
          );
          if (q) {
            const opts = JSON.parse(q.options || '[]');
            if (opts[q.correctAnswer] === ans.answer) {
              correctCount++;
            }
          }
        }
        score =
          questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
      }
    }

    if (this.attemptCache.has(attemptId)) {
      this.attemptCache.delete(attemptId);
    }

    const passed = !isInvalid && score >= attempt.assessment.passingScore;

    const updatedAttempt = await this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt: now,
        score,
        passed,
        isInvalid,
        status: 'COMPLETED',
        answers: JSON.stringify(answers),
      },
    });

    // Fire-and-forget: AI gap analysis & remediation path generation
    this.remediationService
      .analyzeAttempt(attemptId, userId)
      .catch((err) =>
        console.error('[AssessmentsService] Remediation analysis failed:', err?.message),
      );

    return updatedAttempt;
  }

  // ============ VIOLATION TRACKING ============

  async getAttemptForSocket(attemptId: string, userId: string) {
    return this.prisma.assessmentAttempt.findFirst({
      where: {
        id: attemptId,
        userId,
        status: 'IN_PROGRESS',
      },
      include: {
        assessment: { select: { maxViolations: true } },
      },
    });
  }

  async logViolation(attemptId: string, type: string) {
    // Atomically increment violation count
    const attempt = await this.prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        violationCount: { increment: 1 },
      },
      include: {
        assessment: { select: { maxViolations: true } },
      },
    });

    // Insert audit record
    await this.prisma.violationRecord.create({
      data: { attemptId, type },
    });

    const maxV = attempt.assessment.maxViolations;
    const voided = attempt.violationCount >= maxV;

    if (voided) {
      // Auto-void the attempt
      await this.prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'VOIDED',
          isInvalid: true,
          completedAt: new Date(),
        },
      });
    }

    return {
      violationCount: attempt.violationCount,
      maxViolations: maxV,
      remaining: Math.max(0, maxV - attempt.violationCount),
      voided,
    };
  }

  // ============ REPORTING ============

  async getAttemptHistory(assessmentId: string, userId: string) {
    return this.prisma.assessmentAttempt.findMany({
      where: { assessmentId, userId },
      orderBy: { startedAt: 'desc' },
      include: {
        assessment: {
          select: { title: true, passingScore: true, maxAttempts: true },
        },
      },
    });
  }

  async getAssessmentReport(assessmentId: string, creatorId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();

    const attempts = await this.prisma.assessmentAttempt.findMany({
      where: { assessmentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        violations: { orderBy: { timestamp: 'asc' } },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Compute summary stats
    const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');
    const scores = completedAttempts.map((a) => a.score || 0);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
        : 0;
    const passRate =
      completedAttempts.length > 0
        ? Math.round(
          (completedAttempts.filter((a) => a.passed).length /
            completedAttempts.length) *
          100,
        )
        : 0;
    const voidedCount = attempts.filter((a) => a.status === 'VOIDED').length;

    return {
      assessment,
      totalAttempts: attempts.length,
      avgScore,
      passRate,
      voidedCount,
      attempts: attempts.map((a: any) => ({
        id: a.id,
        userId: a.userId,
        userName: a.user?.name || 'N/A',
        userEmail: a.user?.email || '',
        setCode: a.setCode,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        score: a.score,
        passed: a.passed,
        isInvalid: a.isInvalid,
        violationCount: a.violationCount,
        status: a.status,
      })),
    };
  }
}
