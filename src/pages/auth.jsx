import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, isAuthenticated } from '../lib/api'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  otp: '',
  newPassword: '',
  accepted: false,
}

const copyByMode = {
  login: {
    title: 'Sign in to your account',
    subtitle: 'Use your email and password to continue.',
    hero: 'Welcome back.',
    button: 'Login',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Add email and optional mobile number for verification.',
    hero: 'Start shortening smarter.',
    button: 'Create Account',
  },
  forgot: {
    title: 'Reset your password',
    subtitle: 'Password reset is not enabled yet for this backend.',
    hero: 'Recover access.',
    button: 'Send Reset Email',
  },
  sms: {
    title: 'Verify by mobile',
    subtitle: 'SMS login is not enabled yet for this backend.',
    hero: 'Mobile verification.',
    button: 'Send SMS Code',
  },
}

const Auth = () => {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [smsSent, setSmsSent] = useState(false)
  const [smsVerified, setSmsVerified] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const isCreateAccount = mode === 'signup'
  const content = copyByMode[mode]

  useEffect(() => {
    if (isAuthenticated() && mode !== 'sms') navigate('/dashboard')
  }, [mode, navigate])

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setMessage('')
    setSmsSent(false)
    setSmsVerified(false)
    setForm((current) => ({ ...emptyForm, email: current.email, phone: current.phone }))
  }

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSmsFlow = async () => {
    if (!form.phone) {
      setError('Enter your mobile number with country code, like +923001234567.')
      return
    }

    if (!smsSent) {
      const result = await api.sendPhoneOtp(form.phone)
      setSmsSent(true)
      setMessage(result.message)
      return
    }

    if (!form.otp) {
      setError('Enter the SMS code.')
      return
    }

    const result = await api.verifyPhoneOtp({ phone: form.phone, token: form.otp })
    setSmsVerified(Boolean(result.session))
    setMessage('Mobile number verified.')

    if (form.newPassword) {
      await api.updatePassword(form.newPassword)
      navigate('/dashboard')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'forgot') {
      setLoading(true)
      try {
        const result = await api.requestPasswordReset(form.email)
        setMessage(result.message)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
      return
    }

    if (mode === 'sms') {
      setLoading(true)
      try {
        await handleSmsFlow()
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
      return
    }

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
      const result = isCreateAccount
        ? await api.register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
        : await api.login({ email: form.email, password: form.password })

      if (result.token) navigate('/dashboard')
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
        <h1 className="mt-6 text-4xl font-bold text-slate-950">{content.hero}</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
          Create your workspace, verify users by email or mobile, monitor clicks, and manage every campaign from one place.
        </p>
        <div className="mt-8 grid gap-3">
          {['Email verification', 'Mobile OTP ready', 'Password reset support'].map((item) => (
            <div key={item} className="rounded-md bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="text-center">
          <img src="/logo.png" alt="URL Shortner logo" className="mx-auto h-12 w-12 rounded-lg object-contain" />
          <h2 className="mt-5 text-2xl font-bold text-slate-950">{content.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{content.subtitle}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1 text-sm font-semibold sm:grid-cols-4">
          {[
            ['login', 'Login'],
            ['signup', 'Register'],
            ['forgot', 'Reset'],
            ['sms', 'SMS'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => switchMode(key)}
              className={`rounded px-3 py-2 transition ${mode === key ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
            >
              {label}
            </button>
          ))}
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

          {mode !== 'sms' && (
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
          )}

          {(isCreateAccount || mode === 'sms') && (
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Mobile number</span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+923001234567"
                required={mode === 'sms'}
                className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              />
            </label>
          )}

          {(mode === 'login' || isCreateAccount) && (
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
          )}

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

          {mode === 'sms' && smsSent && (
            <>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">SMS code</span>
                <input
                  name="otp"
                  type="text"
                  value={form.otp}
                  onChange={handleChange}
                  placeholder="123456"
                  required
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">New password for reset</span>
                <input
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Optional after SMS verify"
                  className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                />
              </label>
            </>
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
          {message && <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p>}
          {smsVerified && <p className="rounded-md bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">SMS verification complete.</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Please wait...' : smsSent && mode === 'sms' ? 'Verify SMS Code' : content.button}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-slate-500">
          <button
            type="button"
            onClick={() => switchMode(isCreateAccount ? 'login' : 'signup')}
            className="font-semibold text-slate-950 hover:underline"
          >
            {isCreateAccount ? 'Already have an account? Login' : 'New here? Create account'}
          </button>
        </div>
      </div>
    </section>
  )
}

export default Auth
