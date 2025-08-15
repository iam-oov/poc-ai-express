import { Controller, Post, Body } from '@nestjs/common';

import { QuestionDto } from '../dtos';
import { IQuestionResponse } from '../interfaces';
import { RagService } from '../../application/services';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('/question')
  async getAnswer(
    @Body() questionDto: QuestionDto,
  ): Promise<IQuestionResponse> {
    const answer = await this.ragService.handleQuestion(questionDto);
    return { data: { answer } };
  }
}
