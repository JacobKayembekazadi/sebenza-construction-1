# Sebenza Construction - API Documentation

## Document Information

- **Product**: Sebenza Construction Management Platform
- **Version**: 1.0
- **Date**: July 2025
- **Audience**: Frontend Developers, Integration Partners, API Consumers
- **Base URL**: `https://api.sebenza-construction.com` (Production) | `http://localhost:9002` (Development)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core Resources](#core-resources)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Pagination](#pagination)
9. [Webhooks](#webhooks)
10. [SDK & Code Examples](#sdk--code-examples)

---

## Overview

The Sebenza Construction API provides programmatic access to all construction management features including projects, tasks, clients, employees, financial records, and documents. The API follows REST conventions and returns JSON responses.

### API Principles

- **RESTful Design**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Format**: All requests and responses use JSON
- **Stateless**: Each request contains all necessary information
- **Versioned**: API version included in URL path (`/api/v1/`)
- **Paginated**: List endpoints support pagination
- **Filtered**: Most endpoints support filtering and sorting

### Base URLs

```text
Production:  https://api.sebenza-construction.com/api/v1
Staging:     https://staging.sebenza-construction.com/api/v1
Development: http://localhost:9002/api/v1
```

---

## Authentication

### Authentication Overview

The API uses JWT (JSON Web Tokens) for authentication. All API requests must include a valid JWT token in the Authorization header.

### Authentication Flow

#### 1. Login Request

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 2. Login Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123456789",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "project_manager",
      "permissions": ["projects:read", "projects:write", "tasks:read", "tasks:write"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### 3. Using the Token

```http
GET /api/v1/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Authentication Endpoints

#### Login
```http
POST /api/v1/auth/login
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

#### Token Refresh
```http
POST /api/v1/auth/refresh
Authorization: Bearer {token}
```

#### Password Reset Request
```http
POST /api/v1/auth/password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Password Reset Confirm
```http
POST /api/v1/auth/password-reset/confirm
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "new_password"
}
```

---

## Core Resources

### Resource Overview

| Resource | Description | Base Endpoint |
|----------|-------------|---------------|
| Projects | Construction projects | `/api/v1/projects` |
| Tasks | Project tasks and activities | `/api/v1/tasks` |
| Clients | Client management | `/api/v1/clients` |
| Employees | Employee management | `/api/v1/employees` |
| Invoices | Invoice management | `/api/v1/invoices` |
| Estimates | Project estimates | `/api/v1/estimates` |
| Expenses | Expense tracking | `/api/v1/expenses` |
| Documents | Document management | `/api/v1/documents` |
| Calendar | Events and scheduling | `/api/v1/calendar` |
| Inventory | Inventory management | `/api/v1/inventory` |

---

## API Endpoints

### Projects

#### List Projects

```http
GET /api/v1/projects
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Items per page (default: 20, max: 100) | `?limit=50` |
| `status` | string | Filter by status | `?status=on-track` |
| `manager` | string | Filter by project manager | `?manager=john-doe` |
| `client` | string | Filter by client ID | `?client=client_123` |
| `sort` | string | Sort field | `?sort=name` |
| `order` | string | Sort order (asc/desc) | `?order=desc` |

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_123456789",
        "name": "Downtown Office Complex",
        "description": "Modern 15-story office building in downtown district",
        "status": "on-track",
        "completion": 65,
        "budget": 2500000,
        "spent": 1625000,
        "manager": "John Doe",
        "clientId": "client_123",
        "clientName": "Acme Corporation",
        "startDate": "2025-01-15T00:00:00Z",
        "endDate": "2025-12-15T00:00:00Z",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-07-15T00:00:00Z",
        "tasksCount": 127,
        "teamSize": 8
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### Get Project Details

```http
GET /api/v1/projects/{projectId}
Authorization: Bearer {token}
```

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "project": {
      "id": "proj_123456789",
      "name": "Downtown Office Complex",
      "description": "Modern 15-story office building in downtown district",
      "status": "on-track",
      "completion": 65,
      "budget": 2500000,
      "spent": 1625000,
      "remaining": 875000,
      "manager": "John Doe",
      "client": {
        "id": "client_123",
        "name": "Acme Corporation",
        "email": "contact@acme.com",
        "phone": "+1-555-0123"
      },
      "startDate": "2025-01-15T00:00:00Z",
      "endDate": "2025-12-15T00:00:00Z",
      "team": [
        {
          "id": "emp_123",
          "name": "Jane Smith",
          "role": "Site Supervisor",
          "email": "jane@sebenza.com"
        }
      ],
      "tasks": [
        {
          "id": "task_123",
          "title": "Foundation Inspection",
          "status": "completed",
          "priority": "high",
          "assignee": "Jane Smith",
          "dueDate": "2025-07-20T00:00:00Z"
        }
      ],
      "documents": [
        {
          "id": "doc_123",
          "name": "Building Plans v2.pdf",
          "type": "blueprint",
          "size": 2048576,
          "uploadedAt": "2025-07-01T00:00:00Z"
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-07-15T00:00:00Z"
    }
  }
}
```

#### Create Project

```http
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Riverside Shopping Center",
  "description": "New retail complex with 50 stores",
  "clientId": "client_456",
  "manager": "John Doe",
  "budget": 3500000,
  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2026-06-01T00:00:00Z"
}
```

**Response:**

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "project": {
      "id": "proj_987654321",
      "name": "Riverside Shopping Center",
      "description": "New retail complex with 50 stores",
      "status": "planning",
      "completion": 0,
      "budget": 3500000,
      "spent": 0,
      "remaining": 3500000,
      "manager": "John Doe",
      "clientId": "client_456",
      "startDate": "2025-08-01T00:00:00Z",
      "endDate": "2026-06-01T00:00:00Z",
      "createdAt": "2025-07-20T00:00:00Z",
      "updatedAt": "2025-07-20T00:00:00Z"
    }
  }
}
```

#### Update Project

```http
PUT /api/v1/projects/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "on-track",
  "completion": 70,
  "spent": 1750000
}
```

#### Delete Project

```http
DELETE /api/v1/projects/{projectId}
Authorization: Bearer {token}
```

### Tasks

#### List Tasks

```http
GET /api/v1/tasks
Authorization: Bearer {token}
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `projectId` | string | Filter by project | `?projectId=proj_123` |
| `assignee` | string | Filter by assignee | `?assignee=jane-smith` |
| `status` | string | Filter by status | `?status=in-progress` |
| `priority` | string | Filter by priority | `?priority=high` |
| `overdue` | boolean | Show only overdue tasks | `?overdue=true` |

#### Create Task

```http
POST /api/v1/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Install Electrical Wiring",
  "description": "Install electrical wiring for floors 5-8",
  "projectId": "proj_123456789",
  "assignee": "Mike Johnson",
  "priority": "high",
  "status": "pending",
  "dueDate": "2025-08-15T00:00:00Z",
  "estimatedHours": 24
}
```

#### Update Task

```http
PUT /api/v1/tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in-progress",
  "completionPercentage": 25,
  "notes": "Started wiring installation on floor 5"
}
```

### Clients

#### List Clients

```http
GET /api/v1/clients
Authorization: Bearer {token}
```

#### Create Client

```http
POST /api/v1/clients
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "TechCorp Solutions",
  "email": "contact@techcorp.com",
  "phone": "+1-555-0199",
  "address": {
    "street": "123 Business Ave",
    "city": "Denver",
    "state": "CO",
    "zipCode": "80202",
    "country": "USA"
  },
  "contactPerson": "Sarah Wilson",
  "company": "TechCorp Solutions Inc."
}
```

### Employees

#### List Employees

```http
GET /api/v1/employees
Authorization: Bearer {token}
```

#### Create Employee

```http
POST /api/v1/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Robert Chen",
  "email": "robert.chen@sebenza.com",
  "phone": "+1-555-0177",
  "role": "Electrical Engineer",
  "department": "Engineering",
  "salary": 85000,
  "hireDate": "2025-08-01T00:00:00Z",
  "skills": ["electrical systems", "blueprint reading", "safety compliance"]
}
```

### Invoices

#### List Invoices

```http
GET /api/v1/invoices
Authorization: Bearer {token}
```

#### Create Invoice

```http
POST /api/v1/invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": "client_123",
  "projectId": "proj_123456789",
  "invoiceNumber": "INV-2025-001",
  "issueDate": "2025-07-20T00:00:00Z",
  "dueDate": "2025-08-20T00:00:00Z",
  "items": [
    {
      "description": "Foundation work completion",
      "quantity": 1,
      "unitPrice": 125000,
      "total": 125000
    },
    {
      "description": "Structural steel installation",
      "quantity": 1,
      "unitPrice": 85000,
      "total": 85000
    }
  ],
  "subtotal": 210000,
  "tax": 21000,
  "total": 231000,
  "notes": "Payment due within 30 days of invoice date"
}
```

### Financial Summary

#### Get Financial Dashboard

```http
GET /api/v1/financial/dashboard
Authorization: Bearer {token}
```

**Response:**

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 4250000,
      "totalExpenses": 2850000,
      "netProfit": 1400000,
      "outstandingInvoices": 850000,
      "overdueInvoices": 125000
    },
    "monthlyTrends": [
      {
        "month": "2025-07",
        "revenue": 425000,
        "expenses": 285000,
        "profit": 140000
      }
    ],
    "projectProfitability": [
      {
        "projectId": "proj_123456789",
        "projectName": "Downtown Office Complex",
        "budget": 2500000,
        "spent": 1625000,
        "profitMargin": 35
      }
    ]
  }
}
```

