# Harvest-Ease-Backend

The backend of my end-of-year project HarvestEase: an Express + MongoDB API for farmers. It covers a community forum, a farm task scheduler, resource usage tracking, plant health checks, and a Gemini-powered farming chatbot.

## Requirements

- Node.js 22 or newer
- MongoDB 7+ (local or Atlas)

## Setup

```bash
npm install
cp .env.example .env   # then fill in DB_URI and JWT_SECRET at least
npm run dev            # restarts on changes; `npm start` for production
```

The API listens on `PORT` (default 5000). The server exits at startup if `DB_URI` or `JWT_SECRET` is missing. Every variable is described in [`.env.example`](.env.example). The optional ones turn on Clerk sign-in (`CLERK_JWT_KEY`, `CLERK_SECRET_KEY`) and Gemini answers in the chatbot (`GOOGLE_GEN_AI_KEY`).

## Tests

```bash
npm test
```

The suites in `tests/` run the real app against an in-memory MongoDB ([mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server)), so you don't need a database running. The first run downloads a `mongod` binary. CI runs the same command on Node 22 and 24 ([`.github/workflows/test.yml`](.github/workflows/test.yml)).

## API

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for every endpoint. In short:

| Prefix | What it does |
| --- | --- |
| `/auth` | register, login, Clerk sign-in (`/auth/sync-user`) |
| `/users` | profiles, password change, account deletion |
| `/forum` | tweets, likes, comments |
| `/scheduler` | farm tasks and events |
| `/resources` | water, fertilizer and other resource usage with cost totals |
| `/health` | plant health analysis and plant info |
| `/chatbot` | farming Q&A with saved history |
| `/healthz` | liveness check (no auth) |

Everything except `/auth`, `/assets` and `/healthz` needs `Authorization: Bearer <token>`, using the token returned by register, login or sync-user. Users can only change their own data.

## Security notes

- Login tokens are HS256 JWTs signed with `JWT_SECRET` and valid for 7 days.
- `/auth/sync-user` accepts only a verified Clerk session and reads the email from Clerk, never from the request body.
- `/auth` is rate-limited per IP (`AUTH_RATE_LIMIT`, default 20 requests per 15 minutes). Behind a proxy, set `TRUST_PROXY`.
- Avatar uploads accept only PNG/JPEG/WebP/GIF up to 5 MB and are stored under random names.
- Query filters are sanitized against MongoDB operator injection, and 5xx responses never include internal error details.

## Project layout

```
server.js        starts the server (loads config, connects to MongoDB)
app.js           Express app: middleware and route mounting
config.js        loads .env and checks required variables
routes/          URL → controller wiring
controllers/     request handlers
models/          Mongoose schemas
middlewares/     auth, validation, rate limiting, error handling
tests/           node:test integration and unit tests
```
