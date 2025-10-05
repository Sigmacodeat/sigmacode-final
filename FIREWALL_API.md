# SIGMACODE Neural Firewall API

AI-powered security firewall for LLM applications with threat detection, PII redaction, and audit logging.

## Authentication

### API Key Authentication

All API requests require authentication using an API key in the `x-api-key` header:

```
x-api-key: sk-1234567890abcdef...
```

### JWT Authentication (Legacy)

For backward compatibility, JWT tokens are also supported:

```
Authorization: Bearer your-jwt-token
```

## Rate Limiting

- **Requests per minute**: 60 (configurable per API key)
- **Tokens per minute**: 100,000 (configurable per API key)
- **Monthly quota**: 1,000,000 tokens (configurable per API key)

## Endpoints

### Agents

#### Invoke Agent

```http
POST /api/agents/{agentId}/invoke
```

Invoke an AI agent with firewall protection.

**Parameters:**

- `agentId` (path): The ID of the agent to invoke

**Request Body:**

```json
{
  "input": "User input text",
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

**Response:**

```json
{
  "response": "AI generated response",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 50,
    "total_tokens": 60
  },
  "firewall": {
    "decision": "allow",
    "threats_detected": 0,
    "latency_ms": 45
  }
}
```

**Status Codes:**

- `200`: Success
- `401`: Unauthorized (invalid API key)
- `403`: Forbidden (quota exceeded or insufficient permissions)
- `429`: Rate limit exceeded
- `451`: Content blocked by firewall

### API Keys

#### List API Keys

```http
GET /api/api-keys
```

Get all API keys for the authenticated user.

**Response:**

```json
{
  "success": true,
  "apiKeys": [
    {
      "id": "key_123",
      "keyId": "sk-abc123...",
      "name": "Production API Key",
      "scopes": ["agents:invoke"],
      "status": "active",
      "rateLimitRpm": 60,
      "rateLimitTpm": 100000,
      "quotaLimit": 1000000,
      "quotaUsed": 15000,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create API Key

```http
POST /api/api-keys
```

Create a new API key.

**Request Body:**

```json
{
  "name": "My API Key",
  "scopes": ["agents:invoke", "firewall:logs:read"],
  "rateLimitRpm": 100,
  "rateLimitTpm": 50000,
  "quotaLimit": 500000
}
```

**Response:**

```json
{
  "success": true,
  "apiKey": "sk-1234567890abcdef...",
  "message": "API key created successfully"
}
```

#### Update API Key

```http
PATCH /api/api-keys/{keyId}
```

Update an API key's configuration.

**Parameters:**

- `keyId` (path): The ID of the API key to update

**Request Body:**

```json
{
  "name": "Updated Name",
  "rateLimitRpm": 200
}
```

#### Delete API Key

```http
DELETE /api/api-keys/{keyId}
```

Delete an API key.

**Parameters:**

- `keyId` (path): The ID of the API key to delete

### Firewall Logs

#### Get Firewall Logs

```http
GET /api/firewall/logs
```

Retrieve firewall event logs with filtering and pagination.

**Query Parameters:**

- `since` (optional): ISO datetime string to filter logs after this time
- `backend` (optional): Filter by backend ("dify" | "superagent")
- `policy` (optional): Filter by policy ("strict" | "balanced" | "permissive")
- `action` (optional): Filter by action ("allow" | "block" | "shadow-allow" | "shadow-block")
- `q` (optional): Search in request IDs
- `limit` (optional): Number of results per page (default: 100, max: 500)
- `offset` (optional): Pagination offset (default: 0)
- `format` (optional): Response format ("json" | "csv", default: "json")

**Response (JSON):**

```json
{
  "data": [
    {
      "id": "log_123",
      "ts": "2024-01-01T12:00:00Z",
      "requestId": "req_abc123",
      "backend": "superagent",
      "policy": "balanced",
      "action": "allow",
      "latencyMs": 45,
      "status": 200,
      "userId": "user_123",
      "meta": {
        "threat_matches": [],
        "risk_level": "low"
      }
    }
  ],
  "total": 1250
}
```

**Response (CSV):**
Downloads a CSV file with the log data.

### Firewall Statistics

#### Get Firewall Stats

```http
GET /api/firewall/stats
```

Get aggregated firewall statistics.

**Response:**

```json
{
  "totalRequests": 15420,
  "blockedRequests": 234,
  "allowedRequests": 15186,
  "averageLatency": 67,
  "threatMatches": 45,
  "topThreats": [
    {
      "category": "prompt_injection",
      "count": 23
    },
    {
      "category": "pii",
      "count": 12
    }
  ],
  "isEnabled": true,
  "mode": "enforce"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**

- `INVALID_API_KEY`: The provided API key is invalid
- `QUOTA_EXCEEDED`: Token quota has been exceeded
- `RATE_LIMIT_EXCEEDED`: Rate limit has been exceeded
- `INSUFFICIENT_PERMISSIONS`: API key doesn't have required scopes
- `FIREWALL_BLOCKED`: Request was blocked by firewall
- `INVALID_REQUEST`: Request data is invalid

## Firewall Decisions

The firewall can return the following decisions:

- `allow`: Request is allowed to proceed
- `block`: Request is blocked due to security concerns
- `sanitize`: Request is allowed but sensitive data is redacted

## Scopes

API keys can have the following scopes:

- `agents:invoke`: Invoke AI agents
- `firewall:logs:read`: Read firewall logs
- `firewall:stats:read`: Read firewall statistics
- `api-keys:manage`: Manage API keys (create, update, delete)

## Webhooks

The API supports webhooks for real-time notifications of firewall events. Configure webhooks in your account settings.

**Webhook Events:**

- `firewall.blocked`: When a request is blocked
- `firewall.threat_detected`: When threats are detected
- `quota.exceeded`: When token quota is exceeded

## SDKs

Official SDKs are available for:

- **JavaScript/TypeScript**: `@sigmaguard/firewall-sdk`
- **Python**: `sigmaguard-firewall`
- **Go**: `github.com/sigmaguard/firewall-go`

## Support

For API support, contact support@sigmaguard.ai or visit our documentation at https://docs.sigmaguard.ai
