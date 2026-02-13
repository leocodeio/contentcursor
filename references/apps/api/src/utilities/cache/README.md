#### Cache Module

**Dependencies**

To use this package, you need to install the following dependencies:

- `@nestjs/config`
- `@nestjs/common`
- `@nestjs/core`
- `ioredis`
- `joi`
- `reflect-metadata`
- `rxjs`

You can install them using your preferred package manager. For example, with pnpm:

```bash
pnpm add @nestjs/config @nestjs/common @nestjs/core ioredis joi reflect-metadata rxjs
```

**Usage**

```typescript
// Import cache module
import { CacheModule, CacheService } from 'path';

// Add the module to the imports array of your main module
@Module({
  imports: [CacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// Use in service
@Injectable()
export class SomeService {
  constructor(private cacheService: CacheService) {}

  async getData(id: string) {
    // Try to get from cache first
    const cached = await this.cacheService.get<DataType>(`data:${id}`);
    if (cached) {
      return cached;
    }

    // If not in cache, fetch from database
    const data = await this.fetchFromDatabase(id);
    
    // Store in cache with 1 hour TTL
    await this.cacheService.set(`data:${id}`, data, { ttl: 3600 });
    
    return data;
  }
}
```

**Environment Variables**

Add these environment variables to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
REDIS_URL=redis://localhost:6379  # Alternative to individual settings
```

**Available Methods**

- `get<T>(key: string): Promise<T | null>` - Get value from cache
- `set(key: string, value: any, options?: CacheOptions): Promise<boolean>` - Set value in cache
- `del(key: string): Promise<boolean>` - Delete key from cache
- `exists(key: string): Promise<boolean>` - Check if key exists
- `flush(): Promise<boolean>` - Clear all cache
- `ttl(key: string): Promise<number>` - Get time to live for key
- `expire(key: string, seconds: number): Promise<boolean>` - Set expiration for key
- `increment(key: string, value?: number): Promise<number | null>` - Increment numeric value
- `decrement(key: string, value?: number): Promise<number | null>` - Decrement numeric value
- `mget(keys: string[]): Promise<(any | null)[]>` - Get multiple values
- `mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<boolean>` - Set multiple values

**CacheOptions Interface**

```typescript
interface CacheOptions {
  ttl?: number; // Time to live in seconds
}
```