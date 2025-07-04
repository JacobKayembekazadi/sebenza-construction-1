# Sebenza Construction - Technical Specification Document

## Document Information
- **Product**: Sebenza Construction Management Platform
- **Version**: 1.0
- **Date**: July 2025
- **Status**: Development Phase 1
- **Dependencies**: See `architectural_document.md` and `product_requirements_document.md`

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [API Specifications](#api-specifications)
4. [Authentication & Security](#authentication--security)
5. [Data Models & Validation](#data-models--validation)
6. [Integration Points](#integration-points)
7. [Error Handling](#error-handling)
8. [Performance Requirements](#performance-requirements)
9. [Development Environment](#development-environment)

---

## System Overview

### Current State
- **Frontend**: Next.js 15.3.3 with TypeScript, running on port 9002
- **Authentication**: Local context with localStorage persistence
- **Data Layer**: Mock data in `src/lib/data.ts`
- **State Management**: React Context + Local Storage

### Target State (Phase 1)
- **Database**: PostgreSQL with Prisma ORM
- **Backend API**: Next.js API Routes with RESTful endpoints
- **Authentication**: NextAuth.js with JWT tokens
- **File Storage**: Local filesystem (future: AWS S3)
- **Email Service**: Nodemailer (future: SendGrid/AWS SES)

---

## Database Schema

### Primary Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_role AS ENUM ('admin', 'owner', 'member');
```

#### Clients Table
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  status client_status DEFAULT 'active',
  billing_address TEXT,
  shipping_address TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE client_status AS ENUM ('active', 'inactive');
```

#### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'on_track',
  completion DECIMAL(5,2) DEFAULT 0.00,
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE project_status AS ENUM ('on_track', 'at_risk', 'off_track', 'completed', 'cancelled');
```

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

#### Task Dependencies Table
```sql
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(task_id, depends_on_task_id)
);
```

#### Estimates Table
```sql
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status estimate_status DEFAULT 'draft',
  notes TEXT,
  terms TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE estimate_status AS ENUM ('draft', 'sent', 'accepted', 'declined', 'expired');
```

#### Estimate Line Items Table
```sql
CREATE TABLE estimate_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(12,2) DEFAULT 0.00,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status invoice_status DEFAULT 'draft',
  notes TEXT,
  terms TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval recurring_interval_type,
  recurring_period INTEGER,
  late_fee_type late_fee_type,
  late_fee_value DECIMAL(10,2),
  automated_reminders BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'partial', 'cancelled');
CREATE TYPE recurring_interval_type AS ENUM ('days', 'weeks', 'months');
CREATE TYPE late_fee_type AS ENUM ('percentage', 'flat_rate');
```

#### Invoice Line Items Table
```sql
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Expenses Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category expense_category NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  is_billable BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  receipt_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE expense_category AS ENUM ('materials', 'labor', 'permits', 'subcontractor', 'other');
```

#### Documents Table
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  file_type document_type NOT NULL,
  file_size INTEGER,
  file_url TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE document_type AS ENUM ('pdf', 'image', 'word', 'excel', 'other');
```

#### Employees Table
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role employee_role NOT NULL,
  hourly_rate DECIMAL(8,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE employee_role AS ENUM ('project_manager', 'site_supervisor', 'electrician', 'plumber', 'laborer');
```

#### Inventory Items Table
```sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 0,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  low_stock_threshold INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Suppliers Table
```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Support Tickets Table
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject VARCHAR(255) NOT NULL,
  department support_department NOT NULL,
  priority support_priority DEFAULT 'normal',
  status support_status DEFAULT 'open',
  description TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE support_department AS ENUM ('finance', 'sales', 'technical_support', 'general_inquiry');
CREATE TYPE support_priority AS ENUM ('low', 'normal', 'high');
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
```

### Indexes for Performance

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Projects
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- Tasks
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Invoices
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Expenses
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
```

---

## API Specifications

### Base Configuration
- **Base URL**: `http://localhost:9002/api`
- **Authentication**: Bearer JWT tokens
- **Content Type**: `application/json`
- **Error Format**: Standardized error responses

### Authentication Endpoints

#### POST `/api/auth/login`
```typescript
// Request
{
  email: string;
  password: string;
}

// Response (200)
{
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'owner' | 'member';
  };
  token: string;
  expiresAt: string; // ISO date
}

// Error (401)
{
  error: "Invalid credentials";
  code: "INVALID_CREDENTIALS";
}
```

#### POST `/api/auth/register`
```typescript
// Request
{
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'owner' | 'member';
}

// Response (201)
{
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}
```

#### POST `/api/auth/logout`
```typescript
// Response (200)
{
  message: "Logged out successfully";
}
```

### Project Management Endpoints

#### GET `/api/projects`
```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  status?: 'on_track' | 'at_risk' | 'off_track' | 'completed';
  client_id?: string;
  manager_id?: string;
}

// Response (200)
{
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### POST `/api/projects`
```typescript
// Request
{
  name: string;
  description?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  client_id?: string;
  manager_id?: string;
}

// Response (201)
{
  project: Project;
}
```

#### GET `/api/projects/[id]`
```typescript
// Response (200)
{
  project: Project & {
    tasks: Task[];
    documents: Document[];
    expenses: Expense[];
    team: Employee[];
  };
}
```

#### PUT `/api/projects/[id]`
```typescript
// Request
{
  name?: string;
  description?: string;
  status?: 'on_track' | 'at_risk' | 'off_track' | 'completed';
  budget?: number;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
}

// Response (200)
{
  project: Project;
}
```

#### DELETE `/api/projects/[id]`
```typescript
// Response (204)
// No content
```

### Task Management Endpoints

#### GET `/api/tasks`
```typescript
// Query Parameters
{
  project_id?: string;
  assignee_id?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date_from?: string;
  due_date_to?: string;
}

// Response (200)
{
  tasks: Task[];
}
```

#### POST `/api/tasks`
```typescript
// Request
{
  name: string;
  description?: string;
  project_id: string;
  assignee_id?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  dependencies?: string[]; // Array of task IDs
}

// Response (201)
{
  task: Task;
}
```

### Financial Management Endpoints

#### GET `/api/estimates`
```typescript
// Query Parameters
{
  client_id?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'declined';
  date_from?: string;
  date_to?: string;
}

// Response (200)
{
  estimates: Estimate[];
}
```

#### POST `/api/estimates`
```typescript
// Request
{
  client_id: string;
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
  tax_rate?: number;
  discount_amount?: number;
  expiry_date?: string;
  notes?: string;
  terms?: string;
}

// Response (201)
{
  estimate: Estimate & {
    line_items: EstimateLineItem[];
  };
}
```

#### GET `/api/invoices`
```typescript
// Similar structure to estimates
```

#### POST `/api/invoices`
```typescript
// Similar structure to estimates with additional fields
{
  // ... estimate fields
  due_date: string;
  is_recurring?: boolean;
  recurring_interval?: 'days' | 'weeks' | 'months';
  recurring_period?: number;
}
```

### Client Management Endpoints

#### GET `/api/clients`
```typescript
// Response (200)
{
  clients: Client[];
}
```

#### POST `/api/clients`
```typescript
// Request
{
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  billing_address?: string;
  shipping_address?: string;
}

// Response (201)
{
  client: Client;
}
```

---

## Authentication & Security

### JWT Token Configuration
```typescript
// JWT Payload
{
  sub: string; // User ID
  email: string;
  role: 'admin' | 'owner' | 'member';
  iat: number;
  exp: number;
}

// Token Expiration
{
  accessToken: '1 hour';
  refreshToken: '7 days';
}
```

### Password Security
```typescript
// Password Requirements
{
  minLength: 8;
  requireUppercase: true;
  requireLowercase: true;
  requireNumbers: true;
  requireSpecialChars: true;
}

// Hashing
{
  algorithm: 'bcrypt';
  saltRounds: 12;
}
```

### Role-Based Access Control (RBAC)

#### Permission Matrix
```typescript
const permissions = {
  admin: ['*'], // All permissions
  owner: [
    'projects:*',
    'clients:*',
    'employees:*',
    'finances:*',
    'reports:read',
    'settings:*'
  ],
  member: [
    'projects:read',
    'tasks:*',
    'clients:read',
    'reports:read'
  ]
};
```

#### API Route Protection
```typescript
// Middleware example
export function withAuth(requiredPermissions: string[]) {
  return async (req: NextRequest, context: any) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const userPermissions = permissions[payload.role];
      
      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes('*') || userPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      req.user = payload;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
}
```

---

## Data Models & Validation

### Zod Schemas for Validation

#### User Schema
```typescript
export const userSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'owner', 'member']).optional(),
});
```

#### Project Schema
```typescript
export const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().optional(),
  budget: z.number().positive('Budget must be positive').optional(),
  start_date: z.string().date('Invalid start date').optional(),
  end_date: z.string().date('Invalid end date').optional(),
  client_id: z.string().uuid('Invalid client ID').optional(),
  manager_id: z.string().uuid('Invalid manager ID').optional(),
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date']
});
```

#### Task Schema
```typescript
export const taskSchema = z.object({
  name: z.string().min(2, 'Task name is required'),
  description: z.string().optional(),
  project_id: z.string().uuid('Invalid project ID'),
  assignee_id: z.string().uuid('Invalid assignee ID').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  start_date: z.string().date().optional(),
  due_date: z.string().date().optional(),
  dependencies: z.array(z.string().uuid()).optional(),
});
```

#### Invoice Schema
```typescript
export const invoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  project_id: z.string().uuid('Invalid project ID').optional(),
  line_items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit_price: z.number().min(0, 'Unit price cannot be negative'),
  })).min(1, 'At least one line item is required'),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_amount: z.number().min(0).optional(),
  due_date: z.string().date('Invalid due date'),
  notes: z.string().optional(),
  terms: z.string().optional(),
});
```

---

## Integration Points

### Email Service Integration
```typescript
// Nodemailer Configuration
export const emailConfig = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Email Templates
export const emailTemplates = {
  invoiceSent: {
    subject: 'Invoice #{invoiceNumber} from {companyName}',
    template: 'invoice-sent.html',
  },
  estimateRequested: {
    subject: 'Estimate Request #{estimateNumber}',
    template: 'estimate-request.html',
  },
  taskAssigned: {
    subject: 'New Task Assigned: {taskName}',
    template: 'task-assigned.html',
  },
};
```

### File Upload Configuration
```typescript
// Multer Configuration for Local Storage
export const uploadConfig = {
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
};
```

### Database Connection
```typescript
// Prisma Configuration
export const databaseConfig = {
  url: process.env.DATABASE_URL,
  shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
};

