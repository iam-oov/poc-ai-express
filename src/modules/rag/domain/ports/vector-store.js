class VectorStorePort {
  async findRelevantDocuments(query) {
    throw new Error(
      'The findRelevantDocuments method must be implemented by an adapter.'
    );
  }
}
module.exports = VectorStorePort;
