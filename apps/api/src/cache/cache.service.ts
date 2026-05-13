import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis?: Redis;

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>("REDIS_URL");
    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1
      });
    }
  }

  async getJson<T>(key: string): Promise<T | undefined> {
    if (!this.redis) {
      return undefined;
    }

    try {
      await this.ensureConnected();
      const value = await this.redis.get(key);
      return value ? (JSON.parse(value) as T) : undefined;
    } catch (error) {
      this.logger.warn(`Cache read failed for ${key}: ${(error as Error).message}`);
      return undefined;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.redis) {
      return;
    }

    const ttl = ttlSeconds ?? this.config.get<number>("CACHE_TTL_SECONDS", 2_592_000);

    try {
      await this.ensureConnected();
      await this.redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      this.logger.warn(`Cache write failed for ${key}: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.redis?.quit();
  }

  private async ensureConnected() {
    if (this.redis?.status === "wait") {
      await this.redis.connect();
    }
  }
}
