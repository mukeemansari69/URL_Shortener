import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

dotenv.config({ path: resolve(rootDir, '.env') })
dotenv.config({ path: resolve(rootDir, 'src/.env'), override: false })
dotenv.config({ path: resolve(rootDir, 'backend/.env'), override: false })

const frontendOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

const kafkaBrokers = (process.env.KAFKA_BROKERS || '')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean)

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this-secret')) {
  throw new Error('JWT_SECRET must be set to a strong unique value in production.')
}

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigins,
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5173',
  shortDomain: process.env.SHORT_DOMAIN || 'url.app',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  // The backend owns these tables and the schema has no user-level RLS policies.
  // Never accept a public/publishable key here.
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'url-shortner-api',
  kafkaBrokers,
  kafkaTopicLinkEvents: process.env.KAFKA_TOPIC_LINK_EVENTS || 'url-shortner.link-events',
}
