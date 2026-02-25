# Backend API Baseline Inventory

## Current Runtime
- Express server in `server.js` with MongoDB via Mongoose.
- JWT-based auth used by scheduler endpoints.

## Mounted Route Groups
- `/auth`
- `/Forum`
- `/chatbot`
- `/Resources-tracker`
- `/Farm-scheduler`
- `/settings`

## Auth Surface
- `POST /auth/register` with image upload support.
- `POST /auth/login` for JWT token issuance.

## Scheduler Surface (JWT Protected)
- `POST /Farm-scheduler/add-event`
- `GET /Farm-scheduler/events`
- `GET /Farm-scheduler/events/:id`
- `PUT /Farm-scheduler/events/:id`
- `DELETE /Farm-scheduler/events/:id`

## Forum Surface
- Tweets create/read/update/delete + likes.
- Comments and replies linked to tweets.

## Settings Surface
- User CRUD and user email update endpoints.

## Gaps Identified
- `routes/ressources.js` is currently empty but mounted by server.
- CORS middleware order should be normalized.
- Error response contracts are inconsistent across route handlers.
