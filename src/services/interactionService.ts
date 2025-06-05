import { AppDataSource } from '../config/database';
import { Interaction } from '../models/Interaction';
import { Between } from 'typeorm';

export class InteractionService {
    private interactionRepository = AppDataSource.getRepository(Interaction);

    /**
     * Salva uma nova interação
     */
    async saveInteraction(data: {
        userInput: string;
        aiResponse: string;
        metadata?: Record<string, any>;
    }): Promise<Interaction> {
        const interaction = new Interaction();
        interaction.userQuery = data.userInput;
        interaction.aiResponse = data.aiResponse;
        interaction.metadata = JSON.stringify(data.metadata || {});
        interaction.context = '';

        return await this.interactionRepository.save(interaction);
    }

    /**
     * Busca uma interação pelo ID
     */
    async findById(id: string): Promise<Interaction | null> {
        return await this.interactionRepository.findOne({
            where: { id }
        });
    }

    /**
     * Busca interações por período
     */
    async findByDateRange(startDate: Date, endDate: Date): Promise<Interaction[]> {
        return await this.interactionRepository.find({
            where: {
                createdAt: Between(startDate, endDate)
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    /**
     * Busca interações por conteúdo
     */
    async findByContent(query: string): Promise<Interaction[]> {
        return await this.interactionRepository
            .createQueryBuilder('interaction')
            .where('interaction.userQuery ILIKE :query', { query: `%${query}%` })
            .orWhere('interaction.aiResponse ILIKE :query', { query: `%${query}%` })
            .orderBy('interaction.createdAt', 'DESC')
            .getMany();
    }

    /**
     * Atualiza uma interação existente
     */
    async updateInteraction(id: string, data: Partial<Interaction>): Promise<Interaction | null> {
        const interaction = await this.interactionRepository.findOne({
            where: { id }
        });

        if (!interaction) {
            return null;
        }

        Object.assign(interaction, data);
        return await this.interactionRepository.save(interaction);
    }

    /**
     * Remove uma interação
     */
    async deleteInteraction(id: string): Promise<boolean> {
        const result = await this.interactionRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
} 