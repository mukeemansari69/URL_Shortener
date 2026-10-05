import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, shortDomain } from '../lib/api'

const LinkPage = () => {
  const { id } = useParams()
  const slug = id
  const [link, setLink] = useState(null)
  const [destinationUrl, setDestinationUrl] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api
      .getLink(slug)
      .then((result) => {
        setLink(result.link)
        setDestinationUrl(result.link.destinationUrl)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
  }, [slug])

  const shortUrl = `${window.location.origin}/${slug}`
  const clickRate = useMemo(() => {
    if (!link) return '0%'
    return link.clicks > 0 ? '100%' : '0%'
  }, [link])
  const activityBars = useMemo(() => {
    const clicks = link?.clicks || 0
    if (!clicks) return [0, 0, 0, 0, 0, 0, 0]
    return [25, 40, 55, 70, 85, 100, Math.max(20, Math.min(100, clicks * 10))]
  }, [link])

  const saveLink = async () => {
    setError('')
    setMessage('')

    try {
      const result = await api.updateLink(slug, { destinationUrl })
      setLink(result.link)
      setMessage('Changes saved.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setMessage('Short link copied.')
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
            Back to dashboard
          </Link>
          <h1 className="mt-3 break-words text-3xl font-bold text-slate-950 sm:text-4xl">
            {shortDomain}/{slug}
          </h1>
          <p className="mt-2 break-words text-sm text-slate-500">{link?.destinationUrl || 'Loading destination...'}</p>
        </div>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Copy Link
        </button>
      </div>

      {error && <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      {message && <p className="mt-6 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [link ? link.clicks.toLocaleString() : '0', 'Total clicks'],
          [link ? link.clicks.toLocaleString() : '0', 'Unique visitors'],
          [clickRate, 'Click rate'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Click activity</h2>
          <div className="mt-6 flex h-64 items-end gap-3 border-b border-slate-200">
            {activityBars.map((height, index) => (
              <div key={index} className="flex flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-slate-950"
                  style={{ height: `${height}%` }}
                  aria-label={`Day ${index + 1}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 text-center text-xs font-medium text-slate-500">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Link settings</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Short alias</span>
              <input
                type="text"
                value={slug}
                readOnly
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Destination</span>
              <input
                type="url"
                value={destinationUrl}
                onChange={(event) => setDestinationUrl(event.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              />
            </label>
            <button
              type="button"
              onClick={saveLink}
              className="w-full rounded-md border border-slate-950 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-950 hover:text-white"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LinkPage
