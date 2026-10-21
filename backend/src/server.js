import { app, initServices } from './app.js'
import { config } from './config.js'

await initServices()

app.listen(config.port, () => {
  console.log(`[api] listening on http://localhost:${config.port}`)
})
