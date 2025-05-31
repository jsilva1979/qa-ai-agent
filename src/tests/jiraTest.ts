import { JiraClient } from '../clients/jiraClient';
import { TestLogger } from '../utils/testLogger';

describe('Testes de Integração com Jira', () => {
  let jiraClient: JiraClient;
  let logger: TestLogger;

  beforeAll(() => {
    // Verifica variáveis de ambiente necessárias
    const requiredEnvVars = ['JIRA_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN', 'JIRA_PROJECT_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Variáveis de ambiente necessárias não encontradas: ${missingVars.join(', ')}`);
    }

    jiraClient = new JiraClient();
    logger = new TestLogger('teste-jira');
  });

  it('deve conectar ao Jira com sucesso', async () => {
    try {
      const response = await jiraClient.testConnection();
      expect(response).toBeTruthy();
      logger.info('Teste de conexão com Jira bem-sucedido');
    } catch (error: any) {
      logger.error('Falha no teste de conexão com Jira', error);
      if (error.response?.status === 401) {
        throw new Error('Falha na autenticação. Por favor, verifique suas credenciais do Jira.');
      }
      throw error;
    }
  });

  it('deve criar um chamado de teste', async () => {
    try {
      const issue = await jiraClient.createTestIssue({
        summary: 'Chamado de Teste',
        description: 'Este é um chamado de teste criado por testes automatizados',
        projectKey: process.env.JIRA_PROJECT_KEY || 'TEST'
      });
      expect(issue).toBeDefined();
      expect(issue.key).toBeDefined();
      logger.info(`Chamado de teste criado: ${issue.key}`);
    } catch (error: any) {
      logger.error('Falha ao criar chamado de teste', error);
      if (error.response?.status === 400) {
        throw new Error('Requisição inválida. Por favor, verifique a chave do projeto e o tipo do chamado.');
      }
      throw error;
    }
  });
}); 