---

## Data Models

### Project Model

```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'on-track' | 'at-risk' | 'off-track' | 'completed' | 'cancelled';
  completion: number; // 0-100
  budget: number;
  spent: number;
  remaining: number;
  manager: string;
  clientId: string;
  clientName: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  team?: Employee[];
  tasks?: Task[];
  documents?: Document[];
  address?: Address;
}
```

### Task Model

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assignee: string;
  assigneeId: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string; // ISO 8601
  completionPercentage: number; // 0-100
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  dependencies?: string[]; // Task IDs
  tags?: string[];
  notes?: string;
}
```

### Client Model

```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  contactPerson?: string;
  address?: Address;
  status: 'active' | 'inactive' | 'suspended';
  totalProjects: number;
  totalSpent: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  notes?: string;
}
```

### Employee Model

```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'terminated';
  salary?: number;
  hireDate: string; // ISO 8601
  skills?: string[];
  projects?: string[]; // Project IDs
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Invoice Model

```typescript
interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string; // ISO 8601
  dueDate: string; // ISO 8601
  paidDate?: string; // ISO 8601
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

### Document Model

```typescript
interface Document {
  id: string;
  name: string;
  type: string;
  size: number; // bytes
  mimeType: string;
  projectId?: string;
  clientId?: string;
  uploadedBy: string;
  uploadedAt: string; // ISO 8601
  url: string;
  tags?: string[];
  description?: string;
}
```

### Address Model

```typescript
interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
```

---

## Error Handling

### Error Response Format

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "budget",
        "message": "Budget must be a positive number"
      }
    ]
  },
  "timestamp": "2025-07-20T12:34:56Z",
  "requestId": "req_123456789"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | Valid authentication required |
| `PERMISSION_DENIED` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RESOURCE_CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

### Rate Limits

- **Authenticated Requests**: 1000 requests per hour per user
- **Authentication Requests**: 10 requests per minute per IP
- **File Upload Requests**: 50 requests per hour per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1627747200
X-RateLimit-Window: 3600
```

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 3600
  }
}
```

---

## Pagination

### Request Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number (1-based) | 1 |
| `limit` | integer | Items per page (max 100) | 20 |

### Response Format

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 157,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Link Header

```http
Link: </api/v1/projects?page=1&limit=20>; rel="first",
      </api/v1/projects?page=2&limit=20>; rel="next",
      </api/v1/projects?page=8&limit=20>; rel="last"
