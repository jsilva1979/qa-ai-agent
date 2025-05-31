import axios from 'axios';

export class JiraClient {
  private baseUrl: string;
  private auth: { username: string; password: string };

  constructor() {
    const url = process.env.JIRA_URL;
    const email = process.env.JIRA_EMAIL;
    const token = process.env.JIRA_API_TOKEN;
    const auth = process.env.JIRA_AUTH;

    if (!url || !email || !token) {
      throw new Error('Credenciais do Jira não configuradas corretamente. Verifique as variáveis de ambiente JIRA_URL, JIRA_EMAIL e JIRA_API_TOKEN.');
    }

    // Remove trailing slash if present
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Validate URL format
    if (!this.baseUrl.startsWith('https://') || !this.baseUrl.includes('.atlassian.net')) {
      throw new Error('URL do Jira inválida. Deve começar com https:// e terminar com .atlassian.net');
    }

    this.auth = {
      username: email,
      password: token
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/rest/api/2/myself`, {
        auth: this.auth,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(this.auth.username + ':' + this.auth.password).toString('base64')}`
        }
      });
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('Falha na autenticação do Jira. Verifique se o email e o token de API estão corretos.');
      } else {
        console.error('Falha ao conectar ao Jira:', error.message);
      }
      return false;
    }
  }

  async createTestIssue(issueData: {
    summary: string;
    description: string;
    projectKey: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        {
          fields: {
            project: {
              key: issueData.projectKey
            },
            summary: issueData.summary,
            description: issueData.description,
            issuetype: {
              name: 'Task'
            }
          }
        },
        {
          auth: this.auth,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Falha na autenticação do Jira. Verifique se o email e o token de API estão corretos.');
      } else if (error.response?.status === 400) {
        throw new Error('Requisição inválida. Verifique se a chave do projeto e o tipo do chamado estão corretos.');
      }
      throw error;
    }
  }
} 