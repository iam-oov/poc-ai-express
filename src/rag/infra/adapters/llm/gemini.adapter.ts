import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { envs } from '../../../../configs';
import { LlmServicePort } from '../../../domain/ports';

@Injectable()
export class GeminiAdapter implements LlmServicePort {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(envs.geminiApiKey);
    this.model = genAI.getGenerativeModel({ model: envs.geminiModel });
  }

  async generateResponse(query: string, context: string): Promise<string> {
    const prompt = `Based on the following context: ${context}\n\nAnswer the question: ${query}`;
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
