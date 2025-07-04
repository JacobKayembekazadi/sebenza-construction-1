# Sebenza Construction - Development Workflow Guide

## Document Information

- **Product**: Sebenza Construction Management Platform
- **Version**: 1.0
- **Date**: July 2025
- **Audience**: Development Team
- **Dependencies**: Git, Node.js, PostgreSQL

---

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Git Workflow & Branching Strategy](#git-workflow--branching-strategy)
3. [Code Standards & Conventions](#code-standards--conventions)
4. [Development Process](#development-process)
5. [Code Review Process](#code-review-process)
6. [Testing Strategy](#testing-strategy)
7. [Release Management](#release-management)
8. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## Development Environment Setup

### Prerequisites

```bash
# Required Software
- Node.js 18+ (LTS recommended)
- npm 9+
- Git 2.30+
- PostgreSQL 14+
- VS Code (recommended) or similar IDE
```

### Initial Setup

#### 1. Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd sebenza-construction

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

#### 2. Database Setup

```bash
# Install PostgreSQL and create database
createdb sebenza_construction
createdb sebenza_construction_shadow

# Update .env.local with database URLs
DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction_shadow"

# Initialize Prisma
npx prisma generate
npx prisma db push
npx prisma db seed
```

#### 3. Environment Configuration

```bash
# .env.local - Development Environment
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/sebenza_construction_shadow"
JWT_SECRET="dev-jwt-secret-change-in-production"
NEXTAUTH_SECRET="dev-nextauth-secret"
NEXTAUTH_URL="http://localhost:9002"
SMTP_HOST="localhost"
SMTP_PORT="1025"
UPLOAD_DIR="./uploads"
```

#### 4. VS Code Configuration

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.format.enable": true,
  "eslint.validate": ["typescript", "typescriptreact"],
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "Prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

---

## Git Workflow & Branching Strategy

### Branching Model

We use **GitFlow** with modifications for our development process:

#### Main Branches

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`staging`** - Pre-production testing

#### Supporting Branches

- **`feature/`** - New features and enhancements
- **`bugfix/`** - Bug fixes for development
- **`hotfix/`** - Critical fixes for production
- **`release/`** - Release preparation

### Branch Naming Conventions

```bash
# Feature branches
feature/PM-123-add-project-gantt-chart
feature/auth-role-based-permissions
feature/invoice-recurring-billing

# Bug fix branches
bugfix/PM-456-fix-task-dependency-loop
bugfix/login-redirect-issue
bugfix/invoice-calculation-error

# Hotfix branches
hotfix/PM-789-critical-security-patch
hotfix/database-connection-timeout

# Release branches
release/v1.0.0
release/v1.1.0-beta
```

### Git Workflow Process

#### 1. Starting New Work

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/PM-123-add-project-gantt-chart

# Push branch to remote
git push -u origin feature/PM-123-add-project-gantt-chart
```

#### 2. During Development

```bash
# Regular commits with meaningful messages
git add .
git commit -m "feat(projects): add Gantt chart component

- Implement interactive Gantt chart using recharts
- Add task dependency visualization
- Support drag-and-drop task rescheduling
- Include milestone markers

Closes PM-123"

# Push changes frequently
git push origin feature/PM-123-add-project-gantt-chart
```

#### 3. Preparing for Merge

```bash
# Sync with latest develop
git checkout develop
git pull origin develop
git checkout feature/PM-123-add-project-gantt-chart
git rebase develop

# Run tests and linting
npm run lint
npm run typecheck
npm run test
npm run build

# Push rebased branch
git push --force-with-lease origin feature/PM-123-add-project-gantt-chart
```

### Commit Message Convention

We follow **Conventional Commits** specification:

#### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

#### Examples

```bash
feat(auth): implement role-based access control

- Add middleware for route protection
- Implement permission checking
- Update user context with roles

Closes PM-123

fix(invoices): correct tax calculation rounding

The tax calculation was using Math.round instead of proper
decimal rounding, causing discrepancies in final amounts.

Fixes PM-456

docs(api): add endpoint documentation for projects

- Document all project management endpoints
- Include request/response examples
- Add authentication requirements

chore(deps): update Next.js to version 15.3.3

- Update package.json dependencies
- Fix breaking changes in app router
- Update TypeScript types
```

---

## Code Standards & Conventions

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### File and Folder Naming

#### File Naming Conventions

```bash
# Components (PascalCase)
ProjectCard.tsx
AddEditProjectDialog.tsx
DashboardHeader.tsx

# Pages (lowercase with hyphens)
project-details.tsx
client-management.tsx

# Utilities and helpers (camelCase)
dateUtils.ts
apiClient.ts
validationSchemas.ts

# Constants (SCREAMING_SNAKE_CASE)
API_ENDPOINTS.ts
ERROR_CODES.ts
```

#### Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── dashboard/
│   └── api/
├── components/
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   └── charts/            # Chart components
├── lib/
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── types/             # Type definitions
│   └── constants/         # Application constants
├── styles/                # Global styles
└── tests/                 # Test files
    ├── __mocks__/
    ├── components/
    └── utils/
```

### Component Structure Standards

#### React Component Template

```typescript
// components/ProjectCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    onEdit?.(project);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      onDelete?.(project.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link 
            href={`/dashboard/projects/${project.id}`}
            className="hover:text-primary"
          >
            {project.name}
          </Link>
          <Badge variant={getStatusVariant(project.status)}>
            {project.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {project.description}
          </p>
          <div className="flex justify-between text-sm">
            <span>Budget: {formatCurrency(project.budget)}</span>
            <span>Due: {formatDate(project.endDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function within the same file
function getStatusVariant(status: Project['status']) {
  switch (status) {
    case 'on_track':
      return 'default';
    case 'at_risk':
      return 'warning';
    case 'off_track':
      return 'destructive';
    default:
      return 'secondary';
  }
}
```

#### API Route Template

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { projectSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const status = searchParams.get('status');

    const where = {
      ...(status && { status }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: true,
          manager: true,
          _count: {
            select: { tasks: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        createdBy: session.user.id
      },
      include: {
        client: true,
        manager: true
      }
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Development Process

### Daily Development Workflow

#### 1. Start of Day

```bash
# Update local development branch
git checkout develop
git pull origin develop

# Check for any new dependencies
npm install

# Run database migrations if any
npx prisma migrate dev

# Start development server
npm run dev
```

#### 2. Feature Development

```bash
# Create feature branch
git checkout -b feature/PM-123-new-feature

# Make changes and commit frequently
git add .
git commit -m "feat(scope): implement feature component"

# Run tests before pushing
npm run test
npm run lint
npm run typecheck

# Push to remote
git push origin feature/PM-123-new-feature
```

#### 3. Before Creating Pull Request

```bash
# Sync with latest develop
git checkout develop
git pull origin develop
git checkout feature/PM-123-new-feature
git rebase develop

# Run full test suite
npm run test:coverage
npm run build

# Ensure code quality
npm run lint:fix
npm run format

# Push rebased branch
git push --force-with-lease origin feature/PM-123-new-feature
```

### Development Commands

#### Available npm Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio"
  }
}
```

#### Common Development Tasks

```bash
# Database operations
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema changes
npm run db:migrate        # Create and run migrations
npm run db:seed           # Seed database with sample data
npm run db:studio         # Open Prisma Studio

# Testing
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report

# Code quality
npm run lint              # Check for linting errors
npm run lint:fix          # Fix auto-fixable linting errors
npm run format            # Format code with Prettier
npm run typecheck         # Check TypeScript types
```

---

## Code Review Process

### Pull Request Guidelines

#### 1. Creating a Pull Request

- **Title**: Use conventional commit format
- **Description**: Include context, changes, and testing notes
- **Labels**: Add appropriate labels (feature, bugfix, documentation)
- **Reviewers**: Assign at least 2 reviewers
- **Linked Issues**: Reference related issues/tickets

#### 2. Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- List of specific changes
- Another change
- Third change

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Type checking passes
- [ ] Linting passes

## Screenshots (if applicable)
Add screenshots or recordings of UI changes.

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] Tests added for new functionality
- [ ] All tests pass locally
```

#### 3. Review Criteria

Reviewers should check for:

- **Functionality**: Code works as intended
- **Code Quality**: Clean, readable, maintainable code
- **Performance**: No obvious performance issues
- **Security**: No security vulnerabilities
- **Testing**: Adequate test coverage
- **Documentation**: Code is well-documented
- **Standards**: Follows project conventions

#### 4. Review Process

```bash
# Reviewer workflow
git checkout develop
git pull origin develop
git checkout feature/PM-123-new-feature

# Test the changes
npm install
npm run test
npm run build
npm run dev

# Provide feedback through GitHub/GitLab interface
# Request changes or approve
```

### Code Review Checklist

#### For Authors

- [ ] Code is self-documenting with clear variable/function names
- [ ] Complex logic is commented
- [ ] All tests pass locally
- [ ] No console.log or debugging code left behind
- [ ] Error handling is implemented
- [ ] Security considerations addressed
- [ ] Performance impact considered
- [ ] Accessibility requirements met

#### For Reviewers

- [ ] Code solves the problem described in the ticket
- [ ] Implementation follows established patterns
- [ ] No obvious bugs or edge cases missed
- [ ] Error handling is robust
- [ ] Code is performant and scalable
- [ ] Security best practices followed
- [ ] Tests adequately cover the changes
- [ ] Documentation is updated if needed

---

## Testing Strategy

### Testing Framework Setup

```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/loading.tsx',
    '!src/app/not-found.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

```typescript
// jest.setup.js
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
    },
    status: 'authenticated',
  }),
}))
```

### Test Categories

#### 1. Unit Tests

```typescript
// tests/components/ProjectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectCard } from '@/components/ProjectCard'
import { Project } from '@/lib/types'

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'A test project',
  status: 'on_track',
  budget: 10000,
  spent: 5000,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  completion: 50,
  clientId: '1',
  clientName: 'Test Client',
  manager: 'Test Manager',
  tasks: [],
  team: [],
  documents: [],
}

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A test project')).toBeInTheDocument()
    expect(screen.getByText('on_track')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn()
    render(<ProjectCard project={mockProject} onEdit={mockOnEdit} />)
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(mockOnEdit).toHaveBeenCalledWith(mockProject)
  })

  it('displays budget and dates correctly', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText(/\$10,000/)).toBeInTheDocument()
    expect(screen.getByText(/Dec 31, 2024/)).toBeInTheDocument()
  })
})
```

#### 2. Integration Tests

```typescript
// tests/api/projects.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/projects/route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  project: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}))

