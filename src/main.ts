import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;

  // Enable CORS
  app.enableCors();

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Kubernetes Monitor API')
    .setDescription('Comprehensive Kubernetes monitoring and management API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('namespaces', 'Namespace management operations')
    .addTag('pods', 'Pod management and monitoring')
    .addTag('deployments', 'Deployment management')
    .addTag('services', 'Service management')
    .addTag('ingress', 'Ingress management')
    .addTag('secrets', 'Secrets and TLS certificate management')
    .addTag('images', 'Docker image monitoring')
    .addTag('monitoring', 'Advanced monitoring and reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, '172.31.160.1');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  logger.log(`🎯 API base URL: http://localhost:${port}/api/v1`);
}

bootstrap();
