# Sebenza Construction - Security Guide

## Document Information

- **Product**: Sebenza Construction Management Platform
- **Version**: 1.0
- **Date**: July 2025
- **Audience**: Developers, System Administrators, Security Teams
- **Classification**: Internal Use

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Input Validation & Sanitization](#input-validation--sanitization)
5. [Session Management](#session-management)
6. [File Upload Security](#file-upload-security)
7. [Network Security](#network-security)
8. [Database Security](#database-security)
9. [API Security](#api-security)
10. [Infrastructure Security](#infrastructure-security)
11. [Monitoring & Logging](#monitoring--logging)
12. [Incident Response](#incident-response)

---

## Security Overview

### Security Philosophy

The Sebenza Construction Management Platform follows a **Security by Design** approach, implementing multiple layers of protection to ensure data confidentiality, integrity, and availability.

### Security Principles

1. **Defense in Depth**: Multiple security layers to protect against various threats
2. **Least Privilege**: Users and systems have minimum necessary permissions
3. **Zero Trust**: Never trust, always verify all access requests
4. **Secure by Default**: Secure configurations and settings by default
5. **Privacy by Design**: Data protection built into system architecture

### Threat Model

#### Identified Threats

| Threat Category | Risk Level | Impact | Mitigation |
|----------------|------------|---------|------------|
| SQL Injection | High | Data Breach | Input validation, parameterized queries |
| XSS Attacks | High | Session Hijacking | Output encoding, CSP headers |
| CSRF | Medium | Unauthorized Actions | CSRF tokens, SameSite cookies |
| Data Breaches | High | Financial/Legal Impact | Encryption, access controls |
| DDoS Attacks | Medium | Service Disruption | Rate limiting, CDN protection |
| Insider Threats | Medium | Data Exposure | Access logging, role-based access |

### Compliance Framework

**Standards Adherence:**
- OWASP Top 10 Security Guidelines
- ISO 27001 Information Security Standards
- NIST Cybersecurity Framework
- SOC 2 Type II Controls
- GDPR Data Protection Requirements

---

## Authentication & Authorization

### Current Implementation (Local)

#### Authentication Flow

```
1. User submits credentials (email/password)
2. System validates credentials against local store
3. JWT token generated with user claims
4. Token stored in secure httpOnly cookie
5. Subsequent requests validated against token
6. Token refresh mechanism for session extension
```

#### Token Structure

```typescript
interface JWTPayload {
  sub: string;          // User ID
  email: string;        // User email
  role: string;         // User role
  permissions: string[]; // User permissions
  iat: number;          // Issued at
  exp: number;          // Expiration time
  jti: string;          // JWT ID for revocation
}
```

### Production Authentication (Planned)

#### NextAuth.js Implementation

```typescript
// next-auth.config.ts
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await getUserByEmail(credentials.email);
        if (user && await bcrypt.compare(credentials.password, user.hashedPassword)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.permissions = token.permissions;
      return session;
    }
  }
} satisfies NextAuthConfig;
```

### Password Security

#### Password Requirements

```typescript
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // days
  historyCount: 12, // prevent reuse of last 12 passwords
  lockoutAttempts: 5,
  lockoutDuration: 30 // minutes
};
```

#### Password Hashing

```typescript
import bcrypt from "bcryptjs";

// Hash password with salt
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

### Role-Based Access Control (RBAC)

#### User Roles

```typescript
enum UserRole {
  ADMIN = "admin",
  PROJECT_MANAGER = "project_manager", 
  SITE_SUPERVISOR = "site_supervisor",
  ACCOUNTANT = "accountant",
  EMPLOYEE = "employee",
  CLIENT = "client"
}
```

#### Permissions Matrix

| Permission | Admin | PM | Supervisor | Accountant | Employee | Client |
|------------|-------|----|-----------|-----------|---------}--------|
| project:create | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| project:read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓* |
| project:update | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| project:delete | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| task:assign | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| financial:read | ✓ | ✓ | ✗ | ✓ | ✗ | ✓* |
| user:manage | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

*Limited to own projects/data

#### Permission Checking

```typescript
const hasPermission = (user: User, permission: string, resource?: Resource): boolean => {
  // Check user role permissions
  if (!user.permissions.includes(permission)) {
    return false;
  }
  
  // Check resource-level permissions
  if (resource) {
    return checkResourceAccess(user, resource);
  }
  
  return true;
};

const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!hasPermission(req.user, permission, req.resource)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
```

### Multi-Factor Authentication (MFA)

#### TOTP Implementation

```typescript
import speakeasy from "speakeasy";
import QRCode from "qrcode";

// Generate MFA secret
const generateMFASecret = (user: User) => {
  const secret = speakeasy.generateSecret({
    name: user.email,
    issuer: "Sebenza Construction",
    length: 32
  });
  
  return {
    secret: secret.base32,
    qrCode: QRCode.toDataURL(secret.otpauth_url)
  };
};

// Verify MFA token
const verifyMFAToken = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2 // Allow 2 time steps tolerance
  });
};
```

---

## Data Protection

### Encryption

#### Data at Rest

```typescript
// Database encryption configuration
const encryptionConfig = {
  algorithm: "aes-256-gcm",
  keyLength: 32,
  ivLength: 16,
  tagLength: 16
};

// Encrypt sensitive data before database storage
const encryptData = (data: string, key: Buffer): EncryptedData => {
  const iv = crypto.randomBytes(encryptionConfig.ivLength);
  const cipher = crypto.createCipher(encryptionConfig.algorithm, key, iv);
  
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return {
    data: encrypted,
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex")
  };
};
```

#### Data in Transit

```nginx
# TLS Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS Header
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Personal Data Protection

#### GDPR Compliance

```typescript
interface PersonalDataRequest {
  type: "access" | "rectification" | "erasure" | "portability";
  userId: string;
  requestDate: Date;
  status: "pending" | "processing" | "completed" | "denied";
}

// Data subject access request
const handleAccessRequest = async (userId: string): Promise<PersonalData> => {
  const userData = await getUserData(userId);
  const projectData = await getUserProjects(userId);
  const documentData = await getUserDocuments(userId);
  
  return {
    personalInfo: sanitizePersonalData(userData),
    projects: sanitizeProjectData(projectData),
    documents: sanitizeDocumentData(documentData),
    exportDate: new Date().toISOString()
  };
};

// Right to be forgotten
const handleErasureRequest = async (userId: string): Promise<void> => {
  await anonymizeUserData(userId);
  await removePersonalIdentifiers(userId);
  await logDataErasure(userId);
};
```

### Data Classification

| Classification | Description | Examples | Protection Level |
|----------------|-------------|----------|------------------|
| **Public** | Information intended for public access | Marketing materials | Basic |
| **Internal** | Information for company use | Project plans | Standard |
| **Confidential** | Sensitive business information | Financial data | Enhanced |
| **Restricted** | Highly sensitive information | Personal data, passwords | Maximum |

---

## Input Validation & Sanitization

### Form Validation with Zod

```typescript
import { z } from "zod";

// Project creation schema
const projectSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Project name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in project name"),
  
  description: z.string()
    .max(1000, "Description too long")
    .optional(),
  
  budget: z.number()
    .positive("Budget must be positive")
    .max(1000000000, "Budget too large"),
  
  clientId: z.string()
    .uuid("Invalid client ID"),
  
  startDate: z.date()
    .refine(date => date >= new Date(), "Start date cannot be in the past"),
  
  endDate: z.date()
});

// Cross-field validation
const validateProject = projectSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
);
```

### SQL Injection Prevention

```typescript
// Use parameterized queries with Prisma
const getProjectsByClient = async (clientId: string) => {
  return await prisma.project.findMany({
    where: {
      clientId: clientId // Automatically parameterized
    },
    include: {
      tasks: true,
      documents: true
    }
  });
};

// Manual query sanitization (when needed)
const sanitizeInput = (input: string): string => {
  return input
    .replace(/['"\\;]/g, "") // Remove dangerous characters
    .trim()
    .slice(0, 255); // Limit length
};
```

### XSS Prevention

```typescript
import DOMPurify from "dompurify";

// Sanitize HTML content
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "u", "strong", "em", "p", "br"],
    ALLOWED_ATTR: []
  });
};

// Content Security Policy
const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'"
].join("; ");
```

### File Type Validation

```typescript
const allowedFileTypes = {
  documents: [".pdf", ".doc", ".docx", ".txt"],
  images: [".jpg", ".jpeg", ".png", ".gif"],
  spreadsheets: [".xls", ".xlsx", ".csv"],
  cad: [".dwg", ".dxf"]
};

const validateFileType = (filename: string, category: string): boolean => {
  const extension = path.extname(filename).toLowerCase();
  return allowedFileTypes[category]?.includes(extension) || false;
};

const validateFileSize = (size: number): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return size <= maxSize;
};
```

---

## Session Management

### Session Configuration

```typescript
const sessionConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  updateAge: 60 * 60 * 1000,   // Update every hour
  generateSessionId: () => crypto.randomUUID(),
  
  cookie: {
    name: "sebenza-session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 24 * 60 * 60 * 1000
  }
};
```

### Session Storage

```typescript
interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  lastAccessed: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

// Session management
class SessionManager {
  async createSession(userId: string, request: Request): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date(),
      lastAccessed: new Date(),
      ipAddress: this.getClientIP(request),
      userAgent: request.headers["user-agent"] || "",
      isActive: true
    };
    
    await this.storeSession(session);
    return session;
  }
  
  async validateSession(sessionId: string): Promise<Session | null> {
    const session = await this.getSession(sessionId);
    
    if (!session || !session.isActive) {
      return null;
    }
    
    if (this.isExpired(session)) {
      await this.invalidateSession(sessionId);
      return null;
    }
    
    // Update last accessed time
    session.lastAccessed = new Date();
    await this.updateSession(session);
    
    return session;
  }
  
  async invalidateSession(sessionId: string): Promise<void> {
    await this.updateSession({ id: sessionId, isActive: false });
  }
}
```

### Concurrent Session Management

```typescript
const maxConcurrentSessions = 3;

const checkConcurrentSessions = async (userId: string): Promise<void> => {
  const activeSessions = await getActiveSessionsByUser(userId);
  
  if (activeSessions.length >= maxConcurrentSessions) {
    // Invalidate oldest session
    const oldestSession = activeSessions.sort((a, b) => 
      a.lastAccessed.getTime() - b.lastAccessed.getTime()
    )[0];
    
    await invalidateSession(oldestSession.id);
  }
};
```

---

## File Upload Security

### File Validation

```typescript
import fileType from "file-type";
import crypto from "crypto";

const validateUploadedFile = async (file: Express.Multer.File): Promise<ValidationResult> => {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > 10 * 1024 * 1024) { // 10MB
    errors.push("File size exceeds maximum limit");
  }
  
  // Check file type by content (not just extension)
  const detectedType = await fileType.fromBuffer(file.buffer);
  if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
    errors.push("File type not allowed");
  }
  
  // Check for malicious content
  const isSafe = await scanFileContent(file.buffer);
  if (!isSafe) {
    errors.push("File contains potentially harmful content");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### Secure File Storage

```typescript
const generateSecureFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString("hex");
  const extension = path.extname(originalName);
  
  return `${timestamp}-${randomString}${extension}`;
};

const storeFile = async (file: Express.Multer.File, projectId: string): Promise<Document> => {
  const secureFilename = generateSecureFilename(file.originalname);
  const filePath = path.join(UPLOAD_DIR, projectId, secureFilename);
  
  // Ensure directory exists
  await fs.ensureDir(path.dirname(filePath));
  
  // Write file with restricted permissions
  await fs.writeFile(filePath, file.buffer, { mode: 0o644 });
  
  // Create document record
  return await prisma.document.create({
    data: {
      name: file.originalname,
      filename: secureFilename,
      path: filePath,
      mimeType: file.mimetype,
      size: file.size,
      projectId,
      uploadedById: getCurrentUserId()
    }
  });
};
```

### Virus Scanning

```typescript
import ClamScan from "clamscan";

const virusScanner = await new ClamScan().init({
  removeInfected: true,
  quarantineInfected: "./quarantine",
  debugMode: false
});

const scanFile = async (filePath: string): Promise<ScanResult> => {
  try {
    const scanResult = await virusScanner.scanFile(filePath);
    
    return {
      isInfected: scanResult.isInfected,
      viruses: scanResult.viruses || []
    };
  } catch (error) {
    throw new Error("Virus scan failed");
  }
};
```

---

## Network Security

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 uploads per hour
  keyGenerator: (req) => req.user?.id || req.ip
});
```

### CORS Configuration

```typescript
const corsOptions = {
  origin: (origin: string, callback: Function) => {
    const allowedOrigins = [
      "https://sebenza-construction.com",
      "https://app.sebenza-construction.com"
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};
```

### Request Size Limits

```typescript
const bodyParserConfig = {
  json: { limit: "1mb" },
  urlencoded: { limit: "1mb", extended: true },
  raw: { limit: "10mb" } // For file uploads
};

// Custom middleware for request size validation
const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers["content-length"] || "0");
  const maxSize = req.path.includes("/upload") ? 10 * 1024 * 1024 : 1024 * 1024;
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: "Request entity too large"
    });
  }
  
  next();
};
```

---

## Database Security

### Connection Security

```typescript
// Database connection with SSL
const databaseConfig = {
  url: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? {
    rejectUnauthorized: true,
    ca: process.env.DB_CA_CERT,
    cert: process.env.DB_CLIENT_CERT,
    key: process.env.DB_CLIENT_KEY
  } : false,
  
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  }
};
```

### Query Security

```typescript
// Audit logging for sensitive operations
const auditLog = async (action: string, userId: string, resource: string, details?: any) => {
  await prisma.auditLog.create({
    data: {
      action,
      userId,
      resource,
      details: JSON.stringify(details),
      timestamp: new Date(),
      ipAddress: getCurrentUserIP(),
      userAgent: getCurrentUserAgent()
    }
  });
};

// Secure data access with row-level security
const getProjectsForUser = async (userId: string, role: string) => {
  let whereClause;
  
  switch (role) {
    case "admin":
      whereClause = {}; // Access to all projects
      break;
    case "project_manager":
      whereClause = { managerId: userId };
      break;
    case "client":
      whereClause = { clientId: userId };
      break;
    default:
      whereClause = {
        team: {
          some: { userId }
        }
      };
  }
  
  return await prisma.project.findMany({
    where: whereClause,
    include: {
      client: true,
      tasks: {
        where: {
          OR: [
            { assigneeId: userId },
            { project: { managerId: userId } }
          ]
        }
      }
    }
  });
};
```

### Data Anonymization

```typescript
const anonymizeUserData = async (userId: string): Promise<void> => {
  const anonymizedEmail = `deleted_user_${crypto.randomUUID()}@deleted.local`;
  const anonymizedName = "Deleted User";
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: anonymizedEmail,
      name: anonymizedName,
      phone: null,
      address: null,
      isActive: false,
      deletedAt: new Date()
    }
  });
  
  // Update related records
  await prisma.task.updateMany({
    where: { assigneeId: userId },
    data: { assignee: anonymizedName }
  });
  
  await auditLog("user_anonymized", userId, "user");
};
```

---

## API Security

### JWT Security

```typescript
import jwt from "jsonwebtoken";

const jwtConfig = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
  issuer: "sebenza-construction",
  audience: "sebenza-api"
};

const generateTokens = (userId: string, permissions: string[]) => {
  const payload = {
    sub: userId,
    permissions,
    type: "access"
  };
  
  const accessToken = jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  });
  
  const refreshToken = jwt.sign(
    { ...payload, type: "refresh" },
    jwtConfig.refreshTokenSecret,
    {
      expiresIn: jwtConfig.refreshTokenExpiry,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );
  
  return { accessToken, refreshToken };
};
```

### API Request Validation

```typescript
const validateApiRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (req.body) {
        req.body = schema.parse(req.body);
      }
      
      // Validate query parameters
      if (req.query) {
        req.query = validateQueryParams(req.query);
      }
      
      // Validate headers
      validateRequestHeaders(req.headers);
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors
        });
      }
      
      return res.status(400).json({
        error: "Invalid request format"
      });
    }
  };
};
```

### API Response Security

```typescript
const secureApiResponse = (req: Request, res: Response, next: NextFunction) => {
  // Remove sensitive headers
  res.removeHeader("X-Powered-By");
  
  // Add security headers
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  
  // Filter sensitive data from responses
  const originalJson = res.json;
  res.json = function(data: any) {
    const filteredData = filterSensitiveData(data, req.user?.role);
    return originalJson.call(this, filteredData);
  };
  
  next();
};

const filterSensitiveData = (data: any, userRole?: string): any => {
  if (!data) return data;
  
  // Remove password fields
  if (data.password) delete data.password;
  if (data.hashedPassword) delete data.hashedPassword;
  
  // Filter based on user role
  if (userRole !== "admin") {
    if (data.salary) delete data.salary;
    if (data.internalNotes) delete data.internalNotes;
  }
  
  return data;
};
```

---

## Infrastructure Security

### Server Hardening

```bash
#!/bin/bash
# server-hardening.sh

# Update system packages
apt update && apt upgrade -y

# Install security packages
apt install -y fail2ban ufw aide rkhunter chkrootkit

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Configure SSH security
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Configure fail2ban
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
EOF

systemctl restart fail2ban
```

### Container Security

```dockerfile
# Use minimal base image
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY --chown=nextjs:nodejs . .

# Remove unnecessary packages
RUN apk del .build-deps

# Set security headers in application
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Use non-root user
USER nextjs

# Expose port
EXPOSE 9002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9002/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Environment Variables Security

```typescript
// Environment variable validation
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(64), // 32 bytes hex
  
  // Optional with defaults
  PORT: z.coerce.number().default(9002),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  RATE_LIMIT_WINDOW: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: z.coerce.number().default(100)
});

// Validate environment variables at startup
const env = envSchema.parse(process.env);

// Secrets management
const getSecret = async (secretName: string): Promise<string> => {
  if (process.env.NODE_ENV === "production") {
    // Use AWS Secrets Manager, Azure Key Vault, etc.
    return await secretsManager.getSecret(secretName);
  }
  
  // Development - use environment variables
  return process.env[secretName] || "";
};
```

---

## Monitoring & Logging

### Security Logging

```typescript
interface SecurityEvent {
  eventType: "login" | "logout" | "failed_login" | "permission_denied" | "data_access" | "file_upload";
  userId?: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  details?: Record<string, any>;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
}

class SecurityLogger {
  async logEvent(event: SecurityEvent): Promise<void> {
    // Log to database
    await prisma.securityLog.create({
      data: event
    });
    
    // Log to external SIEM if high severity
    if (event.severity === "high" || event.severity === "critical") {
      await this.sendToSIEM(event);
    }
    
    // Real-time alerting for critical events
    if (event.severity === "critical") {
      await this.sendAlert(event);
    }
  }
  
  async detectAnomalies(): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Check for multiple failed logins
    const failedLogins = await this.getRecentFailedLogins();
    if (failedLogins.length > 5) {
      alerts.push({
        type: "brute_force_attempt",
        severity: "high",
        details: { failedAttempts: failedLogins.length }
      });
    }
    
    // Check for unusual access patterns
    const unusualAccess = await this.detectUnusualAccess();
    alerts.push(...unusualAccess);
    
    return alerts;
  }
}
```

### Performance Monitoring

```typescript
import { performance } from "perf_hooks";

const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  res.on("finish", () => {
    const duration = performance.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Math.round(duration),
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      userId: req.user?.id
    };
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn("Slow request detected", logData);
    }
    
    // Send metrics to monitoring service
    metrics.timing("request.duration", duration, {
      method: req.method,
      route: req.route?.path,
      status: res.statusCode.toString()
    });
  });
  
  next();
};
```

### Health Monitoring

```typescript
// Health check endpoint with security metrics
export const healthCheck = async (req: Request, res: Response) => {
  const checks = {
    database: await checkDatabaseHealth(),
    redis: await checkRedisHealth(),
    fileSystem: await checkFileSystemHealth(),
    security: await checkSecurityHealth()
  };
  
  const overallHealth = Object.values(checks).every(check => check.status === "healthy");
  
  res.status(overallHealth ? 200 : 503).json({
    status: overallHealth ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
};

const checkSecurityHealth = async (): Promise<HealthCheck> => {
  try {
    // Check for recent security incidents
    const recentIncidents = await getRecentSecurityIncidents();
    
    // Check certificate expiration
    const certExpiry = await checkCertificateExpiry();
    
    // Check for failed login attempts
    const failedLogins = await getRecentFailedLogins();
    
    const issues = [];
    if (recentIncidents.length > 0) issues.push("Recent security incidents");
    if (certExpiry < 30) issues.push("Certificate expires soon");
    if (failedLogins.length > 10) issues.push("High number of failed logins");
    
    return {
      status: issues.length === 0 ? "healthy" : "warning",
      details: { issues, certExpiry, failedLogins: failedLogins.length }
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message
    };
  }
};
```

---

## Incident Response

### Security Incident Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **Critical** | Active security breach | Immediate (< 1 hour) | Data breach, system compromise |
| **High** | Potential security threat | < 4 hours | Multiple failed logins, malware detected |
| **Medium** | Security policy violation | < 24 hours | Unauthorized access attempt |
| **Low** | Minor security concern | < 72 hours | Policy violation, minor vulnerability |

### Incident Response Playbook

#### 1. Detection & Analysis

```typescript
interface SecurityIncident {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  description: string;
  detectedAt: Date;
  detectedBy: "automated" | "user_report" | "security_team";
  affectedSystems: string[];
  affectedUsers: string[];
  status: "new" | "investigating" | "contained" | "resolved";
}

const processSecurityAlert = async (alert: SecurityAlert): Promise<SecurityIncident> => {
  const incident: SecurityIncident = {
    id: generateIncidentId(),
    severity: alert.severity,
    type: alert.type,
    description: alert.description,
    detectedAt: new Date(),
    detectedBy: "automated",
    affectedSystems: await identifyAffectedSystems(alert),
    affectedUsers: await identifyAffectedUsers(alert),
    status: "new"
  };
  
  await createIncidentRecord(incident);
  await notifySecurityTeam(incident);
  
  if (incident.severity === "critical") {
    await initiateEmergencyResponse(incident);
  }
  
  return incident;
};
```

#### 2. Containment Strategies

```typescript
const containSecurityIncident = async (incident: SecurityIncident): Promise<void> => {
  switch (incident.type) {
    case "brute_force_attack":
      await blockSuspiciousIPs(incident);
      await lockAffectedAccounts(incident);
      break;
      
    case "data_breach":
      await isolateAffectedSystems(incident);
      await preserveEvidence(incident);
      await notifyStakeholders(incident);
      break;
      
    case "malware_detected":
      await quarantineAffectedFiles(incident);
      await scanAllSystems(incident);
      break;
      
    case "insider_threat":
      await suspendUserAccess(incident);
      await preserveUserActivity(incident);
      break;
  }
  
  await updateIncidentStatus(incident.id, "contained");
};
```

#### 3. Communication Plan

```typescript
const notificationMatrix = {
  critical: {
    internal: ["security_team", "management", "legal", "pr_team"],
    external: ["customers", "regulators", "law_enforcement"],
    timeframe: "immediate"
  },
  high: {
    internal: ["security_team", "management"],
    external: ["affected_customers"],
    timeframe: "4_hours"
  },
  medium: {
    internal: ["security_team"],
    external: [],
    timeframe: "24_hours"
  },
  low: {
    internal: ["security_team"],
    external: [],
    timeframe: "72_hours"
  }
};

const sendIncidentNotifications = async (incident: SecurityIncident): Promise<void> => {
  const config = notificationMatrix[incident.severity];
  
  // Internal notifications
  for (const team of config.internal) {
    await sendTeamNotification(team, incident);
  }
  
  // External notifications (if required)
  for (const stakeholder of config.external) {
    await sendStakeholderNotification(stakeholder, incident);
  }
  
  // Regulatory notifications (if required)
  if (isRegulatory

Required(incident)) {
    await sendRegulatoryNotification(incident);
  }
};
```

### Recovery Procedures

```typescript
const recoverFromIncident = async (incident: SecurityIncident): Promise<void> => {
  const recoveryPlan = await createRecoveryPlan(incident);
  
  for (const step of recoveryPlan.steps) {
    try {
      await executeRecoveryStep(step);
      await logRecoveryProgress(incident.id, step.id, "completed");
    } catch (error) {
      await logRecoveryProgress(incident.id, step.id, "failed", error.message);
      await escalateRecoveryIssue(incident, step, error);
    }
  }
  
  // Verify system integrity
  await performSystemIntegrityCheck();
  
  // Resume normal operations
  await resumeNormalOperations(incident);
  
  // Schedule post-incident review
  await schedulePostIncidentReview(incident);
};
```

---

## Security Training & Awareness

### Developer Security Training

**Required Training Topics:**
- Secure coding practices
- OWASP Top 10 vulnerabilities
- Authentication and authorization
- Input validation and sanitization
- Cryptography best practices
- Secure API development

### Security Policies

#### Password Policy
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- No common dictionary words
- No personal information
- Changed every 90 days
- Cannot reuse last 12 passwords

#### Data Handling Policy
- Classify data according to sensitivity levels
- Encrypt sensitive data at rest and in transit
- Implement proper access controls
- Regular data backup and recovery testing
- Secure data disposal procedures

#### Incident Reporting Policy
- All security incidents must be reported immediately
- Use designated reporting channels
- Preserve evidence and maintain chain of custody
- Cooperate with security investigations
- No retaliation for good faith reporting

---

This security guide provides comprehensive coverage of security measures implemented and planned for the Sebenza Construction Management Platform. Regular reviews and updates of these security measures are essential to maintain protection against evolving threats.

For security questions or to report incidents, contact: security@sebenza-construction.com