// Connection Pool
export const poolConfig = {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 60000,
  idleTimeoutMillis: 600000,
};
```

---

## Error Handling

### Standard Error Response Format
```typescript
export interface ApiError {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
  path: string;
}

// Error Codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
```

### Error Handler Middleware
```typescript
export function errorHandler(error: any, req: NextRequest, res: NextResponse) {
  const apiError: ApiError = {
    error: error.message || 'Internal Server Error',
    code: error.code || ERROR_CODES.INTERNAL_ERROR,
    details: error.details,
    timestamp: new Date().toISOString(),
    path: req.url,
  };

  const statusCode = getStatusCodeForError(error.code);
  
  return NextResponse.json(apiError, { status: statusCode });
}
```

### Validation Error Handling
```typescript
export function handleValidationError(error: z.ZodError): ApiError {
  return {
    error: 'Validation failed',
    code: ERROR_CODES.VALIDATION_ERROR,
    details: error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
    timestamp: new Date().toISOString(),
    path: '',
  };
}
```

---

## Performance Requirements

### Response Time Targets
- **API Endpoints**: < 500ms for 95% of requests
- **Database Queries**: < 200ms for standard CRUD operations
- **File Uploads**: Support up to 50MB files
- **Concurrent Users**: Support 100 concurrent users

### Caching Strategy
```typescript
// Redis Configuration (future)
export const cacheConfig = {
  user_sessions: { ttl: 3600 }, // 1 hour
  project_data: { ttl: 1800 },  // 30 minutes
  financial_reports: { ttl: 300 }, // 5 minutes
};

