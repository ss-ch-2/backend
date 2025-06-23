import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'stream/consumers';
import { urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Some Configuration for API (Not about Swagger)
  //app.use(json({ limit: '50mb' }));
  //app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Setting API Path
  const apiPath = 'api';
  app.setGlobalPrefix(apiPath);

  // Swagger Options
  const options = new DocumentBuilder()
    .addBearerAuth({type:"http",scheme:"bearer",bearerFormat:"jwt",name:"authorisation",in:"header"},"access-token")
    .setTitle('Nest-js Swagger Example API')
    .setDescription('Swagger Example API API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  // Swagger path: http://localhost:3200/api/docs
  SwaggerModule.setup(`${apiPath}/docs`, app, document);

  app.useGlobalPipes(new ValidationPipe());
app.enableCors({
  origin: 'http://localhost:3000', 
  credentials: true,
  allowedHeaders:['Content-Type','Autorisation']
})

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
