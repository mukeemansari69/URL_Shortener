import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5173',
  shortDomain: process.env.SHORT_DOMAIN || 'url.app',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'url-shortner-api',
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean),
  kafkaTopicLinkEvents: process.env.KAFKA_TOPIC_LINK_EVENTS || 'url-shortner.link-events',
}
