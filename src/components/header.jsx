import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Analytics', path: '/product/click-analytics' },
]

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link to="/" className="flex items-center gap-3">
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <Link
            to="/auth"
            className="rounded-md border border-slate-950 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-950 hover:text-white"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header
