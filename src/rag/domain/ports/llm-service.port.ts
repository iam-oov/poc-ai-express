export abstract class LlmServicePort {
  abstract generateResponse(query: string, context: string): Promise<string>;
}
