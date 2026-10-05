import express from 'express'
import { getStats } from '../repositories/linkRepository.js'

export const productPagesRouter = express.Router()

const pages = {
  'short-links': {
    eyebrow: 'Short links',
    title: 'Create clean short URLs for every campaign.',
    description:
      'Turn long destinations into simple, memorable links with custom aliases, live status, and one workspace for everyday sharing.',
    primaryMetric: 'Fast creation',
    sections: [
      {
        title: 'Custom aliases',
        body: 'Use readable slugs for campaigns, profiles, documents, and launches instead of random-looking long URLs.',
      },
      {
        title: 'Central management',
        body: 'Every created link appears in the dashboard with its destination, status, and click count.',
      },
      {
        title: 'Editable destinations',
        body: 'Update where a short URL points without changing the public link you already shared.',
      },
    ],
  },
  'click-analytics': {
    eyebrow: 'Click analytics',
    title: 'Track link performance as traffic comes in.',
    description:
      'Measure total clicks, active links, conversion signals, and recent traffic so each link has useful context.',
    primaryMetric: 'Live counters',
    sections: [
      {
        title: 'Click totals',
        body: 'Redirect requests are counted by the backend before visitors are sent to the destination.',
      },
      {
        title: 'Dashboard stats',
        body: 'The dashboard summarizes total links, total clicks, active links, and conversion from backend data.',
      },
      {
        title: 'Event stream ready',
        body: 'Click events are published to Kafka when a broker is configured, ready for downstream analytics.',
      },
    ],
  },
  'secure-redirects': {
    eyebrow: 'Secure redirects',
    title: 'Resolve short links through a controlled backend flow.',
    description:
      'Each redirect is validated server-side, counted, and only active links can send visitors to their destination.',
    primaryMetric: 'Validated routing',
    sections: [
      {
        title: 'Active-link checks',
        body: 'Inactive or missing links return a safe not-found response instead of sending visitors anywhere.',
      },
      {
        title: 'URL validation',
        body: 'New destinations must use valid HTTP or HTTPS URLs before they can be saved.',
      },
      {
        title: 'Config driven',
        body: 'API URLs, public base URL, short domain, Redis, and Kafka all come from environment variables.',
      },
    ],
  },
}

productPagesRouter.get('/product-pages/:slug', async (req, res, next) => {
  try {
    const page = pages[req.params.slug]

    if (!page) {
      res.status(404).json({ message: 'Product page not found.' })
      return
    }

    res.json({
      page,
      stats: await getStats(),
    })
  } catch (error) {
    next(error)
  }
})
