import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RemediationService } from '../remediation/remediation.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AssessmentsService {
  // Cache to store the shuffled correct options mapping per attempt
  private attemptCache = new Map<
    string,
    {
      questions: any[];
      correctMap: Record<string, string>;
      currentAnswers?: { questionId: string; answer: string; rawIdx: string }[];
    }
  >();

  constructor(
    private prisma: PrismaService,
    private remediationService: RemediationService,
    private aiService: AiService,
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
      type: 'MARKETPLACE' | 'PRIVATE';
      isActive: boolean;
      maxAttempts?: number;
      maxViolations?: number;
      totalPoints?: number;
    },
  ) {
    let enrollCode: string | undefined;
    if (data.type === 'PRIVATE') {
      enrollCode = await this.generateUniqueEnrollCode();
    }

    return this.prisma.assessment.create({
      data: {
        ...data,
        enrollCode,
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
      maxAttempts: number;
      maxViolations: number;
      totalPoints: number;
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

  async generateUniqueEnrollCode(): Promise<string> {
    const prefix = 'EXAM';
    const year = new Date().getFullYear();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    for (let attempt = 0; attempt < 20; attempt++) {
      let suffix = '';
      for (let i = 0; i < 4; i++) {
        suffix += chars[Math.floor(Math.random() * chars.length)];
      }
      const code = `${prefix}-${year}-${suffix}`;

      const existing = await this.prisma.assessment.findUnique({
        where: { enrollCode: code },
      });

      if (!existing) {
        return code;
      }
    }
    throw new BadRequestException('Không thể tạo mã ghi danh duy nhất lúc này');
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
      points?: number;
      difficulty?: string;
    },
  ) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();
    if (assessment.isPublished)
      throw new ForbiddenException(
        'Bài thi đã được công bố. Không thể thêm câu hỏi.',
      );

    return this.prisma.assessmentQuestion.create({
      data: {
        assessmentId,
        setCode: data.setCode,
        content: data.prompt,
        options: JSON.stringify(data.options),
        correctAnswer: parseInt(data.correctAnswer) || 0,
        points: data.points || 1,
        difficulty: data.difficulty || 'MEDIUM',
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
    if (question.assessment.isPublished)
      throw new ForbiddenException(
        'Bài thi đã được công bố. Không thể xoá câu hỏi.',
      );

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
        console.error(
          '[AssessmentsService] Remediation analysis failed:',
          err?.message,
        ),
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
      // Calculate score based on cached answers
      let score = 0;
      let finalAnswersStr = '[]';
      const cached = this.attemptCache.get(attemptId);

      if (cached && cached.currentAnswers) {
        let correctCount = 0;
        for (const ans of cached.currentAnswers) {
          if (cached.correctMap[ans.questionId] === ans.answer) {
            correctCount++;
          }
        }
        score =
          cached.questions.length > 0
            ? (correctCount / cached.questions.length) * 100
            : 0;

        finalAnswersStr = JSON.stringify(
          cached.currentAnswers.map((a) => ({
            questionId: a.questionId,
            answer: a.rawIdx,
          })),
        );
      }

      // Auto-void the attempt but save the score
      await this.prisma.assessmentAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'VOIDED',
          isInvalid: true,
          completedAt: new Date(),
          score,
          answers: finalAnswersStr,
        },
      });

      // Clear cache
      if (this.attemptCache.has(attemptId)) {
        this.attemptCache.delete(attemptId);
      }
    }

    return {
      violationCount: attempt.violationCount,
      maxViolations: maxV,
      remaining: Math.max(0, maxV - attempt.violationCount),
      voided,
    };
  }

  async cacheAnswers(
    attemptId: string,
    userId: string,
    answers: Record<string, string>,
  ) {
    const cached = this.attemptCache.get(attemptId);
    if (!cached) return;

    // Convert Record<string, string> to array format for storage
    const answersArray = Object.entries(answers).map(([questionId, ansStr]) => {
      const q = cached.questions.find((q) => q.id === questionId);
      const answerIdx = parseInt(ansStr as string, 10);
      const answerText = q ? q.options[answerIdx] : '';
      return { questionId, answer: answerText, rawIdx: ansStr };
    });

    // Store in cache temporarily (or db if you want durability)
    this.attemptCache.set(attemptId, {
      ...cached,
      currentAnswers: answersArray,
    });
  }

  async getAttemptById(attemptId: string) {
    return this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, status: true },
    });
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
        violations: { orderBy: { timestamp: 'asc' } },
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
        userName: a.user?.name || a.user?.email?.split('@')[0] || 'N/A',
        userEmail: a.user?.email || '',
        setCode: a.setCode,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
        score: a.score,
        passed: a.passed,
        isInvalid: a.isInvalid,
        violationCount: a.violationCount,
        status: a.status,
        violations: a.violations || [],
      })),
    };
  }

  // ============ POINT ALLOCATION ============

  /**
   * Normalize points for all questions based on difficulty weights.
   * EASY=1x, MEDIUM=2x, HARD=3x. Remainder goes to hardest question.
   */
  normalizePoints(
    questions: { id: string; difficulty: string }[],
    totalPoints: number,
  ): { id: string; points: number }[] {
    const WEIGHT: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
    const weightedSum = questions.reduce(
      (sum, q) => sum + (WEIGHT[q.difficulty] || 2),
      0,
    );
    if (weightedSum === 0)
      return questions.map((q) => ({ id: q.id, points: 0 }));

    const basePoint = totalPoints / weightedSum;
    const result = questions.map((q) => ({
      id: q.id,
      points: parseFloat((basePoint * (WEIGHT[q.difficulty] || 2)).toFixed(2)),
    }));

    // Remainder correction: add diff to the hardest question
    const currentSum = result.reduce((s, r) => s + r.points, 0);
    const diff = parseFloat((totalPoints - currentSum).toFixed(2));
    if (diff !== 0) {
      // Find the hardest question (highest weight)
      let hardestIdx = 0;
      let maxWeight = 0;
      questions.forEach((q, i) => {
        const w = WEIGHT[q.difficulty] || 2;
        if (w > maxWeight) {
          maxWeight = w;
          hardestIdx = i;
        }
      });
      result[hardestIdx].points = parseFloat(
        (result[hardestIdx].points + diff).toFixed(2),
      );
    }

    return result;
  }

  /**
   * Auto-balance points for all questions in an assessment.
   */
  async autoBalancePoints(assessmentId: string, creatorId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();
    if (assessment.isPublished)
      throw new ForbiddenException('Bài thi đã công bố.');
    if (assessment.questions.length === 0)
      throw new BadRequestException('Chưa có câu hỏi nào.');

    // Group questions by setCode
    const questionsBySet = assessment.questions.reduce(
      (acc, q) => {
        if (!acc[q.setCode]) acc[q.setCode] = [];
        acc[q.setCode].push(q);
        return acc;
      },
      {} as Record<string, typeof assessment.questions>,
    );

    const updates: any[] = [];

    for (const setCode of Object.keys(questionsBySet)) {
      const setQuestions = questionsBySet[setCode];
      const normalized = this.normalizePoints(
        setQuestions.map((q) => ({ id: q.id, difficulty: q.difficulty })),
        assessment.totalPoints,
      );

      for (const n of normalized) {
        updates.push(
          this.prisma.assessmentQuestion.update({
            where: { id: n.id },
            data: { points: n.points },
          }),
        );
      }
    }

    // Update each question's points using Prisma.$transaction
    await this.prisma.$transaction(updates);

    return this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { orderBy: { createdAt: 'asc' } } },
    });
  }

  // ============ PUBLISH / LOCK ============

  async publishAssessment(assessmentId: string, creatorId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();
    if (assessment.isPublished)
      throw new BadRequestException('Bài thi đã được công bố.');
    if (assessment.questions.length === 0)
      throw new BadRequestException('Cần ít nhất 1 câu hỏi.');

    // Group questions by setCode
    const questionsBySet = assessment.questions.reduce(
      (acc, q) => {
        if (!acc[q.setCode]) acc[q.setCode] = [];
        acc[q.setCode].push(q);
        return acc;
      },
      {} as Record<string, typeof assessment.questions>,
    );

    for (const [setCode, setQuestions] of Object.entries(questionsBySet)) {
      const pointsSum = setQuestions.reduce((s, q) => s + q.points, 0);
      const diff = Math.abs(pointsSum - assessment.totalPoints);

      if (diff > 0.01) {
        throw new BadRequestException(
          `Tổng điểm của Mã đề ${setCode} (${pointsSum}) không khớp totalPoints (${assessment.totalPoints}). Vui lòng chạy Auto-balance trước.`,
        );
      }
    }

    return this.prisma.assessment.update({
      where: { id: assessmentId },
      data: { isPublished: true },
      include: { questions: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async unpublishAssessment(assessmentId: string, creatorId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();

    return this.prisma.assessment.update({
      where: { id: assessmentId },
      data: { isPublished: false },
    });
  }

  // ============ INLINE EDIT (DRAFT ONLY) ============

  async updateQuestionInline(
    questionId: string,
    creatorId: string,
    data: { points?: number; correctAnswer?: number; difficulty?: string },
  ) {
    const question = await this.prisma.assessmentQuestion.findUnique({
      where: { id: questionId },
      include: { assessment: true },
    });
    if (!question || question.assessment.creatorId !== creatorId)
      throw new NotFoundException();
    if (question.assessment.isPublished)
      throw new ForbiddenException('Bài thi đã công bố. Không thể chỉnh sửa.');

    return this.prisma.assessmentQuestion.update({
      where: { id: questionId },
      data: {
        ...(data.points !== undefined && { points: data.points }),
        ...(data.correctAnswer !== undefined && {
          correctAnswer: data.correctAnswer,
        }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
      },
    });
  }

  // ============ AI EXAM GENERATION ============

  async generateAiExamQuestions(
    assessmentId: string,
    creatorId: string,
    bankId: string | null,
    questionCount: number,
    setCode: string = 'SET_1',
  ) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment || assessment.creatorId !== creatorId)
      throw new NotFoundException();
    if (assessment.isPublished)
      throw new ForbiddenException('Bài thi đã công bố.');

    // Retrieve bank questions as context (if bankId provided)
    let bankContext = '';
    if (bankId) {
      const bank = await this.prisma.questionBank.findUnique({
        where: { id: bankId },
        include: { questions: true },
      });
      if (bank && bank.questions.length > 0) {
        bankContext = bank.questions
          .slice(0, 30) // Limit context to avoid token overflow
          .map(
            (q, i) =>
              `${i + 1}. [${q.difficulty}] ${q.content} | Options: ${q.options} | Answer: ${q.correctAnswer}`,
          )
          .join('\n');
      }
    }

    // Call AI to generate questions
    const aiQuestions = await this.aiService.generateExamFromBank(
      assessment.title,
      assessment.description,
      bankContext,
      questionCount,
      assessment.totalPoints,
    );

    // Normalize points with difficulty weights
    const normalized = this.normalizePoints(
      aiQuestions.map((q: any, i: number) => ({
        id: `temp-${i}`,
        difficulty: q.difficulty || 'MEDIUM',
      })),
      assessment.totalPoints,
    );

    // Save to database
    const created = [];
    for (let i = 0; i < aiQuestions.length; i++) {
      const q = aiQuestions[i];
      const record = await this.prisma.assessmentQuestion.create({
        data: {
          assessmentId,
          setCode,
          content: q.content,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          points: normalized[i].points,
          difficulty: q.difficulty || 'MEDIUM',
          isAiGenerated: true,
        },
      });
      created.push(record);
    }

    return this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
