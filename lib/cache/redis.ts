// Mock Redis implementation for development
class MockRedis {
  private data: Map<string, any> = new Map();

  async get(key: string) {
    return this.data.get(key) || null;
  }

  async set(key: string, value: any) {
    this.data.set(key, value);
    return 'OK';
  }

  async del(key: string) {
    return this.data.delete(key) ? 1 : 0;
  }

  async exists(key: string) {
    return this.data.has(key) ? 1 : 0;
  }
}

const redisClient = new MockRedis();

export const getRedisCache = () => {
  return redisClient;
};

export default getRedisCache;
