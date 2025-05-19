import fs from 'fs';
import path from 'path';

export class TestLogger {
  private logDir: string;

  constructor(logDir: string = path.join(process.cwd(), 'test-data')) {
    this.logDir = logDir;
  }

  public logTestResult(testName: string, result: string): void {
    const timestamp = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo'
    });
    
    const logContent = `## Teste executado em: ${timestamp}\n\n${result}\n\n---\n\n`;
    
    const logFileName = `${testName}.explicacao.md`;
    const logPath = path.join(this.logDir, logFileName);
    
    // Append to existing file or create new one
    fs.appendFileSync(logPath, logContent);
  }

  info(message: string, ...args: any[]) {
    console.log(`[INFO] ${message}`, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
} 