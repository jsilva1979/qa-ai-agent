import axios from 'axios';
import dotenv from 'dotenv';
import { TestLogger } from '../utils/testLogger';

dotenv.config();

interface SlackTextObject {
  type: "plain_text" | "mrkdwn";
  text: string;
  emoji?: boolean;
}

interface SlackBlock {
  type: "header" | "divider" | "section";
  text?: SlackTextObject;
}

export class SlackClient {
  private webhookUrl: string;
  private logger: TestLogger;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.logger = new TestLogger('slack-client');

    if (!this.webhookUrl) {
      throw new Error('❌ URL do Webhook do Slack não encontrada no .env (SLACK_WEBHOOK_URL)');
    }
  }

  /**
   * Escapa caracteres especiais para uso em mrkdwn do Slack
   */
  private escapeMrkdwn(text: string): string {
    // Como a análise já virá pré-formatada, vamos focar em escapar apenas o necessário para o payload geral,
    // mas o markdown dentro da análise deve ser gerado pelo agente.
    // No entanto, para garantir segurança e compatibilidade, vamos manter a função,
    // embora possa não ser estritamente necessária para o conteúdo markdown vindo do agente.
     return text; // Mantém a função mas desabilita o escape para markdown gerado externamente
  }

  /**
   * Envia uma mensagem para o canal do Slack via webhook
   */
  async sendMessage(message: string): Promise<boolean> {
    try {
      const payload = {
        text: message
      };
      console.log('📤 Enviando payload para Slack webhook (sendMessage):', JSON.stringify(payload, null, 2));
      const response = await axios.post(this.webhookUrl, payload);

      if (response.status === 200) {
        this.logger.info('✅ Mensagem enviada com sucesso para o Slack');
        return true;
      }

      this.logger.error('❌ Erro ao enviar mensagem:', response.status, response.data);
      return false;
    } catch (error: any) {
      this.logger.error('❌ Erro ao enviar mensagem para o Slack:', error.message);
      return false;
    }
  }

  /**
   * Envia uma análise de erro formatada para o Slack via webhook
   */
  async sendErrorAnalysis(analysis: string): Promise<boolean> {
    try {
      // O título da análise pode ser extraído da primeira linha se o agente seguir o formato ## Título
      // Ou podemos usar um título genérico se o agente apenas enviar o markdown dos blocos diretamente.
      // Com base no novo prompt, o agente envia a análise formatada, incluindo o título.
      // Vamos apenas extrair o título para o texto de fallback e log,
      // e enviar o conteúdo completo da análise como um bloco markdown.

      const firstLine = analysis.split('\\n')[0];
      const titleMatch = firstLine.match(/^##\s*(.*)$/);
      const title = titleMatch ? titleMatch[1].trim() : 'Análise de Erro';


      // Cria os blocos para o Slack usando a análise já formatada pelo agente
      const blocks: SlackBlock[] = [
        {
          type: "section", // Usamos 'section' para o corpo principal do markdown
          text: {
            type: "mrkdwn",
            text: analysis // Usa a análise já formatada pelo agente diretamente
          }
        }
        // Não precisamos mais adicionar cabeçalhos e divisores aqui, pois o agente os incluirá no markdown
      ];

      const payload = {
        text: `Análise de erro: ${title}`, // Texto de fallback
        blocks: blocks
      };

      console.log('📤 Enviando payload para Slack webhook (sendErrorAnalysis):', JSON.stringify(payload, null, 2));

      const response = await axios.post(this.webhookUrl, payload);

      if (response.status === 200) {
        this.logger.info('✅ Análise enviada com sucesso para o Slack');
        return true;
      }

      this.logger.error('❌ Erro ao enviar análise:', response.status, response.data);
      return false;
    } catch (error: any) {
      this.logger.error('❌ Erro ao enviar análise para o Slack:', error.message);
      return false;
    }
  }
} 