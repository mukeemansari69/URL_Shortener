import { getRedis, isRedisReady } from '../services/redis.js'
import { memoryStore } from './memoryStore.js'

const linksKey = 'links'
const linkKey = (slug) => `link:${slug}`
const clickKey = (slug) => `link:${slug}:clicks`

const toNumber = (value) => Number(value || 0)

function formatLink(link, clicks = 0) {
  return {
    ...link,
    clicks: toNumber(clicks),
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  }
}

export async function slugExists(slug) {
  if (isRedisReady()) return Boolean(await getRedis().exists(linkKey(slug)))
  return memoryStore.linksBySlug.has(slug)
}

export async function createLink(link) {
  if (isRedisReady()) {
    const redis = getRedis()
    await redis.hSet(linkKey(link.slug), link)
    await redis.zAdd(linksKey, { score: Date.now(), value: link.slug })
    return formatLink(link)
  }

  memoryStore.linksBySlug.set(link.slug, link)
  memoryStore.slugs.unshift(link.slug)
  return formatLink(link)
}

export async function updateLink(slug, patch) {
  const existing = await getLink(slug)
  if (!existing) return null

  const { clicks, ...storedExisting } = existing
  const updated = {
    ...storedExisting,
    ...patch,
    slug,
    updatedAt: new Date().toISOString(),
  }

  if (isRedisReady()) {
    await getRedis().hSet(linkKey(slug), updated)
    return formatLink(updated, clicks)
  }

  memoryStore.linksBySlug.set(slug, updated)
  return formatLink(updated, clicks)
}

export async function getLink(slug) {
  if (isRedisReady()) {
    const redis = getRedis()
    const link = await redis.hGetAll(linkKey(slug))
    if (!Object.keys(link).length) return null
    const clicks = await redis.get(clickKey(slug))
    return formatLink(link, clicks)
  }

  const link = memoryStore.linksBySlug.get(slug)
  if (!link) return null
  return formatLink(link, memoryStore.clicksBySlug.get(slug))
}

export async function listLinks({ search = '', limit = 50 } = {}) {
  const query = search.trim().toLowerCase()

  if (isRedisReady()) {
    const redis = getRedis()
    const slugs = await redis.zRange(linksKey, 0, limit - 1, { REV: true })
    const rows = await Promise.all(slugs.map((slug) => getLink(slug)))
    return rows.filter((link) => {
      if (!link) return false
      return !query || link.slug.toLowerCase().includes(query) || link.destinationUrl.toLowerCase().includes(query)
    })
  }

  return memoryStore.slugs
    .map((slug) => memoryStore.linksBySlug.get(slug))
    .filter(Boolean)
    .map((link) => formatLink(link, memoryStore.clicksBySlug.get(link.slug)))
    .filter((link) => !query || link.slug.toLowerCase().includes(query) || link.destinationUrl.toLowerCase().includes(query))
    .slice(0, limit)
}

export async function recordClick(slug, click) {
  if (isRedisReady()) {
    const redis = getRedis()
    const total = await redis.incr(clickKey(slug))
    await redis.lPush(`link:${slug}:activity`, JSON.stringify(click))
    await redis.lTrim(`link:${slug}:activity`, 0, 99)
    return total
  }

  const next = (memoryStore.clicksBySlug.get(slug) || 0) + 1
  memoryStore.clicksBySlug.set(slug, next)
  return next
}

export async function getStats() {
  const links = await listLinks({ limit: 1000 })
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)
  const activeLinks = links.filter((link) => link.status === 'Active').length
  const conversion = totalClicks > 0 && links.length > 0 ? `${Math.min(100, Math.round((activeLinks / links.length) * 100))}%` : '0%'

  return {
    totalLinks: links.length,
    totalClicks,
    activeLinks,
    conversion,
  }
}
