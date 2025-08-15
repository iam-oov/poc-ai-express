const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const { loadEnvironment } = require(path.join(
  __dirname,
  '../../../../../config/environment'
));

const LLMServicePort = require('../../../domain/ports/llm-service');

class GeminiAdapter extends LLMServicePort {
  constructor() {
    super();
    const config = loadEnvironment();
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateResponse(query, context) {
    const prompt = `Based on the following context: ${context}\n\nAnswer the question: ${query}`;
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}

module.exports = GeminiAdapter;
