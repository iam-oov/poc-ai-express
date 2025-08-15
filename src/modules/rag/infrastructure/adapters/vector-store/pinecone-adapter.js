const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const { loadEnvironment } = require(path.join(
  __dirname,
  '../../../../../config/environment'
));

const VectorStorePort = require('../../../domain/ports/vector-store');
const GoogleEmbeddingsAdapter = require('../embeddings/google-embeddings-adapter');

class PineconeAdapter extends VectorStorePort {
  constructor() {
    super();
    this.pineconeIndex = null;
    this.config = loadEnvironment();
    this.embeddingsAdapter = new GoogleEmbeddingsAdapter();
  }

  async connect() {
    const pinecone = new Pinecone({
      apiKey: this.config.pineconeApiKey,
    });
    this.pineconeIndex = pinecone.index(this.config.pineconeIndexName);
  }

  async findRelevantDocuments(query) {
    try {
      // Generate embedding for the query using Google AI
      const queryEmbedding = await this.embeddingsAdapter.embedQuery(query);

      // Search for similar vectors in Pinecone
      const searchResults = await this.pineconeIndex.query({
        vector: queryEmbedding,
        topK: 4,
        includeMetadata: true,
        includeValues: false,
      });

      // Extract content from metadata
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

  /**
   * Upsert vectors to Pinecone index
   * @param {Array} vectors - Array of vector objects with id, values, and metadata
   * @returns {Promise<void>}
   */
  async upsert(vectors) {
    try {
      await this.pineconeIndex.upsert(vectors);
    } catch (error) {
      console.error('Error upserting vectors to Pinecone:', error);
      throw new Error(`Failed to upsert vectors: ${error.message}`);
    }
  }

  /**
   * Delete vectors from Pinecone index
   * @param {Array} ids - Array of vector IDs to delete
   * @returns {Promise<void>}
   */
  async deleteVectors(ids) {
    try {
      await this.pineconeIndex.deleteMany(ids);
    } catch (error) {
      console.error('Error deleting vectors from Pinecone:', error);
      throw new Error(`Failed to delete vectors: ${error.message}`);
    }
  }
}

module.exports = PineconeAdapter;
