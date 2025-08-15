import { Injectable } from '@nestjs/common';

import { QuestionDto } from '../../infra/dtos';
import { LlmServicePort, VectorStorePort } from '../../domain/ports';

@Injectable()
export class RagService {
  constructor(
    private readonly llmServicePort: LlmServicePort,
    private readonly vectorStorePort: VectorStorePort,
  ) {}

  async handleQuestion(question: QuestionDto): Promise<string> {
    const { question: questionText } = question;

    const context =
      await this.vectorStorePort.findRelevantDocuments(questionText);
    const answer = await this.llmServicePort.generateResponse(
      questionText,
      context,
    );
    return answer;
  }
}
