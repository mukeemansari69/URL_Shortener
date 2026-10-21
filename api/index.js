import { app, initServices } from '../backend/src/app.js'

await initServices()

export default function handler(req, res) {
  const requestUrl = req.url || '/'
  const queryIndex = requestUrl.indexOf('?')
  const pathname = queryIndex === -1 ? requestUrl : requestUrl.slice(0, queryIndex)

  if (!/^\/api(?:\/|$)/.test(pathname)) {
    const query = queryIndex === -1 ? '' : requestUrl.slice(queryIndex)
    req.url = `/api${pathname === '/' ? '' : pathname}${query}`
  }

  return app(req, res)
}
