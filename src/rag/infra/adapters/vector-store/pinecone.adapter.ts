import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';

import { envs } from '../../../../configs';
import { VectorStorePort } from '../../../domain/ports';
import { GoogleEmbeddingsAdapter } from '../embeddings';

@Injectable()
export class PineconeAdapter extends VectorStorePort implements OnModuleInit {
  private pineconeIndex;

  constructor(private readonly embeddingsAdapter: GoogleEmbeddingsAdapter) {
    super();
  }

  async onModuleInit() {
    const pinecone = new Pinecone({
      apiKey: envs.pineconeApiKey,
    });
    this.pineconeIndex = pinecone.index(envs.pineconeIndexName);
  }

  async findRelevantDocuments(query: string): Promise<string> {
    try {
      const queryEmbedding = await this.embeddingsAdapter.embedQuery(query);

      const searchResults = await this.pineconeIndex.query({
        vector: queryEmbedding,
        topK: 4,
        includeMetadata: true,
        includeValues: false,
      });

      const documents = searchResults.matches
        .filter((match) => match.metadata && match.metadata.text)
        .map((match) => match.metadata.text)
        .join('\n\n');

      return documents;
    } catch (error) {
      console.error('Error searching relevant documents:', error);
      throw new Error(`Failed to find relevant documents: ${error.message}`);
    }
  }
}
