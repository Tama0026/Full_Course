import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { OrdersModule } from './orders/orders.module';
import { LearningModule } from './learning/learning.module';
import { CommentsModule } from './comments/comments.module';
import { NotesModule } from './notes/notes.module';
import { AiModule } from './ai/ai.module';
import { QuizModule } from './quiz/quiz.module';
import { GamificationModule } from './gamification/gamification.module';
import { EmailModule } from './email/email.module';
import { InterviewModule } from './interview/interview.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // GraphQL Code-first configuration with Apollo
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),

    // Core modules
    PrismaModule,
    CloudinaryModule,
    EmailModule,

    // Feature modules
    AuthModule,
    CoursesModule,
    OrdersModule,
    LearningModule,
    CommentsModule,
    NotesModule,
    AiModule,
    QuizModule,
    GamificationModule,
    InterviewModule,
    CategoriesModule,
  ],
})
export class AppModule { }
