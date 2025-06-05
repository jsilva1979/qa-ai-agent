import fs from 'fs';
import path from 'path';

export class TestLogger {
  private logDir: string;
  private logFile: string;

  constructor(testName: string) {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, `${testName}-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
    
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private log(level: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    fs.appendFileSync(this.logFile, logEntry);
    console.log(logEntry.trim());
  }

  info(...args: any[]) {
    this.log('INFO', ...args);
  }

  error(...args: any[]) {
    this.log('ERRO', ...args);
  }

  warn(...args: any[]) {
    this.log('ALERTA', ...args);
  }

  logTestResult(testName: string, result: string) {
    this.info(`Test: ${testName}, Result: ${result}`);
  }
} 