// In-Memory Cache (current)
export const memoryCache = new Map();
export function getCached<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (item && item.expires > Date.now()) {
    return item.data;
  }
  memoryCache.delete(key);
  return null;
}
```

### Database Optimization
```sql
-- Query Performance Indexes
CREATE INDEX CONCURRENTLY idx_projects_composite ON projects(status, client_id, manager_id);
CREATE INDEX CONCURRENTLY idx_tasks_composite ON tasks(project_id, status, assignee_id);
CREATE INDEX CONCURRENTLY idx_invoices_composite ON invoices(client_id, status, due_date);

-- Partial Indexes for Active Records
CREATE INDEX CONCURRENTLY idx_active_projects ON projects(id) WHERE status != 'completed';
CREATE INDEX CONCURRENTLY idx_pending_tasks ON tasks(id) WHERE status != 'done';
```

---

## Development Environment

### Required Environment Variables
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction_shadow"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:9002"

# Email (Development)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASS=""

# File Storage
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="52428800" # 50MB

# API Configuration
API_RATE_LIMIT="100" # requests per minute per IP
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Database Setup Commands
```bash
# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create and run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

---

## Implementation Checklist

### Phase 1.1: Database Setup (Week 1)
- [ ] Install and configure PostgreSQL
- [ ] Set up Prisma ORM
- [ ] Create database schema and migrations
- [ ] Implement database seed scripts
- [ ] Set up connection pooling

### Phase 1.2: Authentication System (Week 1-2)
- [ ] Install NextAuth.js
- [ ] Implement JWT-based authentication
- [ ] Create user registration and login endpoints
- [ ] Implement role-based access control
- [ ] Set up session management

### Phase 1.3: Core API Development (Week 2-3)
- [ ] Implement project management APIs
- [ ] Create task management endpoints
- [ ] Build financial management APIs (estimates, invoices)
- [ ] Implement client management APIs
- [ ] Add file upload capabilities

### Phase 1.4: Data Migration (Week 3-4)
- [ ] Create migration scripts from mock data
- [ ] Implement data validation and sanitization
- [ ] Test data integrity and relationships
- [ ] Set up backup and recovery procedures
- [ ] Performance testing and optimization

### Phase 1.5: Integration & Testing (Week 4)
- [ ] Integrate frontend with new APIs
- [ ] Implement error handling and logging
- [ ] Set up email service integration
- [ ] Create API documentation
- [ ] Comprehensive testing and bug fixes

---

**Document Status**: Phase 1 Implementation Ready  
**Next Update**: Weekly during development  
**Dependencies**: PostgreSQL, Node.js 18+, npm
