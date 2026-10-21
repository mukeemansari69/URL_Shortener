import express from 'express'
import { nanoid } from 'nanoid'
import { config } from '../config.js'
import {
  createLink,
  getLink,
  getStats,
  listLinks,
  recordClick,
  slugExists,
  updateLink,
} from '../repositories/linkRepository.js'
import { publishEvent } from '../services/kafka.js'
import { requireUser } from '../utils/auth.js'

export const linksRouter = express.Router()

const slugPattern = /^[a-zA-Z0-9_-]{3,40}$/

function normalizeUrl(value) {
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

async function makeUniqueSlug(alias) {
  if (alias) {
    if (!slugPattern.test(alias)) return null
    if (await slugExists(alias)) return false
    return alias
  }

  for (let index = 0; index < 5; index += 1) {
    const slug = nanoid(7)
    if (!(await slugExists(slug))) return slug
  }

  return nanoid(10)
}

linksRouter.get('/config', (_req, res) => {
  res.json({
    appName: 'URL Shortner',
    shortDomain: config.shortDomain,
    publicBaseUrl: config.publicBaseUrl,
  })
})

linksRouter.get('/stats', requireUser, async (req, res, next) => {
  try {
    res.json(await getStats({ ownerId: req.user.sub }))
  } catch (error) {
    next(error)
  }
})

linksRouter.get('/links', requireUser, async (req, res, next) => {
  try {
    const links = await listLinks({ search: req.query.search || '', ownerId: req.user.sub })
    res.json({ links })
  } catch (error) {
    next(error)
  }
})

linksRouter.post('/links', requireUser, async (req, res, next) => {
  try {
    const destinationUrl = normalizeUrl(req.body.destinationUrl)
    const slug = await makeUniqueSlug(req.body.slug?.trim())

    if (!destinationUrl) {
      res.status(400).json({ message: 'A valid http or https destination URL is required.' })
      return
    }

    if (slug === null) {
      res.status(400).json({ message: 'Alias must be 3-40 characters and use letters, numbers, _ or -.' })
      return
    }

    if (slug === false) {
      res.status(409).json({ message: 'This alias is already taken.' })
      return
    }

    const now = new Date().toISOString()
    const link = await createLink({
      slug,
      destinationUrl,
      status: 'Active',
      ownerId: req.user.sub,
      createdAt: now,
      updatedAt: now,
    })

    await publishEvent('link.created', link)

    res.status(201).json({
      link,
      shortUrl: `${config.publicBaseUrl.replace(/\/$/, '')}/${link.slug}`,
    })
  } catch (error) {
    next(error)
  }
})

linksRouter.get('/links/:slug', requireUser, async (req, res, next) => {
  try {
    const link = await getLink(req.params.slug, { ownerId: req.user.sub })
    if (!link) {
      res.status(404).json({ message: 'Short link not found.' })
      return
    }

    res.json({ link })
  } catch (error) {
    next(error)
  }
})

linksRouter.patch('/links/:slug', requireUser, async (req, res, next) => {
  try {
    const destinationUrl = req.body.destinationUrl ? normalizeUrl(req.body.destinationUrl) : undefined
    if (req.body.destinationUrl && !destinationUrl) {
      res.status(400).json({ message: 'A valid http or https destination URL is required.' })
      return
    }

    const existing = await getLink(req.params.slug, { ownerId: req.user.sub })
    if (!existing) {
      res.status(404).json({ message: 'Short link not found.' })
      return
    }

    const link = await updateLink(req.params.slug, {
      ...(destinationUrl ? { destinationUrl } : {}),
      ...(req.body.status ? { status: req.body.status } : {}),
    })

    await publishEvent('link.updated', link)

    res.json({ link })
  } catch (error) {
    next(error)
  }
})

linksRouter.get('/redirect/:slug', async (req, res, next) => {
  try {
    const link = await getLink(req.params.slug)
    if (!link || link.status !== 'Active') {
      res.status(404).json({ message: 'Short link not found.' })
      return
    }

    const click = {
      slug: link.slug,
      userAgent: req.headers['user-agent'] || '',
      referrer: req.headers.referer || '',
      ip: req.ip,
      clickedAt: new Date().toISOString(),
    }

    const clicks = await recordClick(link.slug, click)
    await publishEvent('link.clicked', { ...click, clicks })

    res.json({
      destinationUrl: link.destinationUrl,
      link: { ...link, clicks },
    })
  } catch (error) {
    next(error)
  }
})