```

---

## Webhooks

### Webhook Overview

Webhooks allow you to receive real-time notifications when events occur in your Sebenza Construction account. When an event is triggered, a HTTP POST request is sent to your configured endpoint.

### Webhook Events

| Event | Description |
|-------|-------------|
| `project.created` | New project created |
| `project.updated` | Project updated |
| `project.completed` | Project marked as completed |
| `task.created` | New task created |
| `task.updated` | Task updated |
| `task.completed` | Task marked as completed |
| `invoice.created` | New invoice created |
| `invoice.paid` | Invoice marked as paid |
| `invoice.overdue` | Invoice became overdue |

### Webhook Payload

```json
{
  "id": "evt_123456789",
  "event": "project.completed",
  "timestamp": "2025-07-20T12:34:56Z",
  "data": {
    "project": {
      "id": "proj_123456789",
      "name": "Downtown Office Complex",
      "status": "completed",
      "completion": 100
    }
  }
}
```

### Webhook Setup

```http
POST /api/v1/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks/sebenza",
  "events": ["project.completed", "invoice.paid"],
  "secret": "your-webhook-secret"
}
```

### Webhook Verification

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}
```

---

## SDK & Code Examples

### JavaScript/TypeScript SDK

#### SDK Installation

```bash
npm install @sebenza/construction-api
```

