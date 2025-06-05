import { AppDataSource } from '../config/database';
import { Interaction } from '../models/Interaction';

describe('Database Tests', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('should save and retrieve an interaction', async () => {
    // Test creating a new interaction
    const interaction = new Interaction();
    interaction.userQuery = 'Test query';
    interaction.aiResponse = 'Test response';
    interaction.context = 'Test context';
    interaction.metadata = JSON.stringify({ test: true });

    const savedInteraction = await AppDataSource.manager.save(interaction);
    expect(savedInteraction).toBeDefined();
    expect(savedInteraction.id).toBeDefined();

    // Test retrieving the interaction
    const retrievedInteraction = await AppDataSource.manager.findOne(Interaction, {
      where: { id: savedInteraction.id }
    });
    expect(retrievedInteraction).toBeDefined();
    expect(retrievedInteraction?.userQuery).toBe('Test query');
    expect(retrievedInteraction?.aiResponse).toBe('Test response');
  });
}); 