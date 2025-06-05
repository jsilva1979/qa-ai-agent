import { AppDataSource } from '../config/database';
import { Knowledge } from '../models/Knowledge';
import { Interaction } from '../models/Interaction';

export class KnowledgeService {
    private knowledgeRepository = AppDataSource.getRepository(Knowledge);

    /**
     * Adiciona um novo conhecimento à base
     */
    async addKnowledge(data: {
        title: string;
        content: string;
        tags?: string[];
        category?: string;
        confidence?: number;
        source?: string;
        relatedInteractionId?: string;
    }): Promise<Knowledge> {
        const knowledge = new Knowledge();
        knowledge.title = data.title;
        knowledge.content = data.content;
        knowledge.tags = data.tags || [];
        knowledge.category = data.category || '';
        knowledge.confidence = data.confidence || 0;
        knowledge.source = data.source || '';

        if (data.relatedInteractionId) {
            const interaction = await AppDataSource.getRepository(Interaction).findOne({
                where: { id: data.relatedInteractionId }
            });
            if (interaction) {
                knowledge.relatedInteraction = interaction;
            }
        }

        return await this.knowledgeRepository.save(knowledge);
    }

    /**
     * Busca conhecimentos por tags
     */
    async findByTags(tags: string[]): Promise<Knowledge[]> {
        return await this.knowledgeRepository
            .createQueryBuilder('knowledge')
            .where('knowledge.tags @> :tags', { tags })
            .getMany();
    }

    /**
     * Busca conhecimentos por categoria
     */
    async findByCategory(category: string): Promise<Knowledge[]> {
        return await this.knowledgeRepository.find({
            where: { category }
        });
    }

    /**
     * Busca conhecimentos relacionados a uma interação
     */
    async findByInteraction(interactionId: string): Promise<Knowledge[]> {
        return await this.knowledgeRepository.find({
            where: { relatedInteraction: { id: interactionId } }
        });
    }

    /**
     * Atualiza um conhecimento existente
     */
    async updateKnowledge(id: string, data: Partial<Knowledge>): Promise<Knowledge | null> {
        const knowledge = await this.knowledgeRepository.findOne({
            where: { id }
        });

        if (!knowledge) {
            return null;
        }

        Object.assign(knowledge, data);
        return await this.knowledgeRepository.save(knowledge);
    }

    /**
     * Remove um conhecimento
     */
    async deleteKnowledge(id: string): Promise<boolean> {
        const result = await this.knowledgeRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    /**
     * Busca conhecimentos relevantes para uma consulta
     */
    async findRelevantKnowledge(query: string): Promise<Knowledge[]> {
        // Implementação básica - pode ser melhorada com busca semântica
        return await this.knowledgeRepository
            .createQueryBuilder('knowledge')
            .where('knowledge.content ILIKE :query', { query: `%${query}%` })
            .orWhere('knowledge.title ILIKE :query', { query: `%${query}%` })
            .orderBy('knowledge.confidence', 'DESC')
            .getMany();
    }
} 