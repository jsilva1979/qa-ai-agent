import { RAGService } from '../services/RAGService';
import { DocumentEmbedding } from '../models/DocumentEmbedding';
import { QAResponse } from '../models/QAResponse';

describe('RAG Tests', () => {
  let ragService: RAGService;

  beforeEach(() => {
    ragService = new RAGService();
  });

  it('should store and retrieve documents', async () => {
    const doc: DocumentEmbedding = {
      content: 'Test document content',
      embedding: [0.1, 0.2, 0.3],
      metadata: { type: 'test' },
      source_type: 'test-source'
    };

    await ragService.storeDocument(doc);
    const similarDocs = await ragService.findSimilarDocuments([0.4, 0.5, 0.6] as any);
    expect(similarDocs).toBeDefined();
    expect(Array.isArray(similarDocs)).toBe(true);
  });

  it('should create and complete a QA session', async () => {
    const session = await ragService.createQASession('test-user');
    expect(session).toBeDefined();
    expect(session.user_id).toBe('test-user');

    const response: QAResponse = {
      session_id: session.id!,
      question: 'Test question',
      answer: 'Test answer',
      response: 'Test answer',
      context: 'Test context'
    };

    const storedResponse = await ragService.storeQAResponse(session.id!, response);
    expect(storedResponse).toBeDefined();
    expect(storedResponse.question).toBe('Test question');

    await ragService.completeQASession(session.id!);
  });
}); 