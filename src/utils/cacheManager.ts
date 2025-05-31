import fs from 'fs';
import path from 'path';

export class CacheManager {
  private cacheDir: string;
  private cache: Map<string, { value: any; expiry: number }>;

  constructor(cacheDir: string = path.join(process.cwd(), '.cache')) {
    this.cacheDir = cacheDir;
    this.cache = new Map();
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    try {
      // Verifica se o diretório existe
      if (!fs.existsSync(this.cacheDir)) {
        console.log(`📁 Criando diretório de cache: ${this.cacheDir}`);
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      // Verifica se temos permissão de escrita
      const testFile = path.join(this.cacheDir, '.test');
      try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('✅ Permissões de cache verificadas com sucesso');
      } catch (error) {
        console.error('❌ Erro ao verificar permissões de cache:', error);
        throw new Error('Sem permissão para escrever no diretório de cache');
      }
    } catch (error) {
      console.error('❌ Erro ao configurar cache:', error);
      throw error;
    }
  }

  /**
   * Sanitiza a chave do cache para ser usada como nome de arquivo
   */
  private sanitizeKey(key: string): string {
    // Remove caracteres inválidos para nomes de arquivo no Windows
    const sanitized = key
      .replace(/[<>:"/\\|?*]/g, '_') // Substitui caracteres inválidos por underscore
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .replace(/[^\x00-\x7F]/g, '') // Remove caracteres não-ASCII
      .substring(0, 50); // Limita o tamanho do nome do arquivo

    // Adiciona um hash para garantir unicidade
    const hash = require('crypto')
      .createHash('md5')
      .update(key)
      .digest('hex')
      .substring(0, 8);

    return `${sanitized}_${hash}`;
  }

  /**
   * Obtém um valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Verifica cache em memória
      const cached = this.cache.get(key);
      if (cached) {
        if (cached.expiry > Date.now()) {
          // Valida o valor em cache
          if (this.isValidCachedValue(cached.value)) {
            return cached.value as T;
          }
          this.cache.delete(key);
        } else {
          this.cache.delete(key);
        }
      }

      // Verifica cache em disco
      const filePath = this.getCacheFilePath(key);
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          if (data.expiry > Date.now() && this.isValidCachedValue(data.value)) {
            // Atualiza cache em memória
            this.cache.set(key, { value: data.value, expiry: data.expiry });
            return data.value as T;
          }
          // Remove arquivo expirado ou inválido
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error('❌ Erro ao ler cache:', error);
          // Remove arquivo corrompido
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao obter do cache:', error);
      return null;
    }
  }

  /**
   * Valida se o valor em cache é válido
   */
  private isValidCachedValue(value: any): boolean {
    if (!value) return false;
    
    // Verifica se é uma resposta do agente
    if (typeof value === 'object') {
      // Verifica se tem o conteúdo básico
      if (!value.content || typeof value.content !== 'string') {
        return false;
      }
      
      // Verifica se tem as métricas de uso
      if (value.tokenUsage) {
        const { promptTokens, completionTokens, totalTokens, model } = value.tokenUsage;
        if (typeof promptTokens !== 'number' || 
            typeof completionTokens !== 'number' || 
            typeof totalTokens !== 'number' || 
            typeof model !== 'string') {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Define um valor no cache
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      const expiry = Date.now() + (ttl * 1000);
      
      // Atualiza cache em memória
      this.cache.set(key, { value, expiry });

      // Atualiza cache em disco
      const filePath = this.getCacheFilePath(key);
      const data = JSON.stringify({ value, expiry });
      
      // Garante que o diretório existe antes de escrever
      this.ensureCacheDir();
      
      console.log(`💾 Salvando cache em: ${filePath}`);
      fs.writeFileSync(filePath, data);
      console.log('✅ Cache salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao escrever cache:', error);
      throw error;
    }
  }

  /**
   * Remove um valor do cache
   */
  async delete(key: string): Promise<void> {
    try {
      // Remove do cache em memória
      this.cache.delete(key);

      // Remove do cache em disco
      const filePath = this.getCacheFilePath(key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('❌ Erro ao remover cache:', error);
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    try {
      // Limpa cache em memória
      this.cache.clear();

      // Limpa cache em disco
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  private getCacheFilePath(key: string): string {
    const sanitizedKey = this.sanitizeKey(key);
    return path.join(this.cacheDir, `${sanitizedKey}.json`);
  }
} 