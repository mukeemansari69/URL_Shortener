import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, saveSession } from '../lib/api'

const Auth = () => {
  const [isCreateAccount, setIsCreateAccount] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', accepted: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (isCreateAccount && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (isCreateAccount && !form.accepted) {
      setError('Please accept account updates to continue.')
      return
    }

    setLoading(true)
    try {
      const session = isCreateAccount
        ? await api.register({ name: form.name, email: form.email, password: form.password })
        : await api.login({ email: form.email, password: form.password })
      saveSession(session)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
      <div className="hidden rounded-lg border border-slate-200 bg-white p-8 shadow-sm lg:block">
        <img src="/logo.png" alt="URL Shortner logo" className="h-14 w-14 rounded-lg object-contain" />
        <h1 className="mt-6 text-4xl font-bold text-slate-950">
          {isCreateAccount ? 'Start shortening smarter.' : 'Welcome back.'}
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
          {isCreateAccount
            ? 'Create your workspace to save links, monitor clicks, and manage every campaign from one place.'
            : 'Sign in to manage your short links, review clicks, and keep campaigns organized.'}
        </p>
        <div className="mt-8 grid gap-3">
          {['Track every click', 'Manage branded aliases', 'Keep links in one place'].map((item) => (
            <div key={item} className="rounded-md bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="text-center">
          <img src="/logo.png" alt="URL Shortner logo" className="mx-auto h-12 w-12 rounded-lg object-contain" />
          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            {isCreateAccount ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isCreateAccount
              ? 'Choose how you want to start managing your links.'
              : 'Use your email and password to continue.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {isCreateAccount && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Full name</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required={isCreateAccount}
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email address</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
            />
          </label>

          {isCreateAccount && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Confirm password</span>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required={isCreateAccount}
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              />
            </label>
          )}

          {isCreateAccount && (
            <label className="flex items-start gap-3 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              <input
                name="accepted"
                type="checkbox"
                checked={form.accepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300"
              />
              <span>I agree to create an account and receive important link management updates.</span>
            </label>
          )}

          {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {loading ? 'Please wait...' : isCreateAccount ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isCreateAccount ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            onClick={() => setIsCreateAccount((current) => !current)}
            className="font-semibold text-slate-950 hover:underline"
          >
            {isCreateAccount ? 'Login' : 'Create account'}
          </button>
        </p>
      </div>
    </section>
  )
}

export default Auth
