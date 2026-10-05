import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import Header from '../components/header'

const AppLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/logo.png"
                alt="URL Shortner logo"
                className="h-10 w-10 rounded-lg object-contain"
              />
              <div>
                <p className="text-lg font-bold leading-none text-slate-950">URL Shortner</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Smart links
                </p>
              </div>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
              Create short, clean, and trackable links for campaigns, profiles, and everyday sharing.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-950">Pages</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
              <Link className="transition hover:text-slate-950" to="/">
                Home
              </Link>
              <Link className="transition hover:text-slate-950" to="/dashboard">
                Dashboard
              </Link>
              <Link className="transition hover:text-slate-950" to="/auth">
                Login
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-950">Product</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
              <span>Short links</span>
              <span>Click analytics</span>
              <span>Secure redirects</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-5 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>© {new Date().getFullYear()} URL Shortner. All rights reserved.</p>
            <p>Built for fast and simple link sharing.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout
