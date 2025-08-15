export abstract class VectorStorePort {
  abstract findRelevantDocuments(query: string): Promise<string>;
}
