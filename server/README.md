# VeganGains Garmin Server

Small backend that logs into Garmin Connect with your own credentials (via
the unofficial [`garmin-connect`](https://www.npmjs.com/package/garmin-connect)
library) and exposes your health/training data to the VeganGains Tracker
frontend. This has to run as a separate server because logging into Garmin
Connect can't happen from a browser (CORS + multi-step session login).

**This uses Garmin's unofficial/undocumented API.** It is not sanctioned by
Garmin, may break if Garmin changes something, and repeated failed logins
can trigger a temporary account lock. Use at your own risk, with your own
account.

## Endpoints

- `GET /api/health-snapshot?date=YYYY-MM-DD` — heart rate, sleep, steps,
  training readiness, training status, body battery, respiration, stress
  for that day (defaults to today).
- `GET /api/activities?limit=10` — your most recent workouts.

Every request (except `/health`) must include a `X-Api-Key` header matching
the `API_KEY` env var.

## Local development

```bash
cd server
cp .env.example .env   # fill in your Garmin login + a random API_KEY
npm install
npm start
```

## Deploying (e.g. Render.com free web service)

1. Create a new "Web Service" on [render.com](https://render.com), connect
   this GitHub repo, set the root directory to `server`.
2. Build command: `npm install` — Start command: `npm start`.
3. Add the environment variables from `.env.example` in the Render
   dashboard (never commit real credentials to the repo).
4. Set `ALLOWED_ORIGINS` to your GitHub Pages URL, e.g.
   `https://7gw4tzvh9t-boop.github.io`.
5. Once deployed, copy the service URL (e.g.
   `https://vegangains-garmin.onrender.com`) into the frontend's Settings
   screen along with the `API_KEY` you chose.

Any Node host works the same way (Railway, Fly.io, a small VPS, ...).
