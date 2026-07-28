const { createClient } = require('redis')

let client = null

const connectRedis = async () => {
  if (client) return client
  try {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Max retries')
          return Math.min(retries * 100, 3000)
        },
      },
    })
    client.on('error', (err) => console.error('[Redis] Error:', err.message))
    await client.connect()
    console.log('[Redis] Connected ✓')
  } catch (e) {
    console.warn('[Redis] Falling back to in-memory cache:', e.message)
    client = null
  }
  return client
}

const memCache = new Map()

const cache = {
  get: async (key) => {
    if (client?.isOpen) {
      try { return await client.get(key) } catch (_) {}
    }
    const entry = memCache.get(key)
    if (!entry) return null
    if (entry.expiresAt && Date.now() > entry.expiresAt) { memCache.delete(key); return null }
    return entry.value
  },
  set: async (key, value, ttlSeconds = 60) => {
    if (client?.isOpen) {
      try { await client.set(key, value, { EX: ttlSeconds }); return } catch (_) {}
    }
    memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  },
  del: async (key) => {
    if (client?.isOpen) {
      try { await client.del(key) } catch (_) {}
    }
    memCache.delete(key)
  },
}

module.exports = { connectRedis, cache, getClient: () => client }
