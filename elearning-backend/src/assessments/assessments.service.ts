import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
    constructor(private prisma: PrismaService) { }

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

    async createAssessment(userId: string, data: { title: string; description: string; timeLimit: number; passingScore: number; isActive: boolean }) {
        return this.prisma.assessment.create({
            data: {
                ...data,
                creatorId: userId,
            },
        });
    }

    async updateAssessment(id: string, creatorId: string, data: Partial<{ title: string; description: string; timeLimit: number; passingScore: number; isActive: boolean }>) {
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

    async createQuestion(assessmentId: string, creatorId: string, data: Record<string, unknown>) {
        const assessment = await this.prisma.assessment.findUnique({
            where: { id: assessmentId },
        });
        if (!assessment || assessment.creatorId !== creatorId)
            throw new NotFoundException();

        return this.prisma.assessmentQuestion.create({
            data: {
                ...data,
                assessmentId,
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
        });
        if (!assessment)
            throw new NotFoundException('Assessment not found or inactive');

        return this.prisma.assessmentAttempt.create({
            data: {
                userId,
                assessmentId,
            },
        });
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
            const questions = attempt.assessment.questions;
            let correctCount = 0;
            for (const ans of answers) {
                const q = questions.find((q: { id: string; correctAnswer: number }) => q.id === ans.questionId);
                if (q && q.correctAnswer.toString() === ans.answer) {
                    correctCount++;
                }
            }
            score =
                questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
        }

        const passed = !isInvalid && score >= attempt.assessment.passingScore;

        return this.prisma.assessmentAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: now,
                score,
                passed,
                isInvalid,
            },
        });
    }
}
