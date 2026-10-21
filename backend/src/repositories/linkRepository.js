import { getRedis, isRedisReady } from '../services/redis.js'
import { getSupabase, isSupabaseReady } from '../services/supabase.js'
import { memoryStore } from './memoryStore.js'

const linksKey = 'links'
const linkKey = (slug) => `link:${slug}`
const clickKey = (slug) => `link:${slug}:clicks`

const toNumber = (value) => Number(value || 0)

function mapDbLink(row) {
  if (!row) return null

  return {
    slug: row.slug,
    destinationUrl: row.destination_url,
    status: row.status,
    ownerId: row.owner_id,
    clicks: toNumber(row.click_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function formatLink(link, clicks = 0) {
  return {
    ...link,
    clicks: toNumber(clicks),
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  }
}

export async function slugExists(slug) {
  if (isSupabaseReady()) {
    const { data, error } = await getSupabase().from('url_shortner_links').select('slug').eq('slug', slug).maybeSingle()
    if (error) throw new Error(`Database slug lookup failed: ${error.message}`)
    return Boolean(data)
  }

  if (isRedisReady()) return Boolean(await getRedis().exists(linkKey(slug)))
  return memoryStore.linksBySlug.has(slug)
}

export async function createLink(link) {
  if (isSupabaseReady()) {
    const { data, error } = await getSupabase()
      .from('url_shortner_links')
      .insert({
        slug: link.slug,
        destination_url: link.destinationUrl,
        status: link.status,
        owner_id: link.ownerId,
        created_at: link.createdAt,
        updated_at: link.updatedAt,
      })
      .select('slug,destination_url,status,owner_id,click_count,created_at,updated_at')
      .single()

    if (error) throw new Error(`Database link create failed: ${error.message}`)
    return mapDbLink(data)
  }

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

  if (isSupabaseReady()) {
    const { data, error } = await getSupabase()
      .from('url_shortner_links')
      .update({
        ...(patch.destinationUrl ? { destination_url: patch.destinationUrl } : {}),
        ...(patch.status ? { status: patch.status } : {}),
        updated_at: updated.updatedAt,
      })
      .eq('slug', slug)
      .select('slug,destination_url,status,owner_id,click_count,created_at,updated_at')
      .single()

    if (error) throw new Error(`Database link update failed: ${error.message}`)
    return mapDbLink(data)
  }

  if (isRedisReady()) {
    await getRedis().hSet(linkKey(slug), updated)
    return formatLink(updated, clicks)
  }

  memoryStore.linksBySlug.set(slug, updated)
  return formatLink(updated, clicks)
}

export async function getLink(slug, { ownerId } = {}) {
  if (isSupabaseReady()) {
    let query = getSupabase()
      .from('url_shortner_links')
      .select('slug,destination_url,status,owner_id,click_count,created_at,updated_at')
      .eq('slug', slug)

    if (ownerId) query = query.eq('owner_id', ownerId)

    const { data, error } = await query.maybeSingle()
    if (error) throw new Error(`Database link lookup failed: ${error.message}`)
    return mapDbLink(data)
  }

  if (isRedisReady()) {
    const redis = getRedis()
    const link = await redis.hGetAll(linkKey(slug))
    if (!Object.keys(link).length) return null
    if (ownerId && link.ownerId !== ownerId) return null
    const clicks = await redis.get(clickKey(slug))
    return formatLink(link, clicks)
  }

  const link = memoryStore.linksBySlug.get(slug)
  if (!link) return null
  if (ownerId && link.ownerId !== ownerId) return null
  return formatLink(link, memoryStore.clicksBySlug.get(slug))
}

export async function listLinks({ search = '', limit = 50, ownerId } = {}) {
  const query = search.trim().toLowerCase()
  const matches = (link) => {
    if (!link) return false
    if (ownerId && link.ownerId !== ownerId) return false
    return !query || link.slug.toLowerCase().includes(query) || link.destinationUrl.toLowerCase().includes(query)
  }

  if (isSupabaseReady()) {
    let request = getSupabase()
      .from('url_shortner_links')
      .select('slug,destination_url,status,owner_id,click_count,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (ownerId) request = request.eq('owner_id', ownerId)
    if (query) request = request.or(`slug.ilike.%${query}%,destination_url.ilike.%${query}%`)

    const { data, error } = await request
    if (error) throw new Error(`Database links list failed: ${error.message}`)
    return data.map(mapDbLink)
  }

  if (isRedisReady()) {
    const redis = getRedis()
    const slugs = await redis.zRange(linksKey, 0, Math.max(limit * 5, limit) - 1, { REV: true })
    const rows = await Promise.all(slugs.map((slug) => getLink(slug)))
    return rows.filter(matches).slice(0, limit)
  }

  return memoryStore.slugs
    .map((slug) => memoryStore.linksBySlug.get(slug))
    .filter(Boolean)
    .map((link) => formatLink(link, memoryStore.clicksBySlug.get(link.slug)))
    .filter(matches)
    .slice(0, limit)
}

export async function recordClick(slug, click) {
  if (isSupabaseReady()) {
    const current = await getLink(slug)
    if (!current) return 0

    const next = current.clicks + 1
    const supabase = getSupabase()

    const { error: clickError } = await supabase.from('url_shortner_clicks').insert({
      slug,
      user_agent: click.userAgent,
      referrer: click.referrer,
      ip_address: click.ip,
      clicked_at: click.clickedAt,
    })

    if (clickError) throw new Error(`Database click create failed: ${clickError.message}`)

    const { error: updateError } = await supabase
      .from('url_shortner_links')
      .update({ click_count: next, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    if (updateError) throw new Error(`Database click count update failed: ${updateError.message}`)

    return next
  }

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

export async function getStats({ ownerId } = {}) {
  const links = await listLinks({ limit: 1000, ownerId })
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
