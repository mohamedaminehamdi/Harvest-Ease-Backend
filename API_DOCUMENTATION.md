# HarvestEase API Documentation

- Backend URL: `http://localhost:5000`
- Frontend origin (CORS): `http://localhost:3000`, configurable with `CORS_ORIGIN`
- Authentication: send `Authorization: Bearer <token>` on every route except `/auth/*`, `/assets/*` and `/healthz`. Tokens come from register, login or sync-user and are valid for 7 days.
- Response format: `{ success, message, data | user, ... }`. Errors are `{ success: false, message, errors? }`.
- Ownership: users can only change or delete their own tweets, comments, events, resource records and account. Anything that sets an owner (`userId`) uses the token, never the request body.

# Authentication APIs (`/auth`, rate-limited per IP)

## POST /auth/register
Register with email and password. Send JSON, or `multipart/form-data` with an optional `picture` file (PNG/JPEG/WebP/GIF, max 5 MB). Uploaded pictures are renamed, and `picturePath` is set to the stored file name, which is served at `/assets/<picturePath>`.
Body: `{ name, email, password, picturePath? }`
Response 201: `{ success, message, user, token }`. 400 on validation errors, including an email that's already registered.

## POST /auth/login
Body: `{ email, password }` (email is case-insensitive)
Response 200: `{ success, message, user, token }`. 401 `Invalid credentials` for an unknown email or wrong password.

## POST /auth/sync-user
Exchange a Clerk session for a backend token, creating the user on first sign-in.
Headers: `Authorization: Bearer <Clerk session JWT>`
Body: `{ name? }`. The email always comes from Clerk and must be verified there.
Response 200: `{ success, message, user, token }`. 401 for an invalid session, 403 if the email isn't verified, 503 if Clerk isn't configured.

# User APIs (`/users`)

## GET /users/profile
Your own full profile (without the password).
Response: `{ success, message, user }`

## GET /users/profile/:userId
Another user's public profile: `name, picturePath, farmName, location, bio, website, createdAt`. Your own id returns the full profile.

## PUT /users/profile/:userId
Update your own profile (403 for anyone else).
Body: `{ name?, farmName?, location?, phone?, bio?, website? (http/https), picturePath? }`. Other fields are ignored.
Response: `{ success, message, user }`

## POST /users/change-password
Body: `{ oldPassword, newPassword }` (new password at least 6 characters and different from the old one)
Response: `{ success, message }`. 401 if `oldPassword` is wrong.

## DELETE /users/profile
Delete your account along with your tweets, comments, likes, events, resource records and chat history.
Response: `{ success, message }`

# Settings APIs (`/settings`, used by the older pages)

- `GET /settings/users`: `{ users: [{ _id, name, picturePath }] }`
- `GET /settings/users/:userId`: `{ name }`
- `PUT /settings/users/:userId`: change password, body `{ oldPassword, newPassword }` (own account only)
- `PUT /settings/users/:userId/email`: body `{ newEmail }` (own account only)
- `DELETE /settings/users/:userId`: same as `DELETE /users/profile` (own account only)

# Forum APIs (`/forum`)

## GET /forum/tweets
Query: `{ page? (default 1), limit? (default 20, max 50) }`, newest first.
Response: `{ success, data: Tweet[], pagination: { page, limit, total, pages } }`. Each tweet's `userId` is populated with `{ name, picturePath }`.

## POST /forum/tweets
Body: `{ content (max 2000 chars), image? }`
Response 201: `{ success, data: Tweet }`

## GET /forum/tweets/:id
Response: `{ success, data: Tweet }` with `userId` and `comments` populated.

## PUT /forum/tweets/:id
Author only. Body: `{ content, image? }`
Response: `{ success, data: Tweet }`

## DELETE /forum/tweets/:id
Author only. Also deletes the tweet's comments.

## POST /forum/tweets/:id/like
Toggles your like (`PUT /forum/tweets/:id/likes` does the same).
Response: `{ success, message, data: Tweet }`, where `data.likes` lists the ids of users who liked it.

