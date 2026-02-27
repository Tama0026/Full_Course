"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const genai_1 = require("@google/genai");
let AiService = class AiService {
    prisma;
    ai;
    MODELS = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-2.5-flash',
    ];
    constructor(prisma) {
        this.prisma = prisma;
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is missing in environment variables. AI features will not work.');
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
    }
    async generateWithFallback(prompt) {
        let lastError;
        for (const model of this.MODELS) {
            try {
                console.log(`[AiService] Trying model: ${model}`);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 25_000));
                const response = await Promise.race([
                    this.ai.models.generateContent({ model, contents: prompt }),
                    timeoutPromise,
                ]);
                console.log(`[AiService] ✅ Model ${model} succeeded`);
                return response.text || '';
            }
            catch (err) {
                const status = err?.status || (err?.message?.includes('429') ? 429 : 0);
                lastError = err;
                if (status === 429) {
                    console.warn(`[AiService] ⚠️ Model ${model} rate limited (429), trying next...`);
                    continue;
                }
                throw err;
            }
        }
        throw lastError;
    }
    async searchCourses(query) {
        if (!process.env.GEMINI_API_KEY) {
            return "Tính năng AI đang tạm thời bị vô hiệu hóa vì không tìm thấy API Key hợp lệ trong hệ thống.";
        }
        try {
            const courses = await this.prisma.course.findMany({
                where: { published: true, isActive: true },
                select: { id: true, title: true, description: true, price: true }
            });
            const catalogText = JSON.stringify(courses);
            const prompt = `
You are a helpful e-learning assistant for a course platform.
A user asked: "${query}"

Here is the JSON catalog of available courses:
${catalogText}

Task:
Recommend 1-3 courses from this catalog that best match their inquiry. 
Format the response nicely in Markdown.
Don't invent details. If no course matches well, polite tell them so.
            `;
            console.log(`[AiService] Calling Gemini for course search — query: "${query}"`);
            const text = await this.generateWithFallback(prompt);
            console.log(`[AiService] Gemini search done — ${text.length} chars`);
            return text || "Xin lỗi, hiện không có môn học nào phù hợp.";
        }
        catch (error) {
            const status = error?.status || error?.code;
            const msg = error?.message || '';
            console.error(`[AiService] searchCourses error — status: ${status}`, msg.slice(0, 200));
            if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT: Tất cả AI model đều đang bị giới hạn. Vui lòng chờ vài phút rồi thử lại.');
            }
            throw new common_1.InternalServerErrorException('AI suggestion failed');
        }
    }
    async generateLessonContent(title) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại trong hệ thống. Vui lòng cấu hình file .env");
        }
        const prompt = `
You are an expert instructor. Write a comprehensive lesson document (in Vietnamese) for a topic titled: "${title}".

Requirements:
- Use Markdown formatting.
- Include a brief introduction.
- Provide clear, structured main points with H2/H3 headers.
- If applicable, add a small code snippet or practical example.
- Conclude with a short summary.
        `;
        try {
            console.log(`[AiService] Generating lesson content — title: "${title}" @ ${new Date().toISOString()}`);
            const text = await this.generateWithFallback(prompt);
            const result = text || "Nội dung đang được cập nhật.";
            console.log(`[AiService] Lesson content done — ${result.length} chars, finished @ ${new Date().toISOString()}`);
            return result;
        }
        catch (error) {
            const status = error?.status || error?.code;
            const msg = error?.message || '';
            console.error(`[AiService] generateLessonContent error — status: ${status}`, msg.slice(0, 200));
            if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT_429: Tất cả AI model đều đang bị giới hạn. Vui lòng chờ vài phút rồi thử lại.');
            }
            throw new common_1.InternalServerErrorException(`Content generation failed: ${msg.slice(0, 100) || 'unknown'}`);
        }
    }
    async assessSkill(userId) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại.");
        }
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        sections: {
                            select: {
                                title: true,
                                order: true,
                                lessons: {
                                    select: { title: true, type: true, body: true, order: true },
                                    orderBy: { order: 'asc' },
                                },
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                progresses: true,
            },
        });
        const courseDetails = [];
        const completedCourses = [];
        for (const enrollment of enrollments) {
            const course = enrollment.course;
            const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
            const isCompleted = totalLessons > 0 && enrollment.progresses.length >= totalLessons;
            if (isCompleted)
                completedCourses.push(course.title);
            let curriculum = `\n📘 Khóa học: "${course.title}" (${isCompleted ? 'ĐÃ HOÀN THÀNH' : `đang học ${enrollment.progresses.length}/${totalLessons} bài`})\n`;
            curriculum += `   Mô tả: ${course.description}\n`;
            for (const section of course.sections) {
                curriculum += `   📂 Chương: ${section.title}\n`;
                for (const lesson of section.lessons) {
                    curriculum += `      📄 ${lesson.title} [${lesson.type}]`;
                    if (lesson.body) {
                        const bodyPreview = lesson.body.slice(0, 500).replace(/\n/g, ' ');
                        curriculum += `\n         Nội dung: ${bodyPreview}${lesson.body.length > 500 ? '...' : ''}`;
                    }
                    else if (lesson.type === 'VIDEO') {
                        curriculum += ` (video — chưa có tóm tắt nội dung)`;
                    }
                    curriculum += '\n';
                }
            }
            courseDetails.push(curriculum);
        }
        const prompt = `
You are a professional career advisor and tech skill assessor.

Below is the DETAILED CURRICULUM and LESSON CONTENT that a user has studied:
${courseDetails.join('\n---\n')}

${completedCourses.length > 0 ? `Fully completed courses: ${JSON.stringify(completedCourses)}` : 'No courses fully completed yet.'}

Task: Based on the ACTUAL CONTENT of the lessons above (not just course titles), evaluate their technical proficiency.
Return a JSON object (and ONLY a JSON object, no markdown fences) with this exact structure:
{
  "overallScore": <number 1-100>,
  "skills": [
    { "name": "<specific skill category based on lesson content>", "score": <number 1-100> }
  ],
  "level": "<Intern/Fresher/Junior/Mid-Level/Senior/Expert>",
  "summary": "<2-3 sentence Vietnamese summary analyzing what they learned based on the actual lesson content>",
  "recommendations": ["<specific recommendation 1 in Vietnamese based on gaps in their curriculum>", "<recommendation 2>", "<recommendation 3>"]
}

Rules:
- Extract SPECIFIC skill categories from the lesson content (e.g. "React Hooks", "SQL Queries", "REST API Design"), not generic ones
- Score should reflect depth of content studied — shallow introductions = lower score
- Completing courses raises score, just enrolling gives partial credit
- Be realistic — 1-2 beginner courses = Junior (20-40)
- Write summary and recommendations in Vietnamese
- Recommendations should suggest SPECIFIC topics/courses to fill gaps
- Return ONLY valid JSON
        `;
        try {
            console.log(`[AiService] Assessing skills for user ${userId} — ${enrollments.length} enrolled, ${completedCourses.length} completed, prompt: ${prompt.length} chars`);
            const text = await this.generateWithFallback(prompt);
            console.log(`[AiService] Assessment done — ${text.length} chars`);
            let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            JSON.parse(cleaned);
            await this.prisma.user.update({
                where: { id: userId },
                data: { aiRank: cleaned },
            });
            return cleaned;
        }
        catch (error) {
            const msg = error?.message || '';
            console.error(`[AiService] assessSkill error:`, msg.slice(0, 200));
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT: AI đang bị giới hạn. Vui lòng chờ vài phút.');
            }
            throw new common_1.InternalServerErrorException(`Assessment failed: ${msg.slice(0, 100)}`);
        }
    }
    async generateQuiz(lessonContent) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại.");
        }
        const prompt = `
You are an expert instructor. Based on the following lesson content, generate exactly 5 multiple-choice questions to test the student's knowledge.

Lesson content:
${lessonContent.slice(0, 3000)} // Truncated to avoid token limit if too long

Return ONLY a valid JSON array of 5 questions with this exact structure. Do not return markdown, just the JSON list:
[
  {
    "content": "Nội dung câu hỏi ở đây?",
    "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correctAnswer": 0
  }
]
Note: 'correctAnswer' is the 0-based index of the correct option in the 'options' array.
`;
        try {
            console.log(`[AiService] Generating quiz...`);
            const text = await this.generateWithFallback(prompt);
            let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
            const questions = JSON.parse(cleaned);
            console.log(`[AiService] Quiz generation done, got ${questions.length} questions`);
            return questions;
        }
        catch (error) {
            const msg = error?.message || '';
            console.error(`[AiService] generateQuiz error:`, msg.slice(0, 200));
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT: AI đang bị giới hạn. Vui lòng chờ vài phút.');
            }
            throw new common_1.InternalServerErrorException('Lỗi khi tạo Quiz từ AI.');
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map