describe('/api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/projects', () => {
    it('returns paginated projects', async () => {
      const mockProjects = [mockProject]
      ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
      ;(prisma.project.count as jest.Mock).mockResolvedValue(1)

      const { req, res } = createMocks({
        method: 'GET',
        query: { page: '1', limit: '10' },
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      const data = JSON.parse(res._getData())
      expect(data.projects).toHaveLength(1)
      expect(data.pagination.total).toBe(1)
    })
  })

  describe('POST /api/projects', () => {
    it('creates a new project', async () => {
      const newProject = {
        name: 'New Project',
        description: 'Project description',
        budget: 15000,
      }

      ;(prisma.project.create as jest.Mock).mockResolvedValue({
        id: '2',
        ...newProject,
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: newProject,
      })

      await handler(req, res)

      expect(res._getStatusCode()).toBe(201)
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: expect.objectContaining(newProject),
        include: expect.any(Object),
      })
    })
  })
})
```

#### 3. End-to-End Tests

```typescript
// tests/e2e/project-management.test.ts
import { test, expect } from '@playwright/test'

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'admin@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new project', async ({ page }) => {
    await page.goto('/dashboard/projects')
    await page.click('[data-testid="add-project-button"]')
    
    await page.fill('[data-testid="project-name"]', 'E2E Test Project')
    await page.fill('[data-testid="project-description"]', 'Created by E2E test')
    await page.fill('[data-testid="project-budget"]', '25000')
    
    await page.click('[data-testid="save-project-button"]')
    
    await expect(page.getByText('E2E Test Project')).toBeVisible()
  })

  test('should filter projects by status', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    await page.selectOption('[data-testid="status-filter"]', 'on_track')
    
    const projectCards = page.locator('[data-testid="project-card"]')
    await expect(projectCards).toHaveCount(2)
  })
})
```

---

## Release Management

### Release Process

#### 1. Release Preparation

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# Update version numbers
npm version 1.1.0

# Update CHANGELOG.md
# Update documentation
# Final testing
```

