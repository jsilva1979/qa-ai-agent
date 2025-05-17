import fs from 'fs';
import { fetch, FormData } from 'undici';
import { fileFromPath } from 'formdata-node/file-from-path';
import dotenv from 'dotenv';
dotenv.config();


const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;

console.log('JIRA_BASE_URL:', process.env.JIRA_BASE_URL);
console.log('JIRA_EMAIL:', process.env.JIRA_EMAIL);
console.log('JIRA_API_TOKEN:', process.env.JIRA_API_TOKEN);


if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  throw new Error('Variáveis de ambiente do Jira não configuradas.');
}

const authHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

export async function commentOnJira(issueKey: string, comment: string): Promise<void> {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/comment`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ body: comment }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao comentar no Jira: ${response.status} - ${text}`);
  }

  console.log(`💬 Comentário adicionado no ticket ${issueKey}`);
}

export async function attachFileToJira(issueKey: string, filePath: string): Promise<void> {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/attachments`;

  const file = await fileFromPath(filePath);
  const form = new FormData();
  form.set('file', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'X-Atlassian-Token': 'no-check',
    },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao anexar arquivo ao Jira: ${response.status} - ${text}`);
  }

  console.log(`📎 Arquivo ${file.name} anexado ao ticket ${issueKey}`);
}
