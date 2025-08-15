class LLMServicePort {
  async generateResponse(query, context) {
    throw new Error(
      'The generateResponse method must be implemented by an adapter.'
    );
  }
}
module.exports = LLMServicePort;
