import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class LogCompressor {
  private compressionLevel: number;

  constructor(compressionLevel: number = 6) {
    this.compressionLevel = compressionLevel;
  }

  async compressLog(logContent: string): Promise<Buffer> {
    try {
      return await gzip(logContent, { level: this.compressionLevel });
    } catch (error) {
      console.error('Erro ao comprimir log:', error);
      throw new Error('Falha ao comprimir o conteúdo do log');
    }
  }

  async decompressLog(compressedContent: Buffer): Promise<string> {
    try {
      const decompressed = await gunzip(compressedContent);
      return decompressed.toString('utf-8');
    } catch (error) {
      console.error('Erro ao descomprimir log:', error);
      throw new Error('Falha ao descomprimir o conteúdo do log');
    }
  }

  async compressAndSaveLog(logContent: string, outputPath: string): Promise<void> {
    try {
      const compressed = await this.compressLog(logContent);
      fs.writeFileSync(outputPath, compressed);
    } catch (error) {
      console.error('Erro ao salvar log comprimido:', error);
      throw new Error('Falha ao salvar o log comprimido');
    }
  }

  async readAndDecompressLog(filePath: string): Promise<string> {
    try {
      const compressed = fs.readFileSync(filePath);
      return await this.decompressLog(compressed);
    } catch (error) {
      console.error('Erro ao ler log comprimido:', error);
      throw new Error('Falha ao ler o log comprimido');
    }
  }
} 