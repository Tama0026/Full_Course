import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

interface WrongAnswerData {
  questionId: string;
  questionContent: string;
  options: string[];
  correctAnswerText: string;
  studentAnswerText: string;
}

interface AiGapItem {
  questionId: string;
  errorType: 'MISCONCEPTION' | 'CALCULATION_ERROR' | 'KNOWLEDGE_GAP';
  explanation: string;
  relatedTopics: string[];
}

interface AiGapAnalysisResult {
  items: AiGapItem[];
  overallSummary: string;
  recommendedLessonIds: string[];
}

@Injectable()
export class RemediationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  // ─── Main Entry Point ────────────────────────────────────────────
  async analyzeAttempt(attemptId: string, userId: string): Promise<void> {
    const attempt = await this.prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assessment: {
          include: { questions: true },
        },
      },
    });

    if (!attempt || attempt.userId !== userId) return;
    if (!attempt.answers) return; // No saved answers to analyze

    const parsedAnswers: { questionId: string; answer: string }[] = JSON.parse(
      attempt.answers,
    );

    // ── Step 1: Build wrong-answer data ──
    const wrongAnswers = this.buildWrongAnswerData(
      attempt.assessment.questions.filter((q) => q.setCode === attempt.setCode),
      parsedAnswers,
    );

    if (wrongAnswers.length === 0) return; // All correct → no remediation needed

    const totalQuestions = attempt.assessment.questions.filter(
      (q) => q.setCode === attempt.setCode,
    ).length;
    const scorePercent = attempt.score ?? 0;

    // ── Step 2: AI Gap Analysis ──
    const aiAnalysis = await this.callAiGapAnalysis(
      wrongAnswers,
      attempt.assessment.title,
    );

    // ── Step 3: Determine severity ──
    const wrongPercent = (wrongAnswers.length / totalQuestions) * 100;
    const hasKnowledgeGap = aiAnalysis.items.some(
      (i) => i.errorType === 'KNOWLEDGE_GAP',
    );
    let severity = 'LOW';
    if (wrongPercent >= 75 && hasKnowledgeGap) {
      severity = 'CRITICAL';
    } else if (wrongPercent >= 50) {
      severity = 'MEDIUM';
    }

    // ── Step 4: Build review path (map AI recommendations to real lessons) ──
    const reviewLessons = await this.buildReviewPath(aiAnalysis);

    // ── Step 5: Persist report + path items ──
    const report = await this.prisma.remediationReport.create({
      data: {
        attemptId,
        userId,
        assessmentId: attempt.assessmentId,
        scorePercent,
        totalQuestions,
        wrongCount: wrongAnswers.length,
        aiAnalysis: JSON.stringify(aiAnalysis),
        severity,
        pathItems: {
          create: reviewLessons.map((item, idx) => ({
            lessonId: item.lessonId,
            lessonTitle: item.lessonTitle,
            reason: item.reason,
            priority: reviewLessons.length - idx, // Higher priority first
          })),
        },
      },
    });

    // ── Step 6: Adaptive Flow ──
    if (scorePercent < 50 && severity === 'CRITICAL') {
      await this.applyAdaptiveFlow(userId);
    }

    console.log(
      `[RemediationService] Report ${report.id} created — severity: ${severity}, path items: ${reviewLessons.length}`,
    );
  }

  // ─── Build Wrong Answer Data ─────────────────────────────────────
  private buildWrongAnswerData(
    questions: {
      id: string;
      content: string;
      options: string;
      correctAnswer: number;
    }[],
    answers: { questionId: string; answer: string }[],
  ): WrongAnswerData[] {
    const wrongAnswers: WrongAnswerData[] = [];

    for (const ans of answers) {
      const question = questions.find((q) => q.id === ans.questionId);
      if (!question) continue;

      const options = JSON.parse(question.options || '[]');
      const correctText = options[question.correctAnswer] || '';

      // Compare student answer text with correct answer text
      if (ans.answer !== correctText) {
        wrongAnswers.push({
          questionId: question.id,
          questionContent: question.content,
          options,
          correctAnswerText: correctText,
          studentAnswerText: ans.answer,
        });
      }
    }

    return wrongAnswers;
  }

  // ─── AI Gap Analysis ─────────────────────────────────────────────
  private async callAiGapAnalysis(
    wrongAnswers: WrongAnswerData[],
    assessmentTitle: string,
  ): Promise<AiGapAnalysisResult> {
    // Fetch all available lessons for recommendation
    const allLessons = await this.prisma.lesson.findMany({
      select: { id: true, title: true },
      orderBy: { order: 'asc' },
    });

    const lessonsListText = allLessons
      .map((l) => `- ID: ${l.id} | Title: ${l.title}`)
      .join('\n');

    const wrongAnswersText = wrongAnswers
      .map(
        (wa, i) =>
          `${i + 1}. Câu hỏi: "${wa.questionContent}"\n` +
          `   Các lựa chọn: ${wa.options.join(', ')}\n` +
          `   Đáp án đúng: "${wa.correctAnswerText}"\n` +
          `   Đáp án học viên chọn: "${wa.studentAnswerText}"`,
      )
      .join('\n\n');

    const prompt = `
Bạn là chuyên gia phân tích lỗ hổng kiến thức trong giáo dục.

Bài thi: "${assessmentTitle}"

Danh sách các câu trả lời SAI của học viên:
${wrongAnswersText}

Danh sách tất cả bài học có sẵn trong hệ thống:
${lessonsListText}

Nhiệm vụ:
1. Phân tích LÝ DO SAI cho từng câu hỏi. Phân loại thành:
   - MISCONCEPTION: Hiểu nhầm khái niệm
   - CALCULATION_ERROR: Sai do tính toán hoặc bất cẩn
   - KNOWLEDGE_GAP: Thiếu kiến thức nền tảng
2. Đề xuất các bài học (chọn từ danh sách lesson ID ở trên) mà học viên cần ôn lại.

Trả về DUY NHẤT một JSON object hợp lệ (không markdown, không giải thích thêm) với cấu trúc:
{
  "items": [
    {
      "questionId": "<ID câu hỏi>",
      "errorType": "MISCONCEPTION | CALCULATION_ERROR | KNOWLEDGE_GAP",
      "explanation": "<Giải thích lý do sai bằng tiếng Việt>",
      "relatedTopics": ["<Chủ đề liên quan>"]
    }
  ],
  "overallSummary": "<Tóm tắt tổng quan lỗ hổng kiến thức bằng tiếng Việt>",
  "recommendedLessonIds": ["<lessonId1>", "<lessonId2>"]
}

Lưu ý:
- "recommendedLessonIds" PHẢI chọn từ danh sách lesson ID ở trên.
- Nếu không tìm thấy bài học phù hợp, để mảng rỗng.
- Chỉ trả về JSON, không giải thích gì thêm.
`;

    try {
      const text = await (this.aiService as any).generateWithFallback(prompt);
      const cleaned = text
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();
      const result: AiGapAnalysisResult = JSON.parse(cleaned);

      // Validate structure
      if (!Array.isArray(result.items)) result.items = [];
      if (!Array.isArray(result.recommendedLessonIds))
        result.recommendedLessonIds = [];
      if (!result.overallSummary) result.overallSummary = '';

      return result;
    } catch (error: any) {
      console.error(
        `[RemediationService] AI gap analysis failed:`,
        error?.message?.slice(0, 200),
      );
      // Return a basic analysis without AI
      return {
        items: wrongAnswers.map((wa) => ({
          questionId: wa.questionId,
          errorType: 'KNOWLEDGE_GAP' as const,
          explanation: `Học viên chọn "${wa.studentAnswerText}" thay vì "${wa.correctAnswerText}"`,
          relatedTopics: [],
        })),
        overallSummary:
          'Không thể phân tích chi tiết bằng AI. Hãy ôn lại các bài học liên quan.',
        recommendedLessonIds: [],
      };
    }
  }

  // ─── Build Review Path from AI recommendations ───────────────────
  private async buildReviewPath(
    aiAnalysis: AiGapAnalysisResult,
  ): Promise<{ lessonId: string; lessonTitle: string; reason: string }[]> {
    if (aiAnalysis.recommendedLessonIds.length === 0) return [];

    // Verify that recommended lesson IDs actually exist
    const lessons = await this.prisma.lesson.findMany({
      where: { id: { in: aiAnalysis.recommendedLessonIds } },
      select: { id: true, title: true },
    });

    const lessonMap = new Map(lessons.map((l) => [l.id, l.title]));

    // Build reasons by matching items' relatedTopics
    return lessons.map((lesson) => {
      const relatedItems = aiAnalysis.items.filter((item) =>
        item.relatedTopics.some((topic) =>
          lesson.title.toLowerCase().includes(topic.toLowerCase()),
        ),
      );
      const reason =
        relatedItems.length > 0
          ? relatedItems.map((i) => i.explanation).join('; ')
          : `AI đề xuất ôn lại bài "${lesson.title}" để củng cố kiến thức.`;

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        reason,
      };
    });
  }

  // ─── Adaptive Flow: Lock Enrollments ─────────────────────────────
  private async applyAdaptiveFlow(userId: string): Promise<void> {
    // Lock all active (non-finished) enrollments for this student
    await this.prisma.enrollment.updateMany({
      where: {
        userId,
        isFinished: false,
        status: 'APPROVED',
        isLocked: false,
      },
      data: { isLocked: true },
    });

    console.log(
      `[RemediationService] Locked enrollments for user ${userId} due to critical gap`,
    );
  }

  // ─── Query: Get My Remediation Reports ───────────────────────────
  async getMyRemediations(userId: string) {
    return this.prisma.remediationReport.findMany({
      where: { userId },
      include: { pathItems: { orderBy: { priority: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Mutation: Complete a Review Path Item ───────────────────────
  async completeReviewItem(itemId: string, userId: string) {
    const item = await this.prisma.reviewPathItem.findUnique({
      where: { id: itemId },
      include: { report: true },
    });

    if (!item || item.report.userId !== userId) {
      throw new NotFoundException('Review item not found');
    }

    if (item.isCompleted) return item; // Already done

    // Mark complete
    const updated = await this.prisma.reviewPathItem.update({
      where: { id: itemId },
      data: { isCompleted: true, completedAt: new Date() },
    });

    // Check if all items in this report are now complete
    const remaining = await this.prisma.reviewPathItem.count({
      where: { reportId: item.reportId, isCompleted: false },
    });

    if (remaining === 0) {
      // Resolve the report
      await this.prisma.remediationReport.update({
        where: { id: item.reportId },
        data: { isResolved: true },
      });

      // Check if ALL reports for this user are resolved → unlock enrollments
      const unresolvedCount = await this.prisma.remediationReport.count({
        where: { userId, isResolved: false },
      });

      if (unresolvedCount === 0) {
        await this.prisma.enrollment.updateMany({
          where: { userId, isLocked: true },
          data: { isLocked: false },
        });
        console.log(
          `[RemediationService] All reports resolved — unlocked enrollments for user ${userId}`,
        );
      }
    }

    return updated;
  }
}
