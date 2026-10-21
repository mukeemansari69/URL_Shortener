import { getRedis, isRedisReady } from '../services/redis.js'
import { getSupabase, isSupabaseReady } from '../services/supabase.js'
import { memoryStore } from './memoryStore.js'

const userKey = (id) => `user:${id}`
const emailKey = (email) => `user:email:${email.toLowerCase()}`

export async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase()

  if (isSupabaseReady()) {
    const { data, error } = await getSupabase()
      .from('url_shortner_users')
      .select('id,name,email,password_hash,created_at')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (error) throw new Error(`Database user lookup failed: ${error.message}`)
    if (!data) return null

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
      createdAt: data.created_at,
    }
  }

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
  if (isSupabaseReady()) {
    const { data, error } = await getSupabase()
      .from('url_shortner_users')
      .insert({
        id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        password_hash: user.passwordHash,
        created_at: user.createdAt,
      })
      .select('id,name,email,password_hash,created_at')
      .single()

    if (error) throw new Error(`Database user create failed: ${error.message}`)

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.password_hash,
      createdAt: data.created_at,
    }
  }

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
