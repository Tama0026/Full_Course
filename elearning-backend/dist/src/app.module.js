"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const auth_module_1 = require("./auth/auth.module");
const courses_module_1 = require("./courses/courses.module");
const orders_module_1 = require("./orders/orders.module");
const learning_module_1 = require("./learning/learning.module");
const comments_module_1 = require("./comments/comments.module");
const notes_module_1 = require("./notes/notes.module");
const ai_module_1 = require("./ai/ai.module");
const quiz_module_1 = require("./quiz/quiz.module");
const gamification_module_1 = require("./gamification/gamification.module");
const email_module_1 = require("./email/email.module");
const interview_module_1 = require("./interview/interview.module");
const categories_module_1 = require("./categories/categories.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                playground: true,
                context: ({ req }) => ({ req }),
            }),
            prisma_module_1.PrismaModule,
            cloudinary_module_1.CloudinaryModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            courses_module_1.CoursesModule,
            orders_module_1.OrdersModule,
            learning_module_1.LearningModule,
            comments_module_1.CommentsModule,
            notes_module_1.NotesModule,
            ai_module_1.AiModule,
            quiz_module_1.QuizModule,
            gamification_module_1.GamificationModule,
            interview_module_1.InterviewModule,
            categories_module_1.CategoriesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map