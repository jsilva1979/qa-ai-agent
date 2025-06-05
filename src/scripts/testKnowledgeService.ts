import { AppDataSource } from '../config/database';
import { KnowledgeService } from '../services/knowledgeService';
import { InteractionService } from '../services/interactionService';

async function testKnowledgeService() {
    try {
        // Inicializa a conexão com o banco de dados
        await AppDataSource.initialize();
        console.log('Conexão com o banco de dados estabelecida');

        const knowledgeService = new KnowledgeService();
        const interactionService = new InteractionService();

        // Cria uma interação de teste
        const interaction = await interactionService.saveInteraction({
            userInput: 'Como funciona o TypeScript?',
            aiResponse: 'TypeScript é um superset do JavaScript que adiciona tipagem estática.',
            metadata: { source: 'test' }
        });

        // Adiciona um conhecimento
        const knowledge = await knowledgeService.addKnowledge({
            title: 'Introdução ao TypeScript',
            content: 'TypeScript é uma linguagem de programação desenvolvida pela Microsoft que adiciona tipagem estática ao JavaScript.',
            tags: ['typescript', 'javascript', 'programação'],
            category: 'Linguagens de Programação',
            confidence: 0.9,
            source: 'Documentação oficial',
            relatedInteractionId: interaction.id
        });

        console.log('Conhecimento adicionado:', knowledge);

        // Busca conhecimentos por tags
        const knowledgeByTags = await knowledgeService.findByTags(['typescript']);
        console.log('Conhecimentos por tags:', knowledgeByTags);

        // Busca conhecimentos por categoria
        const knowledgeByCategory = await knowledgeService.findByCategory('Linguagens de Programação');
        console.log('Conhecimentos por categoria:', knowledgeByCategory);

        // Busca conhecimentos relacionados à interação
        const knowledgeByInteraction = await knowledgeService.findByInteraction(interaction.id);
        console.log('Conhecimentos relacionados à interação:', knowledgeByInteraction);

        // Busca conhecimentos relevantes
        const relevantKnowledge = await knowledgeService.findRelevantKnowledge('TypeScript');
        console.log('Conhecimentos relevantes:', relevantKnowledge);

        // Atualiza um conhecimento
        const updatedKnowledge = await knowledgeService.updateKnowledge(knowledge.id, {
            confidence: 0.95,
            tags: [...knowledge.tags, 'desenvolvimento']
        });
        console.log('Conhecimento atualizado:', updatedKnowledge);

        // Remove o conhecimento
        const deleted = await knowledgeService.deleteKnowledge(knowledge.id);
        console.log('Conhecimento removido:', deleted);

    } catch (error) {
        console.error('Erro durante o teste:', error);
    } finally {
        // Fecha a conexão com o banco de dados
        await AppDataSource.destroy();
        console.log('Conexão com o banco de dados fechada');
    }
}

// Executa o teste
testKnowledgeService(); 