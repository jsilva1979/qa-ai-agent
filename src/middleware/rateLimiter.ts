import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../services/RedisService';
import { logger } from '../utils/logger';

const redisService = new RedisService();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Max number of requests per window
  message?: string;  // Error message
  statusCode?: number; // HTTP status code for rate limit exceeded
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  statusCode: 429
};

export function rateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `ratelimit:${ip}`;

      // Get current count
      const current = await redisService.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= finalConfig.max) {
        logger.warn('Rate limit exceeded', { ip });
        return res.status(finalConfig.statusCode!).json({
          error: finalConfig.message
        });
      }

      // Increment counter
      await redisService.set(key, (count + 1).toString(), Math.ceil(finalConfig.windowMs / 1000));

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', finalConfig.max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, finalConfig.max - count - 1));
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000 + finalConfig.windowMs / 1000));

      next();
    } catch (error) {
      logger.error('Rate limiter error', { error: (error as Error).message });
      // On error, allow the request to proceed
      next();
    }
  };
}

// Specialized rate limiters for different endpoints
export const authRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: 'Too many login attempts, please try again later.'
});

export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded, please try again later.'
}); 