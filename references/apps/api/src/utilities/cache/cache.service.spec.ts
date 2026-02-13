import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
      ],
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('basic operations', () => {
    const testKey = 'test:key';
    const testValue = { data: 'test value', number: 42 };

    it('should set and get a value', async () => {
      const setResult = await service.set(testKey, testValue);
      expect(setResult).toBe(true);

      const getValue = await service.get(testKey);
      expect(getValue).toEqual(testValue);
    });

    it('should return null for non-existent key', async () => {
      const getValue = await service.get('non:existent:key');
      expect(getValue).toBeNull();
    });

    it('should delete a key', async () => {
      await service.set(testKey, testValue);

      const deleteResult = await service.del(testKey);
      expect(deleteResult).toBe(true);

      const getValue = await service.get(testKey);
      expect(getValue).toBeNull();
    });

    it('should check if key exists', async () => {
      await service.set(testKey, testValue);

      const exists = await service.exists(testKey);
      expect(exists).toBe(true);

      await service.del(testKey);

      const existsAfterDelete = await service.exists(testKey);
      expect(existsAfterDelete).toBe(false);
    });
  });

  describe('TTL operations', () => {
    const testKey = 'test:ttl:key';
    const testValue = 'test value';

    it('should set value with TTL', async () => {
      const setResult = await service.set(testKey, testValue, { ttl: 60 });
      expect(setResult).toBe(true);

      const ttl = await service.ttl(testKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60);
    });

    it('should set expiration for existing key', async () => {
      await service.set(testKey, testValue);

      const expireResult = await service.expire(testKey, 30);
      expect(expireResult).toBe(true);

      const ttl = await service.ttl(testKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(30);
    });
  });

  describe('numeric operations', () => {
    const counterKey = 'test:counter';

    beforeEach(async () => {
      await service.del(counterKey);
    });

    it('should increment a value', async () => {
      const result1 = await service.increment(counterKey, 1);
      expect(result1).toBe(1);

      const result2 = await service.increment(counterKey, 5);
      expect(result2).toBe(6);
    });

    it('should decrement a value', async () => {
      await service.set(counterKey, '10');

      const result1 = await service.decrement(counterKey, 3);
      expect(result1).toBe(7);

      const result2 = await service.decrement(counterKey, 2);
      expect(result2).toBe(5);
    });
  });

  describe('bulk operations', () => {
    const keys = ['bulk:key1', 'bulk:key2', 'bulk:key3'];
    const values = ['value1', 'value2', 'value3'];

    it('should set and get multiple values', async () => {
      const keyValuePairs = {
        [keys[0]]: values[0],
        [keys[1]]: values[1],
        [keys[2]]: values[2],
      };

      const setResult = await service.mset(keyValuePairs);
      expect(setResult).toBe(true);

      const getResults = await service.mget(keys);
      expect(getResults).toEqual(values);
    });
  });

  afterEach(async () => {
    // Clean up test keys
    await service.flush();
  });
});
