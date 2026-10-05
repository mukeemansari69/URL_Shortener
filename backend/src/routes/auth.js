import bcrypt from 'bcryptjs'
import express from 'express'
import { nanoid } from 'nanoid'
import { createUser, findUserByEmail } from '../repositories/userRepository.js'
import { publishEvent } from '../services/kafka.js'
import { signToken } from '../utils/auth.js'

export const authRouter = express.Router()

authRouter.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email and password are required.' })
      return
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      res.status(409).json({ message: 'Email already exists.' })
      return
    }

    const user = await createUser({
      id: nanoid(12),
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    })

    await publishEvent('user.created', { userId: user.id, email: user.email })

    res.status(201).json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' })
      return
    }

    const user = await findUserByEmail(email)
    const validPassword = user ? await bcrypt.compare(password, user.passwordHash) : false

    if (!validPassword) {
      res.status(401).json({ message: 'Invalid email or password.' })
      return
    }

    await publishEvent('user.logged_in', { userId: user.id, email: user.email })

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    next(error)
  }
})