## GET /forum/tweets/:tweetId/comments
Response: `{ success, data: Comment[] }` with `userId` populated, newest first.

## POST /forum/comments
Body: `{ tweetId, content (max 1000 chars) }`. `POST /forum/tweets/:tweetId/comments` with `{ content }` does the same.
Response 201: `{ success, data: Comment }`. 404 if the tweet doesn't exist.

## PUT /forum/comments/:id
Author only. Body: `{ content }`

## DELETE /forum/comments/:id
Author only.

## PUT /forum/comments/:commentId/replies
Body: `{ reply }`. Appends a text reply.

# Scheduler APIs (`/scheduler`; `/Farm-scheduler` still works)

Categories: `general, planting, watering, harvesting, maintenance`. Priorities: `low, medium, high`.

## GET /scheduler/events
Your events, sorted by start date.
Query: `{ startDate?, endDate?, category? }`
Response: `{ success, data: Event[] }`

## GET /scheduler/events/by-date
Query: `{ date (required, e.g. 2024-10-01) }`
Response: `{ success, data: Event[] }`

## GET /scheduler/events/:id
Response: the event object (404 if it isn't yours).

## POST /scheduler/events
`POST /scheduler/add-event` does the same.
Body: `{ title, startDate, endDate? (defaults to startDate + 1 hour), description?, category?, priority?, notes? }`
Response 201: `{ success, data: Event }`. 400 if the dates are invalid or `endDate` is before `startDate`.

## PUT /scheduler/events/:id
Owner only. Body: any of the fields above.

## DELETE /scheduler/events/:id
Owner only.

# Resources APIs (`/resources`; `/Resources-tracker` still works)

Resource names: `water, fertilizer, pesticide, seed, equipment, labor`. Units: `liters, kg, units, hours`. Actions: `addition, usage, replacement`.

## GET /resources/usage
Query: `{ startDate?, endDate?, resourceName? }`
Response: `{ success, data: Resource[], summary: { totalCost, count } }`

## POST /resources/usage
Body: `{ resourceName, quantity (number ≥ 0), unit, cost (number ≥ 0), action?, notes? }`
Response 201: `{ success, data: Resource }`

## PUT /resources/usage/:id
Owner only. Body: any of the fields above.

## DELETE /resources/usage/:id
Owner only.

# Health APIs (`/health`)

## POST /health/analyze
Body: `{ imageUrl (http/https URL), plantType? }`
Response: `{ success, data: { plantType, healthScore, confidence, diseases, recommendations } }`. This is a placeholder result until a model is connected.

## GET /health/plant-info/:plantType
Response: `{ success, data: PlantInfo }`

# Chatbot APIs (`/chatbot`)

## POST /chatbot/query
Answered by Gemini (`GEMINI_MODEL`) using your last 10 messages as context. Falls back to built-in farming tips when `GOOGLE_GEN_AI_KEY` isn't set or Gemini fails.
Body: `{ message (max 2000 chars) }`
Response: `{ success, data: { query, response, timestamp } }`

## GET /chatbot/history
Your last 50 messages, oldest first.
Response: `{ success, data: [{ role: "user" | "bot", content, createdAt }] }`

## DELETE /chatbot/history
Clears your chat history.

## POST /chatbot
Legacy endpoint for the older pages. Body: `{ userInput, history }`. Responds with plain text.

# Other

## GET /healthz
No auth. Returns 200 `{ status: "ok", db: "up" }`, or 503 when the database is unreachable.

## GET /assets/:file
Uploaded profile pictures.

# Error Handling

All errors use the format `{ success: false, message, errors? }`. 5xx responses never include internal details.

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Validation error or malformed id
- 401: Missing/invalid token, or wrong credentials
- 403: Not the owner of the resource
- 404: Not found
- 409: Conflict (duplicate)
- 413: Request body over 1 MB
- 429: Too many auth requests, see `Retry-After`
- 500: Server error
- 502/503: Upstream (Clerk) failure or service not configured
