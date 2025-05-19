import fs from 'fs';
import path from 'path';
import { AIAnalysisService } from '../services/aiAnalysisService';
import { TestLogger } from '../utils/testLogger';

const logger = new TestLogger();
const aiService = new AIAnalysisService();

async function testAIAnalysis() {
  try {
    // Lê o arquivo de log
    const logPath = path.join(__dirname, '../../test-data/error.log');
    const logContent = fs.readFileSync(logPath, 'utf-8');

    logger.info('🔍 Iniciando análise avançada de logs...');

    // 1. Sugestão de correção
    logger.info('\n📝 Analisando erro e sugerindo correção...');
    const errorAnalysis = await aiService.suggestErrorFix(logContent);
    logger.info('Análise do erro:', JSON.stringify(errorAnalysis, null, 2));

    // 2. Priorização de erros
    logger.info('\n🎯 Priorizando erros...');
    const logs = [
      logContent,
      'Erro de conexão com banco de dados: timeout após 30s',
      'Erro de autenticação: token inválido'
    ];
    const prioritizedErrors = await aiService.prioritizeErrors(logs);
    logger.info('Erros priorizados:', JSON.stringify(prioritizedErrors, null, 2));

    // 3. Análise de impacto em produção
    logger.info('\n📊 Analisando impacto em produção...');
    const productionImpact = await aiService.analyzeProductionImpact(logContent);
    logger.info('Impacto em produção:', JSON.stringify(productionImpact, null, 2));

    // 4. Previsão de problemas similares
    logger.info('\n🔮 Prevendo problemas similares...');
    const similarIssues = await aiService.predictSimilarIssues(logContent);
    logger.info('Problemas similares previstos:', JSON.stringify(similarIssues, null, 2));

  } catch (error) {
    logger.error('❌ Erro durante a análise:', error);
  }
}

// Executa o teste
testAIAnalysis(); 