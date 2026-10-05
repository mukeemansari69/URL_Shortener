const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const shortDomain = import.meta.env.VITE_SHORT_DOMAIN || 'url.app'

function getToken() {
  return localStorage.getItem('url_shortner_token')
}

export function saveSession(session) {
  localStorage.setItem('url_shortner_token', session.token)
  localStorage.setItem('url_shortner_user', JSON.stringify(session.user))
}

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem('url_shortner_user') || 'null')
  } catch {
    return null
  }
}

export async function apiRequest(path, options = {}) {
  const token = getToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.')
  }

  return data
}

export const api = {
  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createLink: (payload) =>
    apiRequest('/links', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getStats: () => apiRequest('/stats'),
  getLinks: (search = '') => apiRequest(`/links${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getLink: (slug) => apiRequest(`/links/${encodeURIComponent(slug)}`),
  updateLink: (slug, payload) =>
    apiRequest(`/links/${encodeURIComponent(slug)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  resolveLink: (slug) => apiRequest(`/redirect/${encodeURIComponent(slug)}`),
}
