import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { envs } from '../../../../configs';

@Injectable()
export class GoogleEmbeddingsAdapter {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(envs.geminiApiKey);
    this.model = genAI.getGenerativeModel({
      model: envs.geminiModelEmbeddings,
    });
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const result = await this.model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to generate embedding: ${error.message}`,
      );
    }
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const embeddings = [];
    for (const doc of documents) {
      const embedding = await this.embedText(doc);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  async embedQuery(query: string): Promise<number[]> {
    return this.embedText(query);
  }
}
