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
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Obtém um valor do cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Verifica cache em memória
    const cached = this.cache.get(key);
    if (cached) {
      if (cached.expiry > Date.now()) {
        return cached.value as T;
      }
      this.cache.delete(key);
    }

    // Verifica cache em disco
    const filePath = this.getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (data.expiry > Date.now()) {
          // Atualiza cache em memória
          this.cache.set(key, { value: data.value, expiry: data.expiry });
          return data.value as T;
        }
        // Remove arquivo expirado
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Erro ao ler cache:', error);
      }
    }

    return null;
  }

  /**
   * Define um valor no cache
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const expiry = Date.now() + (ttl * 1000);
    
    // Atualiza cache em memória
    this.cache.set(key, { value, expiry });

    // Atualiza cache em disco
    const filePath = this.getCacheFilePath(key);
    try {
      fs.writeFileSync(filePath, JSON.stringify({ value, expiry }));
    } catch (error) {
      console.error('Erro ao escrever cache:', error);
    }
  }

  /**
   * Remove um valor do cache
   */
  async delete(key: string): Promise<void> {
    // Remove do cache em memória
    this.cache.delete(key);

    // Remove do cache em disco
    const filePath = this.getCacheFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Erro ao remover cache:', error);
      }
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    // Limpa cache em memória
    this.cache.clear();

    // Limpa cache em disco
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }
} 