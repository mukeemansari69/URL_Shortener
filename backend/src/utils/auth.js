import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn },
  )
}

export function optionalUser(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    next()
    return
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret)
  } catch {
    req.user = null
  }

  next()
}
