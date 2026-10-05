import React from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Fast link management
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            Shorten links and keep every click organized.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Build clean short URLs, track performance, and manage sharing from one responsive workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="rounded-md bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Dashboard
            </Link>
            <Link
              to="/auth"
              className="rounded-md border border-slate-300 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:border-slate-950"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <img src="/logo.png" alt="URL Shortner logo" className="h-10 w-10 rounded-lg object-contain" />
            <div>
              <h2 className="text-lg font-bold text-slate-950">Create short URL</h2>
              <p className="text-sm text-slate-500">Paste your long link below.</p>
            </div>
          </div>

          <form className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Destination URL</span>
              <input
                type="url"
                placeholder="https://example.com/very-long-url"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-950"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Custom alias</span>
              <div className="mt-2 flex overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-slate-950">
                <span className="hidden border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 sm:inline">
                  url.app/
                </span>
                <input
                  type="text"
                  placeholder="summer-sale"
                  className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>
            </label>

            <button
              type="button"
              className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Shorten Link
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['12K+', 'Links created'],
          ['98%', 'Redirect uptime'],
          ['4.8M', 'Tracked clicks'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-2xl font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LandingPage
