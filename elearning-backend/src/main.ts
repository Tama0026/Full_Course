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
  const allowedOrigins = [
    'http://localhost:3000', // Port mặc định của Next.js local
    'http://127.0.0.1:3000',
    'https://full-course-eta.vercel.app', // Domain Vercel của bạn
  ];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(url => url.trim()));
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // SỬA TẠI ĐÂY: Lấy port từ biến môi trường của Railway
  const port = process.env.PORT || 4000;

  // SỬA TẠI ĐÂY: Lắng nghe trên '0.0.0.0' để Railway nhận diện được
  await app.listen(port, '0.0.0.0');
}
bootstrap();