#### SDK Usage

```typescript
import { SebenzaAPI } from '@sebenza/construction-api';

const client = new SebenzaAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.sebenza-construction.com'
});

// List projects
const projects = await client.projects.list({
  status: 'on-track',
  limit: 10
});

// Create a new project
const newProject = await client.projects.create({
  name: 'New Shopping Mall',
  clientId: 'client_123',
  budget: 5000000,
  startDate: '2025-08-01',
  endDate: '2026-08-01'
});

// Update project status
await client.projects.update('proj_123', {
  status: 'completed',
  completion: 100
});
```

### Python SDK

#### Python SDK Installation

```bash
pip install sebenza-construction-api
```

#### Python SDK Usage

```python
from sebenza import SebenzaAPI

client = SebenzaAPI(
    api_key='your-api-key',
    base_url='https://api.sebenza-construction.com'
)

# List projects
projects = client.projects.list(status='on-track', limit=10)

# Create a new task
task = client.tasks.create({
    'title': 'Install HVAC System',
    'project_id': 'proj_123',
    'assignee': 'john-doe',
    'priority': 'high',
    'due_date': '2025-08-15'
})
```

### cURL Examples

#### Get Projects

```bash
curl -X GET "https://api.sebenza-construction.com/api/v1/projects" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json"
```

#### Create New Project

```bash
curl -X POST "https://api.sebenza-construction.com/api/v1/projects" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Office Building",
    "clientId": "client_123",
    "budget": 2000000,
    "startDate": "2025-08-01T00:00:00Z",
    "endDate": "2026-06-01T00:00:00Z"
  }'
```

#### Upload Document

```bash
curl -X POST "https://api.sebenza-construction.com/api/v1/documents" \
  -H "Authorization: Bearer your-token" \
  -F "file=@blueprint.pdf" \
  -F "projectId=proj_123" \
  -F "type=blueprint"
```

---

## Postman Collection

### Import Collection

```json
{
  "info": {
    "name": "Sebenza Construction API",
    "description": "Complete API collection for Sebenza Construction Management Platform",
    "version": "1.0.0"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{auth_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.sebenza-construction.com/api/v1"
    },
    {
      "key": "auth_token",
      "value": "your-token-here"
    }
  ]
}
```

### Environment Variables

```json
{
  "development": {
    "base_url": "http://localhost:9002/api/v1"
  },
  "staging": {
    "base_url": "https://staging.sebenza-construction.com/api/v1"
  },
  "production": {
    "base_url": "https://api.sebenza-construction.com/api/v1"
  }
}
```

---

## Testing

### API Testing

```javascript
// Jest test example
describe('Projects API', () => {
  test('should create a new project', async () => {
    const projectData = {
      name: 'Test Project',
      clientId: 'client_123',
      budget: 1000000,
      startDate: '2025-08-01T00:00:00Z',
      endDate: '2026-06-01T00:00:00Z'
    };

    const response = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(projectData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.project.name).toBe('Test Project');
  });
});
```

---

This API documentation provides comprehensive information for integrating with the Sebenza Construction Management Platform. For additional examples and support, please refer to our SDK documentation and developer resources.
