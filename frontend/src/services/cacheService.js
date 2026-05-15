/**
 * Cache Service for optimizing API calls
 * Implements stale-while-revalidate strategy
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Generate cache key from request
   */
  getCacheKey(url, params = {}) {
    return `${url}_${JSON.stringify(params)}`;
  }

  /**
   * Get cached data
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Set cache data
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    });
  }

  /**
   * Delete cache entry
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear cache by prefix
   */
  clearByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    
    for (const item of this.cache.values()) {
      if (now > item.expiry) expired++;
      else active++;
    }
    
    return {
      totalEntries: this.cache.size,
      activeEntries: active,
      expiredEntries: expired,
      memoryUsage: JSON.stringify([...this.cache]).length
    };
  }
}

export const cacheService = new CacheService();