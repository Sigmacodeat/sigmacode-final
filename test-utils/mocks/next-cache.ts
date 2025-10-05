// Mock für next/cache
const cache = new Map<string, { value: any; timestamp: number }>();

const DEFAULT_CACHE_TIME = 1000 * 60 * 5; // 5 minutes

export const revalidatePath = jest.fn((path: string) => {
  // In a real implementation, this would clear the cache for the given path
  return Promise.resolve(true);
});

export const revalidateTag = jest.fn((tag: string) => {
  // In a real implementation, this would clear the cache for the given tag
  return Promise.resolve(true);
});

export const unstable_cache = <T extends (...args: any[]) => any>(
  fn: T,
  keyParts: string[],
  options: {
    revalidate?: number | false;
    tags?: string[];
  } = {},
): T => {
  const key = keyParts.join(':');

  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const now = Date.now();
    const cacheKey = `${key}:${JSON.stringify(args)}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (
      cached &&
      (options.revalidate === false ||
        now - cached.timestamp < (options.revalidate || DEFAULT_CACHE_TIME) * 1000)
    ) {
      return cached.value;
    }

    // Call the function and cache the result
    const result = await fn(...args);
    cache.set(cacheKey, {
      value: result,
      timestamp: now,
    });

    return result;
  }) as T;
};

export const unstable_noStore = jest.fn((callback: () => any) => {
  // In a real implementation, this would prevent caching
  return callback();
});

export const unstable_after = jest.fn((callback: () => void) => {
  // In a real implementation, this would run the callback after the response is sent
  return callback();
});

// Test utilities
export const resetCache = () => {
  cache.clear();
  revalidatePath.mockClear();
  revalidateTag.mockClear();
  unstable_noStore.mockClear();
  unstable_after.mockClear();
};

export const getCacheEntries = () => {
  return new Map(cache);
};

export default {
  revalidatePath,
  revalidateTag,
  unstable_cache,
  unstable_noStore,
  unstable_after,
  // Test utilities
  resetCache,
  getCacheEntries,
};
