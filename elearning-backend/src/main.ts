import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies so req.cookies is available (needed for JWT cookie extraction)
  app.use(cookieParser());

  // Enable global validation pipe (class-validator integration)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip non-whitelisted properties
      forbidNonWhitelisted: true, // Throw error on extra properties
      transform: true,            // Auto-transform payloads to DTO instances
    }),
  );

  // Enable CORS for frontend integration
  app.enableCors({
    origin: true, // true reflects the incoming origin, which is required when credentials = true
    credentials: true,
  });

  await app.listen(3000);
  console.log(`🚀 Application is running on: http://localhost:3000/graphql`);
}
bootstrap();
