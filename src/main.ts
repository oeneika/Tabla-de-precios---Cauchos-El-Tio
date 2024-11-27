import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  // Configuración básica de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Procesamiento de Excel')
    .setDescription(
      'Documentación de la API para subir y gestionar datos desde archivos Excel',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // La documentación estará en /api

  await app.listen(3000);
}
bootstrap();
