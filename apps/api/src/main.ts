import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.API_PORT ?? 3000;
  logger.log(`Application listening on port ${PORT}`);
  app.enableCors({
    origin: '*', // Allow all origins (Not recommended for production)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
