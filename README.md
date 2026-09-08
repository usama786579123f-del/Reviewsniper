# ReviewSniper — Dashboard App

This is the `app/` half of the ReviewSniper project. It shares one MongoDB
Atlas database with the Python scraper (`scraper/lead_hunter.py`, kept in a
separate sibling folder — see the main project structure below).

```
ReviewSniper/
├── scraper/     ← Python lead_hunter.py (writes to MongoDB)
└── app/         ← this project (reads from the same MongoDB, shows it in a dashboard)
```

## What was added to the original UI export

- `server/db.ts` — MongoDB connection (cached, reused across requests)
- `server/routes/leads.ts` — REST API:
  - `GET  /api/leads` — list leads (filters: niche, minStars, maxStars, status, page, limit)
  - `GET  /api/leads/:id` — single lead
  - `PATCH /api/leads/:id` — update a lead's status (new/contacted/saved/converted)
  - `GET  /api/stats` — numbers for the dashboard stat cards
- `client/src/pages/Dashboard.tsx` — now fetches real data from the routes
  above instead of showing the static empty state. If there are genuinely
  zero leads, the original empty state still shows — that part wasn't touched.
- `vite.config.ts` — added a dev proxy so `/api/*` requests reach the Express
  server while you're running `npm run dev`.
- `package.json` — added `mongodb`, `dotenv`, `concurrently`; split the `dev`
  script into `dev:api` (Express, port 4000) + `dev:client` (Vite) running
  together.

## Setup

1. Copy the env template and fill in your MongoDB Atlas connection string —
   **use the exact same `MONGODB_URI` and `DB_NAME` you used for the scraper**,
   so both read/write the same `leads` collection:
   ```
   cp .env.example .env
   ```

2. Install dependencies:
   ```
   pnpm install
   ```
   (or `npm install` — a `pnpm-lock.yaml` is included, so `pnpm` is preferred)

3. Run both the API and the frontend together:
   ```
   pnpm run dev
   ```
   - Frontend: http://localhost:3000
   - API only: http://localhost:4000/api/leads

4. Open the dashboard at `/dashboard` and you should see real leads once the
   scraper has written some into MongoDB. Until then, the original "No
   connected leads yet" empty state shows — that's expected, not a bug.

## Production build

```
pnpm run build
pnpm run start
```
`start` serves both the built frontend and the API from a single Express
process on `PORT` (default 3000).

## Notes

- The `PATCH /api/leads/:id` status dropdown in the table updates MongoDB
  directly — use it to mark leads as contacted/saved/converted as you work
  through them.
- The "All niches" filter is populated dynamically from whatever niches have
  been scraped so far — it starts empty until the scraper has run at least
  once.
- If `/api/leads` returns a "Could not reach the database" error, double
  check `MONGODB_URI` in `.env` and that your MongoDB Atlas Network Access
  allows connections from your IP (or 0.0.0.0/0 for testing).
