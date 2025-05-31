/* The above code is a TypeScript test suite for testing connections to a Jira server using different
authentication methods and API versions. Here's a summary of what each test case is doing: */
import axios from 'axios';
import { TestLogger } from '../utils/testLogger';
import { Buffer } from 'buffer';
import { JiraClient } from '../clients/jiraClient';

const jiraClient = new JiraClient();

describe('Testes de Conexão com Jira', () => {
  let jiraClient: JiraClient;
  let logger: TestLogger;

  beforeEach(() => {
    jiraClient = new JiraClient();
    logger = new TestLogger('teste-conexao-jira');
  });

  afterEach(() => {
    // Cleanup after each test
    logger.info('Teste finalizado');
  });

  beforeAll(async () => {
    logger = new TestLogger('teste-conexao-jira');
  });
  
  it('deve testar a conexão com o Jira usando autenticação OAuth - API v2', async () => {
    const token = process.env.JIRA_TOKEN;
    const baseUrl = process.env.JIRA_BASE_URL;
    const auth = process.env.JIRA_AUTH;
    const email = process.env.JIRA_EMAIL;

    if (!token || !baseUrl || !auth || !email) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    logger.info('Testando conexão com autenticação OAuth (API v2):');

    // Test OAuth with server info
    const oauthServerResponse = await axios.get(`${baseUrl}/rest/api/2/serverInfo`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logger.info('Resposta do servidor (OAuth, API v2):', oauthServerResponse.status);

    if (oauthServerResponse.status !== 200) {
      throw new Error('Falha na conexão com o Jira (OAuth, API v2)');
    }

    logger.info('Resposta do servidor (OAuth, API v2):', oauthServerResponse.data);

    // Test OAuth with user info
    const oauthUserResponse = await axios.get(`${baseUrl}/rest/api/2/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logger.info('Resposta do usuário (OAuth, API v2):', oauthUserResponse.data);

    if (oauthUserResponse.status !== 200) {
      throw new Error('Falha na conexão com o Jira (OAuth, API v2)');
    }

    // Test Basic auth with server info
    const basicServerResponse = await axios.get(`${baseUrl}/rest/api/2/serverInfo`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      auth: {
        username: auth.split(':')[0],
        password: auth.split(':')[1]
      }
    });

    logger.info('Resposta do servidor (Basic, API v2):', basicServerResponse.status);

    if (basicServerResponse.status !== 200) {
      throw new Error('Falha na conexão com o Jira (Basic, API v2)');
    }

    logger.info('Resposta do servidor (Basic, API v2):', basicServerResponse.data);

    // Test Basic auth with user info
    const basicUserResponse = await axios.get(`${baseUrl}/rest/api/2/user`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      auth: {
        username: auth.split(':')[0],
        password: auth.split(':')[1]
      }
    });

    logger.info('Resposta do usuário (Basic, API v2):', basicUserResponse.data);

    if (basicUserResponse.status !== 200) {
      throw new Error('Falha na conexão com o Jira (Basic, API v2)');
    }
  });
});

    
