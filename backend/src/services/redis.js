import { createClient } from 'redis'
import { config } from '../config.js'

let client
let connected = false

export const getRedis = () => client
export const isRedisReady = () => connected && client?.isReady

export async function connectRedis() {
  client = createClient({
    url: config.redisUrl,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false,
    },
  })

  client.on('error', (error) => {
    connected = false
    console.warn('[redis] unavailable:', error.message || 'connection failed')
  })

  try {
    await client.connect()
    connected = true
    console.log('[redis] connected')
  } catch (error) {
    connected = false
    console.warn('[redis] using in-memory fallback:', error.message)
  }
}
