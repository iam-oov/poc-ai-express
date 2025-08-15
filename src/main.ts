import { NestFactory } from '@nestjs/core';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { appConfig, envs, swaggerConfig } from './configs';
import { CustomExceptionFilter } from './shared/exceptions/error-custom-exception.filter';

async function bootstrap() {
  const logger = new Logger(`Main-${appConfig.APP_NAME}`);

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(`api`, {
    exclude: [
      {
        path: '/',
        method: RequestMethod.GET,
      },
    ],
  });

  // pipe options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // swagger config
  swaggerConfig(app, {
    path: 'api',
    title: appConfig.APP_NAME,
    version: appConfig.APP_VERSION,
  });

  app.useGlobalFilters(new CustomExceptionFilter());

  await app.listen(envs.port);
  logger.log(
    `[v${appConfig.APP_VERSION}] Main-${appConfig.APP_NAME} is running on: http://localhost:${envs.port}`,
  );
}
bootstrap();
