# URL Shortner

React/Vite frontend with an Express API. The browser sends auth, link management,
analytics, and redirect requests to the API. Express signs JWTs, validates
ownership, and stores users, links, and click records in Supabase when configured.
Redis is an optional fast store; without Supabase or Redis, the API uses
process-local memory, which is suitable only for local development because data
is lost on restart and is not shared between instances. Kafka is optional and
receives events when configured.

## Local development

1. Copy `.env.example` to `.env` and set the Supabase values if you want data to
   persist. Run `supabase-url-shortner-schema.sql` in the Supabase SQL editor.
2. Run `npm install` at the repository root and `npm install` in `backend/`.
3. Run `npm run dev` at the repository root. Vite serves the frontend and proxies
   `/api` to the Express server on port 4000.

The account flow currently supports email/password registration and login.
Email verification, password reset, and SMS login are not implemented.

## Deploy with Render

The root `render.yaml` defines a Render Node web service for the API and a static
site for the frontend. Create a Blueprint from this repository. The API health
check is `/health`; the frontend build outputs `dist/` and rewrites browser routes
to `index.html`.

In the API service, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run
`supabase-url-shortner-schema.sql` once in the Supabase SQL editor. Keep the
generated `JWT_SECRET`. If you use a custom frontend domain, update
`FRONTEND_ORIGIN`, `PUBLIC_BASE_URL`, and `SHORT_DOMAIN` on the API. Add any
additional frontend origins as a comma-separated list in `FRONTEND_ORIGIN`.

For durable storage, configure Supabase or a persistent managed Redis
`REDIS_URL`. The in-memory fallback loses accounts and links whenever the
service restarts or scales to multiple instances. Kafka is optional.

## Deploy with Vercel

Vercel serves the Vite frontend and includes an API function in `api/index.js`.
Set the Vercel Project Root Directory to the repository root (not `backend/`),
with the Vite framework, `npm run build`, and `dist` as the output directory.
The root `vercel.json` handles the API route and SPA fallback. Set these project
environment variables before deploying:

- `JWT_SECRET`: a strong, unique secret.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: for persistent data; run the
  SQL schema above once.
- `VITE_API_URL`: `/api` when Vercel runs the API function, or
  `https://<your-render-api-host>/api` when the frontend uses the Render API.
- For the Vercel API function, set `FRONTEND_ORIGIN` to the Vercel site origin.
  For a Render API used by both hosts, include both site origins separated by
  commas.

For the split Vercel frontend + Render API setup, set `VITE_API_URL` in the
Vercel Project Environment Variables to the full Render API URL ending in
`/api`, and set the Vercel origin in the Render API's `FRONTEND_ORIGIN`. Redeploy
both services after changing these values; Vite reads `VITE_API_URL` at build
time.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `JWT_SECRET` in any `VITE_*` variable.
