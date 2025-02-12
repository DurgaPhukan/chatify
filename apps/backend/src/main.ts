import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cors from 'cors';
// import { createAdapter } from '@socket.io/redis-adapter'; // Optional for scaling

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for REST API
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Use the IoAdapter for WebSocket handling with CORS
  const ioAdapter = new IoAdapter(app);
  app.useWebSocketAdapter(ioAdapter);

  // Middleware for fallback CORS handling (if required)
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 4000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 4000}`);
}
bootstrap();
