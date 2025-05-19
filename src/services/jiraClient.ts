import fs from 'fs';
import { fetch, FormData } from 'undici';
import { fileFromPath } from 'formdata-node/file-from-path';
import dotenv from 'dotenv';
dotenv.config();

// Constants for Jira API
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const API_VERSION = '3'; // Using latest version 3 of the API

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  throw new Error('Variáveis de ambiente do Jira não configuradas.');
}

// Basic authentication header as recommended for scripts/bots
const authHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

// Common headers for all requests
const commonHeaders = {
  Authorization: authHeader,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

interface JiraUserResponse {
  displayName: string;
  accountId: string;
  emailAddress: string;
}

export async function testJiraConnection(): Promise<boolean> {
  try {
    // Using the /myself endpoint to test connection
    const url = `${JIRA_BASE_URL}/rest/api/${API_VERSION}/myself`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: commonHeaders
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro ao conectar no Jira: ${response.status} - ${text}`);
    }

    const data = await response.json() as JiraUserResponse;
    console.log('✅ Conexão com Jira estabelecida com sucesso!');
    console.log(`👤 Usuário conectado: ${data.displayName}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar no Jira:', error);
    return false;
  }
}

export async function commentOnJira(issueKey: string, comment: string): Promise<void> {
  const url = `${JIRA_BASE_URL}/rest/api/${API_VERSION}/issue/${issueKey}/comment`;

  const response = await fetch(url, {
    method: 'POST',
    headers: commonHeaders,
    body: JSON.stringify({ body: comment }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao comentar no Jira: ${response.status} - ${text}`);
  }

  console.log(`💬 Comentário adicionado no ticket ${issueKey}`);
}

export async function attachFileToJira(issueKey: string, filePath: string): Promise<void> {
  const url = `${JIRA_BASE_URL}/rest/api/${API_VERSION}/issue/${issueKey}/attachments`;

  const file = await fileFromPath(filePath);
  const form = new FormData();
  form.set('file', file);

  // Special headers for multipart/form-data as per documentation
  const multipartHeaders = {
    Authorization: authHeader,
    'X-Atlassian-Token': 'no-check', // Required for multipart requests
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: multipartHeaders,
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao anexar arquivo ao Jira: ${response.status} - ${text}`);
  }

  console.log(`📎 Arquivo ${file.name} anexado ao ticket ${issueKey}`);
}
