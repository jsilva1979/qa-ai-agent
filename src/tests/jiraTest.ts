import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL!;
const JIRA_EMAIL = process.env.JIRA_EMAIL!;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN!;
const issueKey = 'CQ-1'; // <- Altere para um ticket que existe no seu projeto
const comment = '✅ Teste automático de comentário no Jira via script.';

async function testJiraComment() {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/comment`;

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: comment }),
  });

  if (response.ok) {
    console.log(`✅ Sucesso! Comentário adicionado no ticket ${issueKey}`);
  } else {
    const text = await response.text();
    console.error(`❌ Falha ao comentar no Jira: ${response.status} - ${text}`);
  }
}

testJiraComment();
