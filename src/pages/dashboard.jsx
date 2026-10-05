import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, shortDomain } from '../lib/api'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [links, setLinks] = useState([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsResult, linksResult] = await Promise.all([api.getStats(), api.getLinks(search)])
        setStats(statsResult)
        setLinks(linksResult.links)
        setError('')
      } catch (requestError) {
        setError(requestError.message)
      }
    }

    loadDashboard()
  }, [search])

  const statCards = useMemo(
    () => [
      { label: 'Total Links', value: stats ? stats.totalLinks.toLocaleString() : '0' },
      { label: 'Total Clicks', value: stats ? stats.totalClicks.toLocaleString() : '0' },
      { label: 'Active Links', value: stats ? stats.activeLinks.toLocaleString() : '0' },
      { label: 'Conversion', value: stats?.conversion || '0%' },
    ],
    [stats],
  )

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Manage your short links</h1>
        </div>
        <Link
          to="/"
          className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Create Link
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Recent links</h2>
            <p className="mt-1 text-sm text-slate-500">Your latest short URLs and traffic.</p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search links"
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-950 sm:w-64"
          />
        </div>

        <div className="divide-y divide-slate-200">
          {error && <p className="p-5 text-sm font-medium text-red-700">{error}</p>}
          {!error && links.length === 0 && <p className="p-5 text-sm text-slate-500">No links found.</p>}
          {links.map((item) => (
            <div key={item.slug} className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div className="min-w-0">
                <Link to={`/link/${item.slug}`} className="font-semibold text-slate-950 hover:underline">
                  {shortDomain}/{item.slug}
                </Link>
                <p className="mt-1 truncate text-sm text-slate-500">{item.destinationUrl}</p>
              </div>
              <div className="text-sm text-slate-600 md:text-right">
                <span className="font-semibold text-slate-950">{item.clicks.toLocaleString()}</span> clicks
              </div>
              <span className="w-fit rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Dashboard