#### 2. Release Checklist

- [ ] All features for the release are complete
- [ ] All tests pass (unit, integration, e2e)
- [ ] Code coverage meets threshold (70%)
- [ ] Security scan completed
- [ ] Performance testing completed
- [ ] Documentation updated
- [ ] Database migrations tested
- [ ] Environment variables documented
- [ ] Deployment scripts tested

#### 3. Deployment Process

```bash
# Production deployment
git checkout main
git merge release/v1.1.0
git tag v1.1.0
git push origin main --tags

# Deploy to production
npm run build
npm run deploy:production

# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

### Version Management

#### Semantic Versioning

- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

#### Release Schedule

- **Major releases**: Quarterly (Q1, Q2, Q3, Q4)
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical bugs
- **Hotfixes**: Immediate for security issues

---

## Debugging & Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Issues

```bash
# Check PostgreSQL status
brew services list | grep postgresql
# or
sudo systemctl status postgresql

# Test connection
psql -h localhost -U username -d sebenza_construction

# Reset database
npm run db:reset
npm run db:seed
```

#### 2. Prisma Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Reset Prisma schema
npx prisma db push --force-reset

# Fix migration issues
npx prisma migrate reset
npx prisma migrate dev
```

#### 3. Next.js Build Issues

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run typecheck
```

#### 4. Authentication Issues

```bash
# Clear browser storage
# Check JWT_SECRET in environment
# Verify NextAuth configuration
# Check user session in database
```

### Debugging Tools

#### 1. Development Tools

```typescript
// Debug API routes
console.log('Request:', request.url, request.method)
console.log('Body:', await request.json())

