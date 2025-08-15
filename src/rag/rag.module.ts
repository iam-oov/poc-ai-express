import { Module } from '@nestjs/common';

import { LlmServicePort } from './domain/ports/llm-service.port';
import { VectorStorePort } from './domain/ports/vector-store.port';
import { RagService } from './application/services';
import { RagController } from './infra/controllers';
import {
  GeminiAdapter,
  GoogleEmbeddingsAdapter,
  NotionAdapter,
  PineconeAdapter,
} from './infra/adapters';

@Module({
  controllers: [RagController],
  providers: [
    RagService,
    {
      provide: LlmServicePort,
      useClass: GeminiAdapter,
    },
    {
      provide: VectorStorePort,
      useClass: PineconeAdapter,
    },
    GoogleEmbeddingsAdapter,
    NotionAdapter,
  ],
})
export class RagModule {}
