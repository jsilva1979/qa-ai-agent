# QA AI Agent

Um agente de IA para análise de logs de erro usando a API Gemini do Google.

## 🚀 Funcionalidades

- Análise inteligente de logs de erro
- Sugestões de correção automáticas
- Priorização de erros
- Análise de impacto em produção
- Predição de problemas similares
- Sistema de cache para otimização
- Suporte a múltiplos formatos de log

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- Yarn ou npm
- Chave de API do Gemini

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/qa-ai-agent.git
cd qa-ai-agent
```

2. Instale as dependências:
```bash
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

## 🚀 Uso

1. Desenvolvimento:
```bash
yarn dev
```

2. Build:
```bash
yarn build
```

3. Produção:
```bash
yarn start
```

4. Testes:
```bash
yarn test
```

## 📁 Estrutura do Projeto

```
src/
├── agents/           # Agentes de IA
├── config/           # Configurações
├── services/         # Serviços principais
├── test/            # Testes
└── utils/           # Utilitários
```

## 🔑 Configuração

O projeto usa as seguintes variáveis de ambiente:

- `GEMINI_API_KEY`: Chave da API Gemini
- `CACHE_TTL`: Tempo de vida do cache em segundos
- `CACHE_MAX_SIZE`: Tamanho máximo do cache
- `LOG_LEVEL`: Nível de log (debug, info, warn, error)
- `LOG_FORMAT`: Formato do log (json, text)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Jefferson - [@seu-usuario](https://github.com/seu-usuario)

Link do Projeto: [https://github.com/seu-usuario/qa-ai-agent](https://github.com/seu-usuario/qa-ai-agent)

# 🤖 QA AI Agent - Análise Inteligente de Logs com Gemini

Este projeto é uma POC (Prova de Conceito) de um agente de IA para análise automatizada de logs de erro, com integração ao Jira. O agente utiliza a API Gemini (Google AI) seguindo o Model Context Protocol (MCP) para gerar explicações didáticas e técnicas sobre falhas capturadas em testes automatizados.

> 🔍 Projeto alinhado com a arquitetura de testes inteligentes definida pela equipe de QA e arquitetura da Trademaster.

## 📋 Estrutura do Projeto

```
src/
├── agents/         # Agentes de IA (Gemini)
│   └── geminiAgent.ts    # Implementação do MCP
├── config/         # Configurações e instruções
│   ├── agentInstructions.ts # Instruções especializadas
│   └── mcpConfig.ts      # Configuração do MCP
├── services/       # Serviços principais
│   ├── jiraClient.ts      # Integração com Jira
│   └── evidenceAnalyzer.ts # Análise de logs
├── utils/          # Utilitários
│   ├── testLogger.ts      # Sistema de logs com timestamp
│   ├── cacheManager.ts    # Gerenciamento de cache
│   └── logCompressor.ts   # Compressão de logs
├── tests/          # Testes unitários
└── index.ts        # Ponto de entrada
```

## ✅ Funcionalidades Implementadas

### Model Context Protocol (MCP)
- 🎯 Implementação do protocolo MCP para comunicação com IA
- 📝 Estruturação padronizada de prompts e respostas
- 🔄 Gerenciamento consistente de contexto
- 🎨 Formatação de saída padronizada
- 📊 Metadados estruturados para análise

### Análise de Logs
- 📄 Leitura de múltiplos arquivos de log (`.txt`)
- 🧠 Geração de explicações automatizadas com IA (Gemini)
- 📝 Salvamento das explicações em arquivos markdown
- 📦 Compressão automática dos logs para upload
- ⏰ Logs com timestamp para rastreamento de execuções
- 📊 Histórico completo de análises por arquivo

### Especialização do Agente
- 🎯 Foco em análise de logs de aplicações web
- 🔍 Identificação de padrões de erro específicos
- 📊 Análise estruturada por categorias
- 🛠️ Recomendações técnicas especializadas
- 📋 Formato padronizado de respostas
- 🔄 Diretrizes de análise consistentes

### Sistema de Cache
- 💾 Cache inteligente das respostas do Gemini
- ⏱️ TTL (Time To Live) de 24 horas
- 🔄 Reutilização de análises recentes
- 📈 Otimização de recursos da API

### Integração com Jira
- 💬 Comentários automáticos em tickets
- 📎 Upload de arquivos de log comprimidos
- 🔐 Autenticação via API Token
- ✅ Teste de conexão com o Jira

### Interface
- 💻 Interface via CLI com perguntas interativas
- 🔄 Processamento em lote de múltiplos logs
- 🚦 Tratamento de erros e feedback visual

## 🚀 Como Executar

### Pré-requisitos
1. Node.js instalado
2. Conta no Jira com API Token
3. Chave de API do Gemini

### Configuração
1. Clone o repositório
2. Instale as dependências:
```bash
yarn install
```

3. Configure as variáveis de ambiente no arquivo `.env`:
```env
JIRA_BASE_URL=https://seu-projeto.atlassian.net
JIRA_EMAIL=seu-email@exemplo.com
JIRA_API_TOKEN=seu-token-jira
GEMINI_API_KEY=sua-chave-gemini
```

### Uso
Execute o agente passando os arquivos de log e o ticket do Jira:
```bash
yarn dev <arquivo_log1> [arquivo_log2 ...] <ticket_jira>
```

Exemplo:
```bash
yarn dev test-data/erro1.txt test-data/erro2.txt PROJ-123
```

### Testando a Conexão com Jira
Para verificar se a conexão com o Jira está funcionando:
```bash
npx ts-node src/tests/testConnection.ts
```

### Teste Manual
Para executar um teste manual com um arquivo de log específico:
```bash
npx ts-node src/test/manualTest.ts
```

## 🛠️ Tecnologias Utilizadas
- TypeScript
- Node.js
- Google Gemini AI
- Jira REST API
- Yarn

## 📝 Notas
- Os logs são automaticamente comprimidos antes do upload
- As explicações são salvas em arquivos markdown com timestamp
- O agente interage com o usuário para confirmar ações no Jira
- O sistema mantém um cache das análises por 24 horas
- Cada arquivo de log tem seu próprio histórico de análises
- O agente é especializado em análise de logs de aplicações web

## 📁 Estrutura de Arquivos
- `test-data/`: Diretório para arquivos de log e análises
- `.cache/`: Cache das respostas do Gemini (não versionado)
- `src/`: Código fonte do projeto
- `.env`: Configurações de ambiente (não versionado)

## 🔧 Personalização
O agente pode ser personalizado editando o arquivo `src/config/agentInstructions.ts`:
- Adicione novos padrões de erro
- Modifique as diretrizes de análise
- Ajuste o formato das respostas
- Especifique áreas de especialização

