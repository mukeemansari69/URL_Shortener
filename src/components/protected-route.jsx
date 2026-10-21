import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/api'

const ProtectedRoute = ({ children }) => {
  const [allowed, setAllowed] = useState(() => isAuthenticated())

  useEffect(() => {
    const syncAuth = () => setAllowed(isAuthenticated())
    window.addEventListener('auth-change', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('auth-change', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  if (!allowed) return <Navigate to="/auth" replace />

  return children
}

export default ProtectedRoute
