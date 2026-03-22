/**
 * HarvestEase API Documentation
 * 
 * Backend URL: http://localhost:5000
 * Frontend URL: http://localhost:3000
 * 
 * Authentication: Dual-token system (Clerk + JWT)
 * Response Format: { success, message, user/data, token?, error? }
 */

# Authentication APIs

## POST /auth/register
Register new user with email and password
Body: { name, email, password, picturePath? }
Response: { success: boolean, message: string, user: User, token: string }

## POST /auth/login
Authenticate user with credentials
Body: { email, password }
Response: { success: boolean, message: string, user: User, token: string }

## POST /auth/sync-user
Sync Clerk user with backend database
Body: { email, name }
Response: { success: boolean, message: string, user: User, token: string }

# User APIs

## GET /users/profile/:userId
Get user profile information
Response: { success: boolean, user: User }

## PUT /users/profile/:userId
Update user profile
Body: { name?, farmName?, location?, phone?, bio?, website?, picturePath? }
Response: { success: boolean, user: User }

## POST /users/change-password
Change user password
Body: { oldPassword, newPassword }
Response: { success: boolean, message: string }

# Forum APIs

## GET /forum/tweets
Get all tweets
Response: { success: boolean, data: Tweet[] }

## POST /forum/tweets
Create new tweet
Body: { content, image?, userId }
Response: { success: boolean, data: Tweet }

## PUT /forum/tweets/:id
Update tweet
Body: { content, image? }
Response: { success: boolean, data: Tweet }

## DELETE /forum/tweets/:id
Delete tweet
Response: { success: boolean, message: string }

## POST /forum/tweets/:id/like
Toggle like on tweet
Body: { userId }
Response: { success: boolean, data: Tweet }

## GET /forum/tweets/:id/comments
Get tweet comments
Response: { success: boolean, data: Comment[] }

## POST /forum/comments
Create comment on tweet
Body: { tweetId, content, userId }
Response: { success: boolean, data: Comment }

# Scheduler APIs

## GET /scheduler/events
Get all events for user
Query: { startDate?, endDate?,category? }
Response: { success: boolean, data: Event[] }

## GET /scheduler/events/by-date
Get events for specific date
Query: { date (required) }
Response: { success: boolean, data: Event[] }

## POST /scheduler/events
Create new event
Body: { title, description?, startDate, endDate?, category, priority, notes? }
Response: { success: boolean, data: Event }

## PUT /scheduler/events/:id
Update event
Body: { title?, description?, startDate?, endDate?, category?, priority?, notes? }
Response: { success: boolean, data: Event }

## DELETE /scheduler/events/:id
Delete event
Response: { success: boolean, message: string }

# Resources APIs

## GET /resources/usage
Get resource usage records
Query: { startDate?, endDate?, resourceName? }
Response: { success: boolean, data: Resource[], summary: { totalCost, count } }

## POST /resources/usage
Log resource usage
Body: { resourceName, quantity, unit, cost, action?, notes? }
Response: { success: boolean, data: Resource }

## PUT /resources/usage/:id
Update resource usage
Body: { resourceName?, quantity?, unit?, cost?, action?, notes? }
Response: { success: boolean, data: Resource }

## DELETE /resources/usage/:id
Delete resource usage record
Response: { success: boolean, message: string }

# Health APIs

## POST /health/analyze
Analyze plant health
Body: { imageUrl, plantType? }
Response: { success: boolean, data: { healthScore, confidence, diseases, recommendations } }

## GET /health/plant-info/:plantType
Get plant information
Response: { success: boolean, data: PlantInfo }

# Chatbot APIs

## POST /chatbot/query
Send message to chatbot
Body: { message, context? }
Response: { success: boolean, data: { query, response, timestamp } }

## GET /chatbot/history
Get chat history
Response: { success: boolean, data: ChatMessage[] }

# Error Handling

All endpoints return error responses in format:
{ success: false, message: string, error?: string }

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Validation error
- 401: Unauthorized
- 404: Not found
- 409: Conflict (duplicate)
- 500: Server error
