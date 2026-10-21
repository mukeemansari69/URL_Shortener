const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const TOKEN_KEY = 'url-shortner-token'
const USER_KEY = 'url-shortner-user'

// A short link must use the host currently serving the app. A build-time
// VITE_SHORT_DOMAIN can be stale (for example, localhost from local .env).
export const shortDomain = window.location.host
export const makeShortUrl = (slug) => `${window.location.origin}/${encodeURIComponent(slug)}`

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

function setSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('auth-change'))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth-change'))
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('API server is not reachable. Start the backend or check VITE_API_URL.')
  }

  const payload = await response.json().catch(() => ({
    message: response.statusText || 'Request failed.',
  }))

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.')
  }

  return payload
}

export function getSessionUser() {
  return getStoredUser()
}

export async function getCurrentUser() {
  return getStoredUser()
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY) && getStoredUser())
}

export function saveSession() {
  return undefined
}

export async function signOut() {
  clearSession()
}

export const api = {
  register: async ({ name, email, password }) => {
    const result = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })

    setSession(result)
    return result
  },

  login: async ({ email, password }) => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    setSession(result)
    return result
  },

  resendSignupEmail: async () => ({
    message: 'Email verification is not enabled in this backend auth flow.',
  }),

  requestPasswordReset: async () => ({
    message: 'Password reset is not enabled yet. Ask the admin to reset it from the backend store.',
  }),

  sendPhoneOtp: async () => {
    throw new Error('SMS login is not enabled in this backend auth flow.')
  },

  verifyPhoneOtp: async () => {
    throw new Error('SMS login is not enabled in this backend auth flow.')
  },

  updatePassword: async () => {
    throw new Error('Password update is not enabled yet.')
  },

  createLink: async ({ destinationUrl, slug, title }) =>
    request('/links', {
      method: 'POST',
      body: JSON.stringify({ destinationUrl, slug, title }),
    }),

  getStats: async () => request('/stats'),

  getLinks: async (search = '') => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    const query = params.toString()
    return request(`/links${query ? `?${query}` : ''}`)
  },

  getLink: async (slug) => request(`/links/${encodeURIComponent(slug)}`),

  updateLink: async (slug, payload) =>
    request(`/links/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  resolveLink: async (slug) => request(`/redirect/${encodeURIComponent(slug)}`),

  getProductPage: async (slug) => request(`/product-pages/${encodeURIComponent(slug)}`),
}
