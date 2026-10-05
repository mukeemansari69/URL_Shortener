import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'

const fallbackTitles = {
  'short-links': 'Short links',
  'click-analytics': 'Click analytics',
  'secure-redirects': 'Secure redirects',
}

const ProductPage = () => {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getProductPage(slug)
      .then((result) => {
        setPage(result.page)
        setStats(result.stats)
        setError('')
      })
      .catch((requestError) => {
        setPage(null)
        setStats(null)
        setError(requestError.message)
      })
  }, [slug])

  const metricCards = useMemo(
    () => [
      { label: 'Total links', value: stats ? stats.totalLinks.toLocaleString() : '0' },
      { label: 'Total clicks', value: stats ? stats.totalClicks.toLocaleString() : '0' },
      { label: 'Active links', value: stats ? stats.activeLinks.toLocaleString() : '0' },
    ],
    [stats],
  )

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <Link to="/" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
            Back to home
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {page?.eyebrow || 'Product'}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold text-slate-950 sm:text-5xl">
            {page?.title || fallbackTitles[slug] || 'Product'}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {error || page?.description || 'Loading product details from the backend.'}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create Link
            </Link>
            <Link
              to="/dashboard"
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:border-slate-950"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {page?.primaryMetric || 'Live backend data'}
          </p>
          <div className="mt-5 grid gap-3">
            {metricCards.map((item) => (
              <div key={item.label} className="rounded-md bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {(page?.sections || []).map((section) => (
          <article key={section.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProductPage
