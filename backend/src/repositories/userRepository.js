import { getRedis, isRedisReady } from '../services/redis.js'
import { memoryStore } from './memoryStore.js'

const userKey = (id) => `user:${id}`
const emailKey = (email) => `user:email:${email.toLowerCase()}`

export async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase()

  if (isRedisReady()) {
    const redis = getRedis()
    const id = await redis.get(emailKey(normalizedEmail))
    if (!id) return null
    const user = await redis.hGetAll(userKey(id))
    return Object.keys(user).length ? user : null
  }

  const id = memoryStore.userIdsByEmail.get(normalizedEmail)
  return id ? memoryStore.usersById.get(id) : null
}

export async function createUser(user) {
  if (isRedisReady()) {
    const redis = getRedis()
    await redis.hSet(userKey(user.id), user)
    await redis.set(emailKey(user.email), user.id)
    return user
  }

  memoryStore.usersById.set(user.id, user)
  memoryStore.userIdsByEmail.set(user.email.toLowerCase(), user.id)
  return user
}
