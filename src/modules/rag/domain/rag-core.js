class RagCore {
  constructor(llmService, vectorStore) {
    this.llmService = llmService;
    this.vectorStore = vectorStore;
  }

  async processQuestion(question) {
    const context = await this.vectorStore.findRelevantDocuments(question);
    const answer = await this.llmService.generateResponse(question, context);
    return answer;
  }
}
module.exports = RagCore;
