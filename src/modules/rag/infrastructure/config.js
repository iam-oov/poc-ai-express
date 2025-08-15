const GeminiAdapter = require('./adapters/llm/gemini-adapter');
const PineconeAdapter = require('./adapters/vector-store/pinecone-adapter');

const llmService = new GeminiAdapter();
const vectorStore = new PineconeAdapter();

module.exports = {
  llmService,
  vectorStore,
};