// Debug React components
import { useEffect } from 'react'

useEffect(() => {
  console.log('Component state:', { projects, loading, error })
}, [projects, loading, error])
```

#### 2. Database Debugging

```bash
# Prisma Studio
npm run db:studio

# Direct SQL queries
psql -h localhost -U username -d sebenza_construction
SELECT * FROM projects WHERE status = 'on_track';
```

#### 3. Network Debugging

```bash
# Check API endpoints
curl -H "Authorization: Bearer <token>" http://localhost:9002/api/projects

# Network tab in browser DevTools
# Check request/response headers
# Verify CORS settings
```

---

## Best Practices Summary

### Do's

- ✅ Write self-documenting code with clear naming
- ✅ Use TypeScript types extensively
- ✅ Implement comprehensive error handling
- ✅ Write tests for new features
- ✅ Follow the established coding standards
- ✅ Keep commits small and focused
- ✅ Update documentation with changes
- ✅ Review your own code before submitting PR

### Don'ts

- ❌ Commit directly to main or develop branches
- ❌ Skip writing tests for new functionality
- ❌ Leave console.log statements in production code
- ❌ Ignore TypeScript errors or use `any` type
- ❌ Submit PRs without proper description
- ❌ Merge without code review approval
- ❌ Deploy without running full test suite
- ❌ Hard-code configuration values

---

**Document Status**: Development Ready  
**Last Updated**: July 2025  
**Next Review**: Monthly during active development
