import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export function swaggerConfig(
  app: INestApplication<any>,
  options: Record<string, any>,
) {
  const { title = 'Poc-RAG API', version = '1.0', path = 'api' } = options;

  const config = new DocumentBuilder()
    .setTitle(title)
    .setVersion(version)
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, swaggerOptions);
  SwaggerModule.setup(path, app, documentFactory);
}
