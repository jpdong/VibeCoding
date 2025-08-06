# Vibe Coding - API Documentation

## 📋 API Overview

The Vibe Coding platform provides RESTful APIs for chat functionality, user management, and security verification. All APIs are built using Next.js API routes with TypeScript.

**Base URL:** `https://vibecoding.com/api` (or `http://localhost:3000/api` for development)

## 🔐 Authentication

### Authentication Methods
- **Optional Authentication**: Most features work without login
- **Google OAuth**: For personalized features and chat history
- **Session-based**: Using NextAuth.js sessions

### Headers
```http
Content-Type: application/json
Cookie: next-auth.session-token=<session_token>
```

## 🤖 Chat APIs

### Generate AI Response

**Endpoint:** `POST /api/chat/generateTextStream`

Generate AI-powered coding assistance with streaming response.

**Request Body:**
```json
{
  "textStr": "How to implement a binary search in Python?",
  "user_id": 123,
  "turnstileToken": "0.abc123..."
}
```

**Parameters:**
- `textStr` (string, required): The coding question or problem
- `user_id` (number, optional): User ID for authenticated users
- `turnstileToken` (string, required): Cloudflare Turnstile verification token

**Response:**
- **Content-Type:** `text/plain; charset=utf-8`
- **Transfer-Encoding:** `chunked` (streaming response)

**Success Response (200):**
```
Here's how to implement binary search in Python:

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

This algorithm has O(log n) time complexity...
```

**Error Responses:**
```json
// 401 Unauthorized
{
  "error": "Login to continue.",
  "status": 401
}

// 403 Forbidden
{
  "error": "Security verification failed.",
  "status": 403
}

// 429 Too Many Requests
{
  "error": "Requested too frequently!",
  "status": 429
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/chat/generateTextStream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    textStr: 'How to reverse a string in JavaScript?',
    turnstileToken: turnstileToken
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk); // Process streaming response
}
```

---

### Save Chat Record

**Endpoint:** `POST /api/chat/saveText`

Save a chat conversation to the database.

**Request Body:**
```json
{
  "input_text": "How to implement quicksort?",
  "output_text": "Here's a quicksort implementation...",
  "user_id": 123
}
```

**Parameters:**
- `input_text` (string, required): User's original question
- `output_text` (string, required): AI's response
- `user_id` (number, optional): User ID for authenticated users

**Success Response (200):**
```json
{
  "success": true,
  "chat_id": "abc123-def456-ghi789",
  "message": "Chat saved successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

---

### Get Chat List

**Endpoint:** `GET /api/chat/getChatList`

Retrieve chat history for a user or public chats.

**Query Parameters:**
- `user_id` (number, optional): Get chats for specific user
- `locale` (string, optional): Language filter ('en' or 'zh')
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of results per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "chats": [
    {
      "uid": "abc123-def456",
      "input_text": "How to implement binary search?",
      "output_text": "Here's how to implement binary search...",
      "title": "Binary Search Implementation",
      "user_name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z",
      "language": "en"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_count": 100
  }
}
```

## 🔒 Security APIs

### Verify Turnstile Token

**Endpoint:** `POST /api/turnstile/verify`

Verify Cloudflare Turnstile token for bot protection.

**Request Body:**
```json
{
  "token": "0.abc123def456..."
}
```

**Parameters:**
- `token` (string, required): Turnstile response token from client

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
```json
// 400 Bad Request - Missing token
{
  "success": false,
  "error": "Token is required"
}

// 400 Bad Request - Invalid token
{
  "success": false,
  "error": "Turnstile verification failed",
  "details": {
    "success": false,
    "error-codes": ["invalid-input-response"]
  }
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Turnstile secret key not configured"
}
```

---

### Test Turnstile Configuration

**Endpoint:** `GET /api/turnstile/test`

Test Turnstile configuration (development only).

**Success Response (200):**
```json
{
  "siteKeyConfigured": true,
  "secretKeyConfigured": true,
  "siteKey": "0x4AAAAAAA...",
  "secretKey": "0x4AAAAAAA..."
}
```

## 👤 User APIs

### Get User by Email

**Endpoint:** `GET /api/user/getUserByEmail`

Retrieve user information by email address.

**Query Parameters:**
- `email` (string, required): User's email address

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### Get User by ID

**Endpoint:** `GET /api/user/getUserByUserId`

Retrieve user information by user ID.

**Query Parameters:**
- `user_id` (number, required): User's ID

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 🔑 Authentication APIs

### NextAuth Endpoints

The platform uses NextAuth.js for authentication. These endpoints are automatically generated:

**Base Path:** `/api/auth`

#### Sign In
**Endpoint:** `GET /api/auth/signin`
- Displays sign-in page with available providers

#### Sign Out
**Endpoint:** `GET /api/auth/signout`
- Signs out the current user

#### Session
**Endpoint:** `GET /api/auth/session`
- Returns current session information

**Response:**
```json
{
  "user": {
    "name": "John Doe",
    "email": "user@example.com",
    "image": "https://example.com/avatar.jpg"
  },
  "expires": "2024-02-01T00:00:00.000Z"
}
```

#### Callback
**Endpoint:** `GET/POST /api/auth/callback/google`
- Handles OAuth callback from Google

## 📊 Rate Limiting

### Rate Limit Rules
- **Chat Generation**: 1 request per 30 seconds per user
- **General APIs**: 100 requests per minute per IP
- **Authentication**: 10 requests per minute per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response (429)
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later",
  "retryAfter": 30
}
```

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR` - Request validation failed
- `AUTH_REQUIRED` - Authentication required
- `TURNSTILE_FAILED` - Security verification failed
- `RATE_LIMITED` - Too many requests
- `USER_NOT_FOUND` - User does not exist
- `INTERNAL_ERROR` - Server error

## 🧪 Testing APIs

### Using cURL

**Generate AI Response:**
```bash
curl -X POST http://localhost:3000/api/chat/generateTextStream \
  -H "Content-Type: application/json" \
  -d '{
    "textStr": "How to implement bubble sort?",
    "turnstileToken": "test_token"
  }'
```

**Verify Turnstile:**
```bash
curl -X POST http://localhost:3000/api/turnstile/verify \
  -H "Content-Type: application/json" \
  -d '{
    "token": "test_token"
  }'
```

### Using JavaScript Fetch

```javascript
// Generate AI response with streaming
async function generateResponse(question, token) {
  const response = await fetch('/api/chat/generateTextStream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      textStr: question,
      turnstileToken: token
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }

  return result;
}

// Verify Turnstile token
async function verifyTurnstile(token) {
  const response = await fetch('/api/turnstile/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token })
  });

  return response.json();
}
```

## 📝 API Changelog

### v1.0.0 (Current)
- Initial API release
- Chat generation with streaming
- Turnstile security integration
- User management
- Rate limiting implementation

### Planned Features
- WebSocket support for real-time chat
- File upload for code analysis
- API key authentication for external integrations
- Webhook support for chat events

---

For more information or support, please contact the development team or refer to the main documentation.