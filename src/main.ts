import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions/http-exception.filter';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { DataSource } from 'typeorm';
import * as express from 'express';
import { join } from 'path';
import { StaticFilesMiddleware } from 'src/common/middlewares/static-files.middleware';
import { AppModule } from './app.module';
import { DoaminsService } from './doamins/doamins.service';
import { MyLogger } from './common/logging/logger.service';



async function bootstrap() {

  //version api
  const isProd = process.env.NODE_ENV === 'production';

  const app = isProd
    ? await NestFactory.create(AppModule, {
      logger: new MyLogger(), // 👈 chỉ dùng logger nếu là production
    })
    : await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);


  //middleware block static file

  const domainsService = app.get(DoaminsService);

  app.enableCors({
    origin: (origin, callback) => {
      console.log(origin);
      if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Tạo middleware và inject DomainsService vào

  const staticFile = new StaticFilesMiddleware(domainsService)


  app.use('/public', staticFile.use);

  app.use(express.static(join(__dirname, '..' )));
  app.use(express.json({ limit: '1024mb' }))
  app.use(express.urlencoded({ limit: '1024mb', extended: true }));


  // set global route
  app.setGlobalPrefix('api'); 

  //html exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  // config swagger document api
  const config = new DocumentBuilder()
    .setTitle('API USING NEST')
    .setDescription('Author: Nguyen Thien Thanh')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha', // Sắp xếp các tag theo thứ tự từ A-Z
      persistAuthorization: true,
    },
  });

  //middleware

  // Cấu hình CORS
  const allowedDomains = await domainsService.findAll();
  const allowedOrigins = allowedDomains.map((d) => d.name);

  

    //custom transform
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

    //custom logging
  app.useGlobalInterceptors(new LoggingInterceptor());

    //validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      disableErrorMessages: false
    }),
  );


 
    //config server
  const PORT = configService.get<number>('PORT') || 3000;
  await app.listen(PORT, () => {
    console.log(`Server is  running at http://localhost:${PORT}/api`);
  });

  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    console.log('Database is already connected!', configService.get<string>('database.database'));
  } else {
    try {
      await dataSource.initialize();
      console.log('Connected to the database successfully!', configService.get<string>('database.database').toUpperCase());
    } catch (error) {
      console.error('Database connection failed!', error, configService.get<string>('database.database').toUpperCase());
      process.exit(1); // Dừng ứng dụng nếu kết nối thất bại
    }
  }
}
bootstrap();
