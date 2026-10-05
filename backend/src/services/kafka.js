import { Kafka } from 'kafkajs'
import { config } from '../config.js'

let producer
let enabled = false

export async function connectKafka() {
  const kafka = new Kafka({
    clientId: config.kafkaClientId,
    brokers: config.kafkaBrokers,
    connectionTimeout: 1000,
    requestTimeout: 2000,
    retry: {
      retries: 0,
    },
  })

  producer = kafka.producer()

  try {
    await producer.connect()
    enabled = true
    console.log('[kafka] producer connected')
  } catch (error) {
    enabled = false
    console.warn('[kafka] publishing disabled:', error.message)
  }
}

export async function publishEvent(type, payload) {
  if (!enabled || !producer) return

  try {
    await producer.send({
      topic: config.kafkaTopicLinkEvents,
      messages: [
        {
          key: payload.slug || payload.userId || type,
          value: JSON.stringify({
            type,
            payload,
            createdAt: new Date().toISOString(),
          }),
        },
      ],
    })
  } catch (error) {
    console.warn('[kafka] publish failed:', error.message)
  }
}
