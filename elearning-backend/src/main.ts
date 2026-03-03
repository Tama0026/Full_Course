import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cập nhật CORS linh hoạt hơn
  app.enableCors({
    origin: [
      'http://localhost:3000', // Port mặc định của Next.js local
      'http://127.0.0.1:3000',
      'https://full-course-eta.vercel.app', // Domain Vercel của bạn
    ],
    credentials: true,
  });

  // SỬA TẠI ĐÂY: Lấy port từ biến môi trường của Railway
  const port = process.env.PORT || 4000;

  // SỬA TẠI ĐÂY: Lắng nghe trên '0.0.0.0' để Railway nhận diện được
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on port: ${port}`);
  console.log(`📊 GraphQL endpoint: /graphql`);
}
bootstrap();