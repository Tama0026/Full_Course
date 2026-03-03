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
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 60_000));
                const response = await Promise.race([
                    this.ai.models.generateContent({ model, contents: prompt }),
                    timeoutPromise,
                ]);
                console.log(`[AiService] ✅ Model ${model} succeeded`);
                return response.text || '';
            }
            catch (err) {
                const status = err?.status || (err?.message?.includes('429') ? 429 : err?.message?.includes('503') ? 503 : err?.message?.includes('500') ? 500 : 0);
                lastError = err;
                if (status === 429 || status === 503 || status === 500) {
                    console.warn(`[AiService] ⚠️ Model ${model} failed with status ${status}, trying next...`);
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
    async generateLessonContent(title, courseTitle) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại trong hệ thống. Vui lòng cấu hình file .env");
        }
        const prompt = `
You are an expert instructor for a course titled "${courseTitle}". Write a comprehensive lesson document (in Vietnamese) for a topic titled: "${title}".

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
    async generateLessonContentWithQuiz(title, courseTitle, quizCount = 5) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại trong hệ thống.");
        }
        const prompt = `
You are an expert instructor for a course titled "${courseTitle}". Your task is to create BOTH a comprehensive lesson document AND a quiz for a topic titled: "${title}".

PART 1 — LESSON CONTENT:
- Write in Vietnamese.
- Use Markdown formatting.
- Include a brief introduction.
- Provide clear, structured main points with H2/H3 headers.
- If applicable, add a small code snippet or practical example.
- Conclude with a short summary.

PART 2 — QUIZ:
- Generate exactly ${quizCount} multiple-choice questions based on the lesson content you just wrote.
- Each question must have 4 options (A, B, C, D).
- correctAnswer is the 0-based index of the correct option.

Return ONLY a valid JSON object (no markdown fences, no extra text) with this exact structure:
{
  "body": "<full markdown lesson content here>",
  "quiz": [
    {
      "content": "Nội dung câu hỏi?",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 0
    }
  ]
}

IMPORTANT: The "body" field must contain valid Markdown. Escape any special JSON characters (newlines as \\n, quotes as \\"). Return ONLY the JSON object.
        `;
        try {
            console.log(`[AiService] Generating lesson content + quiz — title: "${title}", quizCount: ${quizCount}`);
            const text = await this.generateWithFallback(prompt);
            let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
            const result = JSON.parse(cleaned);
            if (!result.body || !Array.isArray(result.quiz)) {
                throw new Error('AI response missing required fields (body or quiz)');
            }
            console.log(`[AiService] Content+Quiz done — body: ${result.body.length} chars, quiz: ${result.quiz.length} questions`);
            return result;
        }
        catch (error) {
            const status = error?.status || error?.code;
            const msg = error?.message || '';
            console.error(`[AiService] generateLessonContentWithQuiz error — status: ${status}`, msg.slice(0, 200));
            if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT_429: Tất cả AI model đều đang bị giới hạn hoặc quá tải. Vui lòng chờ vài phút rồi thử lại.');
            }
            if (status === 503 || msg.includes('503') || msg.includes('high demand')) {
                throw new common_1.InternalServerErrorException('SERVICE_UNAVAILABLE_503: Hệ thống AI đang bị quá tải (High Demand). Vui lòng thử lại sau một lát.');
            }
            throw new common_1.InternalServerErrorException(`Content+Quiz generation failed: ${msg.slice(0, 100) || 'unknown'}`);
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
                        sections: {
                            select: {
                                title: true,
                                order: true,
                                lessons: {
                                    select: { id: true, title: true, type: true, body: true, order: true },
                                    orderBy: { order: 'asc' },
                                },
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                progresses: { select: { lessonId: true } },
            },
        });
        const courseDetails = [];
        const completedCourses = [];
        let totalCompletedLessons = 0;
        for (const enrollment of enrollments) {
            const course = enrollment.course;
            const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
            const completedLessonIds = new Set(enrollment.progresses.map(p => p.lessonId));
            const numCompleted = completedLessonIds.size;
            totalCompletedLessons += numCompleted;
            if (numCompleted === 0)
                continue;
            const isFullyCompleted = numCompleted >= totalLessons && totalLessons > 0;
            if (isFullyCompleted)
                completedCourses.push(course.title);
            let curriculum = `\n📘 Khóa học: "${course.title}" (${isFullyCompleted ? 'ĐÃ HOÀN THÀNH' : `${numCompleted}/${totalLessons} bài đã học`})\n`;
            for (const section of course.sections) {
                const completedInSection = section.lessons.filter(l => completedLessonIds.has(l.id));
                if (completedInSection.length === 0)
                    continue;
                curriculum += `   📂 Chương: ${section.title}\n`;
                for (const lesson of completedInSection) {
                    curriculum += `      ✅ ${lesson.title} [${lesson.type}]`;
                    if (lesson.body) {
                        const bodyPreview = lesson.body.slice(0, 500).replace(/\n/g, ' ');
                        curriculum += `\n         Nội dung: ${bodyPreview}${lesson.body.length > 500 ? '...' : ''}`;
                    }
                    else if (lesson.type === 'VIDEO') {
                        curriculum += ` (video bài học đã xem)`;
                    }
                    curriculum += '\n';
                }
            }
            courseDetails.push(curriculum);
        }
        if (totalCompletedLessons === 0) {
            const noDataResult = JSON.stringify({
                overallScore: 0,
                skills: [],
                level: "Chưa có dữ liệu",
                summary: "Học viên chưa hoàn thành bài học nào. Hãy bắt đầu học và hoàn thành ít nhất một bài học để nhận đánh giá kỹ năng chính xác.",
                recommendations: [
                    "Hãy đăng ký một khóa học phù hợp với mục tiêu nghề nghiệp của bạn.",
                    "Hoàn thành ít nhất vài bài học đầu tiên để AI có thể đánh giá điểm mạnh và điểm yếu của bạn.",
                    "Sau khi học xong, nhấn nút 'Hoàn thành' ở cuối mỗi bài để hệ thống ghi nhận tiến độ.",
                ],
            });
            await this.prisma.user.update({ where: { id: userId }, data: { aiRank: noDataResult } });
            return noDataResult;
        }
        const prompt = `
You are a professional career advisor and tech skill assessor.

Below is the list of lessons a student has ACTUALLY COMPLETED (lessons they did NOT complete are excluded):
${courseDetails.join('\n---\n')}

${completedCourses.length > 0 ? `Fully completed courses: ${JSON.stringify(completedCourses)}` : 'No courses fully completed yet.'}

Task: Based ONLY on the content of the COMPLETED lessons above, evaluate their technical proficiency.
Return a JSON object (and ONLY a JSON object, no markdown fences) with this exact structure:
{
  "overallScore": <number 1-100>,
  "skills": [
    { "name": "<specific skill extracted from completed lesson content>", "score": <number 1-100> }
  ],
  "level": "<Intern/Fresher/Junior/Mid-Level/Senior/Expert>",
  "summary": "<2-3 sentence Vietnamese summary of what they have ACTUALLY learned>",
  "recommendations": ["<recommendation 1 in Vietnamese>", "<recommendation 2>", "<recommendation 3>"]
}

Rules:
- ONLY evaluate skills from COMPLETED lessons — do NOT assume knowledge from uncompleted lessons
- Scores should reflect actual depth: 1-5 completed intro lessons = Fresher (15-30 score max)
- Completing full courses significantly raises score
- Freshers who completed only a few intro lessons should score 10-25 maximum
- Extract SPECIFIC skills from lesson bodies (e.g. "React Hooks", "CSS Flexbox"), not generic topics
- Write summary and recommendations in Vietnamese
- Return ONLY valid JSON
        `;
        try {
            console.log(`[AiService] Assessing skills for user ${userId} — ${totalCompletedLessons} lessons completed across ${courseDetails.length} courses`);
            const text = await this.generateWithFallback(prompt);
            console.log(`[AiService] Assessment done — ${text.length} chars`);
            let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            JSON.parse(cleaned);
            await this.prisma.user.update({ where: { id: userId }, data: { aiRank: cleaned } });
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
    async generateQuiz(lessonContent, count = 5) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại.");
        }
        const prompt = `
You are an expert instructor. Based on the following lesson content, generate exactly ${count} multiple-choice questions to test the student's knowledge.

Lesson content:
${lessonContent.slice(0, 3000)} // Truncated to avoid token limit if too long

Return ONLY a valid JSON array of ${count} questions with this exact structure. Do not return markdown, just the JSON list:
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
    async askTutor(question, lessonId) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại.");
        }
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { title: true, body: true, type: true },
        });
        const lessonContext = lesson?.body
            ? `Tên bài học: ${lesson.title}\n\nNội dung bài học:\n${lesson.body.slice(0, 3000)}`
            : lesson
                ? `Tên bài học: ${lesson.title} (Bài học dạng video, không có nội dung văn bản.)`
                : 'Không tìm thấy nội dung bài học.';
        const prompt = `
Bạn là một AI Tutor thân thiện, chuyên hỗ trợ học viên học lập trình.

Ngữ cảnh bài học mà học viên đang học:
---
${lessonContext}
---

Câu hỏi của học viên: "${question}"

Hướng dẫn:
- Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu (tối đa 300 từ).
- Trả lời DỰA VÀO nội dung bài học ở trên làm nền tảng.
- Nếu câu hỏi nằm ngoài phạm vi bài học, trả lời nhẹ nhàng và hướng học viên về đúng chủ đề.
- Nếu cần dùng code ví dụ, dùng markdown code block.
- KHÔNG được bịa thông tin, chỉ trả lời những gì bạn biết chắc.
        `;
        try {
            console.log(`[AiService] askTutor — lessonId: ${lessonId}, question: "${question.slice(0, 80)}"`);
            const text = await this.generateWithFallback(prompt);
            return text || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này.';
        }
        catch (error) {
            const msg = error?.message || '';
            console.error(`[AiService] askTutor error:`, msg.slice(0, 200));
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT: AI đang bận. Vui lòng chờ vài giây.');
            }
            throw new common_1.InternalServerErrorException('Lỗi khi hỏi AI Tutor.');
        }
    }
    async conductInterview(courseContext, courseName, userMessage, history) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại.");
        }
        let conversationHistory = '';
        if (history.length > 0) {
            conversationHistory = '\n\nLịch sử hội thoại trước đó:\n';
            for (const msg of history.slice(-10)) {
                const role = msg.role === 'user' ? 'Ứng viên' : 'Nhà tuyển dụng';
                conversationHistory += `${role}: ${msg.content}\n`;
            }
        }
        const prompt = `
Bạn là một nhà tuyển dụng công nghệ (Tech Recruiter) chuyên nghiệp, đang phỏng vấn một ứng viên.

Kiến thức của ứng viên dựa trên khóa học sau:
---
${courseContext.slice(0, 4000)}
---

Tên khóa học: "${courseName}"
${conversationHistory}

Tin nhắn mới từ ứng viên: "${userMessage}"

Hướng dẫn phỏng vấn:
- Hỏi các câu hỏi kỹ thuật liên quan đến nội dung khóa học trên.
- Bắt đầu từ câu hỏi dễ, sau đó tăng dần độ khó.
- Nếu ứng viên trả lời đúng, khen ngợi ngắn gọn rồi hỏi câu tiếp theo khó hơn.
- Nếu ứng viên trả lời sai hoặc thiếu, giải thích ngắn gọn đáp án đúng rồi chuyển sang câu khác.
- Nếu đây là tin nhắn đầu tiên (chưa có lịch sử), hãy chào hỏi chuyên nghiệp và bắt đầu với câu hỏi đầu tiên.
- Giữ phong cách chuyên nghiệp nhưng thân thiện.
- Trả lời bằng tiếng Việt, tối đa 200 từ.
- Tự động đánh giá ứng viên đạt hoặc không đạt sau khi kết thúc phỏng vấn.
- Hỏi số lượng câu hỏi vừa đủ để đánh giá
- Dùng Markdown nếu cần format code.
        `;
        try {
            console.log(`[AiService] conductInterview — course: "${courseName}", msg: "${userMessage.slice(0, 60)}"`);
            const text = await this.generateWithFallback(prompt);
            return text || 'Xin lỗi, tôi không thể xử lý câu trả lời lúc này.';
        }
        catch (error) {
            const msg = error?.message || '';
            console.error(`[AiService] conductInterview error:`, msg.slice(0, 200));
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT: AI đang bị giới hạn. Vui lòng chờ vài phút.');
            }
            throw new common_1.InternalServerErrorException('Lỗi khi phỏng vấn AI.');
        }
    }
    async suggestLearningOutcomes(title, description) {
        if (!process.env.GEMINI_API_KEY) {
            throw new common_1.InternalServerErrorException("GEMINI_API_KEY không tồn tại trong hệ thống.");
        }
        const prompt = `Bạn là chuyên gia thiết kế khóa học. Dựa trên tiêu đề '${title}' và mô tả '${description}', hãy trả về duy nhất một JSON array chứa 5-8 mục tiêu học tập (string). Mỗi mục bắt đầu bằng động từ hành động. Chỉ trả về JSON, không giải thích.`;
        try {
            console.log(`[AiService] Suggesting learning outcomes — title: "${title}"`);
            const text = await this.generateWithFallback(prompt);
            let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
            const outcomes = JSON.parse(cleaned);
            if (!Array.isArray(outcomes)) {
                throw new Error('AI response is not an array');
            }
            console.log(`[AiService] Learning outcomes done — ${outcomes.length} items`);
            return outcomes.map((o) => String(o));
        }
        catch (error) {
            const msg = error?.message || '';
            console.error(`[AiService] suggestLearningOutcomes error:`, msg.slice(0, 200));
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new common_1.InternalServerErrorException('RATE_LIMIT: AI đang bị giới hạn. Vui lòng chờ vài phút.');
            }
            throw new common_1.InternalServerErrorException(`Learning outcomes generation failed: ${msg.slice(0, 100) || 'unknown'}`);
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map