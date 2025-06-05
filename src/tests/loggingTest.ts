import { RAGService } from '../services/RAGService';
import { DocumentEmbedding } from '../models/DocumentEmbedding';
import { QAResponse } from '../models/QAResponse';
import { QAResponseFeedback } from '../models/QAResponseFeedback';
import fs from 'fs';
import path from 'path';

describe('Logging Tests', () => {
  let ragService: RAGService;
  const testContent = 'Test document content';

  beforeEach(() => {
    ragService = new RAGService();
  });

  it('should log all operations', async () => {
    // Test document storage
    const doc: DocumentEmbedding = {
      content: testContent,
      embedding: [0.1, 0.2, 0.3],
      metadata: { type: 'test' },
      source_type: 'test-source'
    };
    await ragService.storeDocument(doc);

    // Test finding similar documents
    const similarDocs = await ragService.findSimilarDocuments([0.4, 0.5, 0.6] as any);
    expect(similarDocs).toBeDefined();

    // Test QA session creation
    const session = await ragService.createQASession('test-user');
    expect(session).toBeDefined();

    // Test storing QA response
    const response: QAResponse = {
      session_id: session.id!,
      question: 'Test question',
      answer: 'Test answer',
      response: 'Test answer',
      context: 'Test context'
    };
    const storedResponse = await ragService.storeQAResponse(session.id!, response);
    expect(storedResponse).toBeDefined();

    // Test feedback submission
    const feedback: QAResponseFeedback = {
      rating: 'positive',
      comment: 'Test feedback',
      userId: 'test-user'
    };
    await ragService.submitFeedback(storedResponse.id!, feedback);

    // Test session completion
    await ragService.completeQASession(session.id!);

    // Verify log files exist and have content
    const logsDir = path.join(__dirname, '../../logs');
    const combinedLog = path.join(logsDir, 'combined.log');
    const errorLog = path.join(logsDir, 'error.log');

    expect(fs.existsSync(combinedLog)).toBe(true);
    expect(fs.existsSync(errorLog)).toBe(true);
    expect(fs.statSync(combinedLog).size).toBeGreaterThan(0);
  });
}); 