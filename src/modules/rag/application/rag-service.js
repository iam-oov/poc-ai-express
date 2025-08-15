const RagCore = require('../domain/rag-core');

class RagApplicationService {
  constructor(llmService, vectorStore) {
    this.ragCore = new RagCore(llmService, vectorStore);
  }

  async handleQuestion(question) {
    if (!question) {
      throw new Error('The question cannot be empty.');
    }
    return this.ragCore.processQuestion(question);
  }
}
module.exports = RagApplicationService;
