import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CustomIoAdapter } from './custom-ip-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useWebSocketAdapter(new CustomIoAdapter(app));

  // Enable CORS for HTTP requests
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });


  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 4000}`);
}
bootstrap();
