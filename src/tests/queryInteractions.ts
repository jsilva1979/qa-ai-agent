import { AppDataSource } from '../config/database';
import { Interaction } from '../models/Interaction';

describe('Query Interactions Tests', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('should retrieve all interactions', async () => {
    const interactions = await AppDataSource.manager.find(Interaction);
    expect(Array.isArray(interactions)).toBe(true);
    
    if (interactions.length > 0) {
      const firstInteraction = interactions[0];
      expect(firstInteraction).toHaveProperty('id');
      expect(firstInteraction).toHaveProperty('userQuery');
      expect(firstInteraction).toHaveProperty('aiResponse');
      expect(firstInteraction).toHaveProperty('createdAt');
    }
  });
}); 