import { AppDataSource } from '../config/database';
import { Interaction } from '../models/Interaction';

describe('Save Interaction Tests', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('should save and verify an interaction', async () => {
    // Create a new test interaction
    const interaction = new Interaction();
    interaction.userQuery = 'Teste de salvamento';
    interaction.aiResponse = 'Resposta de teste';
    interaction.context = 'test-context';
    interaction.metadata = JSON.stringify({ test: true });

    // Save the interaction
    const savedInteraction = await AppDataSource.manager.save(interaction);
    expect(savedInteraction).toBeDefined();
    expect(savedInteraction.id).toBeDefined();

    // Verify it was saved correctly
    const foundInteraction = await AppDataSource.manager.findOne(Interaction, {
      where: { id: savedInteraction.id }
    });

    expect(foundInteraction).toBeDefined();
    expect(foundInteraction?.userQuery).toBe('Teste de salvamento');
    expect(foundInteraction?.aiResponse).toBe('Resposta de teste');
    expect(foundInteraction?.context).toBe('test-context');
  });
}); 