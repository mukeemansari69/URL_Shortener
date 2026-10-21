import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { authRouter } from './routes/auth.js'
import { linksRouter } from './routes/links.js'
import { productPagesRouter } from './routes/productPages.js'
import { connectKafka } from './services/kafka.js'
import { connectRedis } from './services/redis.js'
import { connectSupabase } from './services/supabase.js'
import { optionalUser } from './utils/auth.js'

export const app = express()

let servicesPromise

export function initServices() {
  if (!servicesPromise) {
    servicesPromise = Promise.all([connectSupabase(), connectRedis(), connectKafka()])
  }

  return servicesPromise
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.frontendOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked origin: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(optionalUser)

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'url-shortner-backend' })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'url-shortner-backend' })
})

const apiRouter = express.Router()
apiRouter.use('/auth', authRouter)
apiRouter.use(linksRouter)
apiRouter.use(productPagesRouter)

// Render receives /api/... URLs from the browser. Vercel function rewrites can
// strip that prefix, so support both forms of the API routes.
app.use('/api', apiRouter)
app.use(apiRouter)

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Something went wrong.' })
})
