import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number;
}

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        db: this.configService.get<number>('REDIS_DB', 0),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.client.on('error', (error: Error) => {
        console.error('Redis Client Error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      this.client.disconnect();
    }
  }

  private ensureConnection(): boolean {
    if (!this.client || !this.isConnected) {
      console.warn('Redis client is not connected');
      return false;
    }
    return true;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.ensureConnection()) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<boolean> {
    if (!this.ensureConnection()) return false;

    try {
      const serializedValue = JSON.stringify(value);
      if (options?.ttl) {
        await this.client.setex(key, options.ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.ensureConnection()) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.ensureConnection()) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.ensureConnection()) return false;

    try {
      await this.client.flushall();
      return true;
    } catch (error) {
      console.error('Error flushing cache:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.ensureConnection()) return -1;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Error getting TTL for key ${key}:`, error);
      return -1;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.ensureConnection()) return false;

    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`Error setting expiration for key ${key}:`, error);
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number | null> {
    if (!this.ensureConnection()) return null;

    try {
      return await this.client.incrby(key, value);
    } catch (error) {
      console.error(`Error incrementing key ${key}:`, error);
      return null;
    }
  }

  async decrement(key: string, value: number = 1): Promise<number | null> {
    if (!this.ensureConnection()) return null;

    try {
      return await this.client.decrby(key, value);
    } catch (error) {
      console.error(`Error decrementing key ${key}:`, error);
      return null;
    }
  }

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.ensureConnection()) return [];

    try {
      const values = await this.client.mget(...keys);
      return values.map((value: string | null) =>
        value ? (JSON.parse(value) as T) : null,
      );
    } catch (error) {
      console.error(`Error getting multiple keys:`, error);
      return [];
    }
  }

  async mset(
    keyValuePairs: Record<string, any>,
    ttl?: number,
  ): Promise<boolean> {
    if (!this.ensureConnection()) return false;

    try {
      const serializedPairs: string[] = [];
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        serializedPairs.push(key, JSON.stringify(value));
      });

      await this.client.mset(...serializedPairs);

      if (ttl) {
        const promises = Object.keys(keyValuePairs).map((key) =>
          this.client.expire(key, ttl),
        );
        await Promise.all(promises);
      }

      return true;
    } catch (error) {
      console.error(`Error setting multiple keys:`, error);
      return false;
    }
  }
}
