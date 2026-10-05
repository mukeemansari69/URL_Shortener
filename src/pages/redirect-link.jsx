import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, shortDomain } from '../lib/api'

const RedirectLink = () => {
  const { id } = useParams()
  const [destinationUrl, setDestinationUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    api
      .resolveLink(id)
      .then((result) => {
        setDestinationUrl(result.destinationUrl)
        window.location.assign(result.destinationUrl)
      })
      .catch((requestError) => setError(requestError.message))
  }, [id])

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <img src="/logo.png" alt="URL Shortner logo" className="mx-auto h-14 w-14 rounded-lg object-contain" />
        <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Redirecting</p>
        <h1 className="mt-3 break-words text-3xl font-bold text-slate-950 sm:text-4xl">
          {shortDomain}/{id || 'short-link'}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          {error || 'Your destination is being prepared. If it does not open automatically, continue from here.'}
        </p>

        <div className="mx-auto mt-8 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-2/3 rounded-full bg-slate-950" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            disabled={!destinationUrl}
            onClick={() => destinationUrl && window.location.assign(destinationUrl)}
            className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Continue
          </button>
          <Link
            to="/"
            className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-950"
          >
            Go Home
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RedirectLink
