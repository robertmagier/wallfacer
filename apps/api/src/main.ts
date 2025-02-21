import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.API_PORT ?? 3000;
  logger.log(`Application listening on port ${PORT}`);
  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
