const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const { loadEnvironment } = require(path.join(
  __dirname,
  '../../../../../config/environment'
));

/**
 * Adapter for generating embeddings using Google Generative AI
 * Implements a Langchain-compatible interface for embeddings
 */
class GoogleEmbeddingsAdapter {
  constructor() {
    const config = loadEnvironment();
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'embedding-001' });
  }

  /**
   * Generates embeddings for a text using Google AI
   * @param {string} text - The text to generate embeddings for
   * @returns {Promise<number[]>} Array of numbers representing the embedding
   */
  async embedText(text) {
    try {
      const result = await this.model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding with Google AI:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generates embeddings for multiple documents
   * Method required by Langchain
   * @param {string[]} documents - Array of texts to process
   * @returns {Promise<number[][]>} Array of embeddings
   */
  async embedDocuments(documents) {
    const embeddings = [];
    for (const doc of documents) {
      const embedding = await this.embedText(doc);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  /**
   * Generates embedding for a query
   * Method required by Langchain for compatibility
   * @param {string} query - The query to process
   * @returns {Promise<number[]>} Embedding of the query
   */
  async embedQuery(query) {
    return this.embedText(query);
  }

  // Properties for Langchain compatibility
  get caller() {
    return {
      call: this.embedText.bind(this),
    };
  }

  // Method to get the embedding vector length (if Google provides it)
  get embedingSize() {
    return 768; // Typical size for Google embeddings, adjust according to the model
  }
}

module.exports = GoogleEmbeddingsAdapter;
