import { JiraClient } from '../clients/jiraClient';

describe('Jira Tests', () => {
  let jiraClient: JiraClient;

  beforeEach(() => {
    jiraClient = new JiraClient();
  });

  it('should connect to Jira', async () => {
    const isConnected = await jiraClient.testConnection();
    expect(isConnected).toBe(true);
  });
}); 