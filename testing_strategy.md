# Sebenza Construction - Testing Strategy Document

## Document Information

- **Product**: Sebenza Construction Management Platform
- **Version**: 1.0
- **Date**: July 2025
- **Audience**: Development & QA Teams
- **Dependencies**: Jest, React Testing Library, Playwright

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Pyramid & Strategy](#testing-pyramid--strategy)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Data Management](#test-data-management)
9. [CI/CD Integration](#cicd-integration)
10. [Quality Metrics](#quality-metrics)

---

## Testing Philosophy

### Core Principles

**Test-Driven Development (TDD)**

- Write tests before implementing features
- Red-Green-Refactor cycle
- Ensure comprehensive coverage

**Quality Over Quantity**

- Focus on meaningful tests that catch real bugs
- Avoid testing implementation details
- Test user behavior and business logic

**Fast Feedback Loop**

- Tests should run quickly during development
- Immediate feedback on code changes
- Automated testing in CI/CD pipeline

**Maintainable Test Code**

- Tests are first-class code
- Follow same quality standards as production code
- Clear, readable, and well-organized

### Testing Goals

- **Prevent Regressions**: Catch bugs before they reach production
- **Enable Refactoring**: Safe code changes with confidence
- **Document Behavior**: Tests serve as living documentation
- **Improve Design**: Well-tested code tends to be better designed

---

## Testing Pyramid & Strategy

### Testing Pyramid Structure

```
       /\
      /  \
     / E2E \     <- Few, High-Value Tests
    /______\
   /        \
  /Integration\ <- More Tests, API & Component Integration
 /____________\
/              \
/   Unit Tests   \ <- Many, Fast, Isolated Tests
/________________\
```

### Test Distribution

- **Unit Tests**: 70% - Fast, isolated, numerous
- **Integration Tests**: 20% - API endpoints, component integration
- **End-to-End Tests**: 10% - Critical user journeys

### Test Categories

#### 1. Unit Tests

**Purpose**: Test individual functions, components, and modules in isolation

**Coverage**:

- React components
- Utility functions
- Custom hooks
- Business logic
- Data transformations

#### 2. Integration Tests

**Purpose**: Test interactions between components and systems

**Coverage**:

- API endpoints
- Database operations
- Component integration
- External service mocking

#### 3. End-to-End Tests

**Purpose**: Test complete user workflows from UI to database

**Coverage**:

- Critical user journeys
- Cross-browser compatibility
- Real user scenarios

---

## Unit Testing

### Framework Setup

#### Jest Configuration

```javascript
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
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig)
```

#### Test Setup

```javascript
// jest.setup.js
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
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
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => fn),
    formState: { errors: {} },
    reset: jest.fn(),
    setValue: jest.fn(),
    getValues: jest.fn(),
  }),
}))

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
```

### Component Testing

#### Basic Component Test

```typescript
// tests/components/ProjectCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectCard } from '@/components/ProjectCard'
import { Project } from '@/lib/types'

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  description: 'A test project description',
  status: 'on_track',
  budget: 10000,
  spent: 5000,
  completion: 50,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
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
    expect(screen.getByText('A test project description')).toBeInTheDocument()
    expect(screen.getByText('Test Client')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('displays correct status badge', () => {
    render(<ProjectCard project={mockProject} />)
    
    const statusBadge = screen.getByText('on_track')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-green-100') // or appropriate class
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnEdit = jest.fn()
    
    render(<ProjectCard project={mockProject} onEdit={mockOnEdit} />)
    
    const editButton = screen.getByRole('button', { name: /edit/i })
    await user.click(editButton)
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockProject)
  })

  it('shows confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup()
    const mockOnDelete = jest.fn()
    
    render(<ProjectCard project={mockProject} onDelete={mockOnDelete} />)
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)
    
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('formats currency and dates correctly', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText('$10,000.00')).toBeInTheDocument()
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument()
  })
})
```

#### Form Component Testing

```typescript
// tests/components/AddEditProjectDialog.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddEditProjectDialog } from '@/components/AddEditProjectDialog'

// Mock the form submission
const mockOnSubmit = jest.fn()
const mockOnClose = jest.fn()

describe('AddEditProjectDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(
      <AddEditProjectDialog 
        open={true} 
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    
    expect(screen.getByLabelText(/project name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/budget/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    
    render(
      <AddEditProjectDialog 
        open={true} 
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    
    await user.type(screen.getByLabelText(/project name/i), 'New Project')
    await user.type(screen.getByLabelText(/description/i), 'Project description')
    await user.type(screen.getByLabelText(/budget/i), '15000')
    
    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'New Project',
        description: 'Project description',
        budget: 15000,
      })
    })
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <AddEditProjectDialog 
        open={true} 
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /save/i })
    await user.click(submitButton)
    
    expect(screen.getByText(/project name is required/i)).toBeInTheDocument()
  })

  it('populates form when editing existing project', () => {
    const existingProject = {
      id: '1',
      name: 'Existing Project',
      description: 'Existing description',
      budget: 20000,
    }
    
    render(
      <AddEditProjectDialog 
        open={true} 
        project={existingProject}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    
    expect(screen.getByDisplayValue('Existing Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('20000')).toBeInTheDocument()
  })
})
```

### Utility Function Testing

```typescript
// tests/lib/utils.test.ts
import { 
  formatCurrency, 
  formatDate, 
  calculateProjectProgress,
  validateEmail 
} from '@/lib/utils'

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
    expect(formatCurrency(0)).toBe('$0.00')
    expect(formatCurrency(1000000)).toBe('$1,000,000.00')
  })

  it('handles negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500.00')
  })

  it('handles null and undefined', () => {
    expect(formatCurrency(null)).toBe('$0.00')
    expect(formatCurrency(undefined)).toBe('$0.00')
  })
})

describe('formatDate', () => {
  it('formats dates correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('Jan 15, 2024')
  })

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid Date')
    expect(formatDate(undefined)).toBe('Invalid Date')
  })
})

describe('calculateProjectProgress', () => {
  it('calculates progress based on completed tasks', () => {
    const tasks = [
      { status: 'done' },
      { status: 'done' },
      { status: 'in_progress' },
      { status: 'todo' },
    ]
    
    expect(calculateProjectProgress(tasks)).toBe(50) // 2 out of 4 completed
  })

  it('returns 0 for empty task list', () => {
    expect(calculateProjectProgress([])).toBe(0)
  })

  it('returns 100 when all tasks are done', () => {
    const tasks = [
      { status: 'done' },
      { status: 'done' },
    ]
    
    expect(calculateProjectProgress(tasks)).toBe(100)
  })
})

describe('validateEmail', () => {
  it('validates correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
  })

  it('rejects invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})
```

### Custom Hook Testing

```typescript
// tests/hooks/useProjects.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from '@/hooks/useProjects'

// Mock the API
jest.mock('@/lib/api', () => ({
  getProjects: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
}))

import { getProjects, createProject } from '@/lib/api'

describe('useProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches projects on mount', async () => {
    const mockProjects = [
      { id: '1', name: 'Project 1' },
      { id: '2', name: 'Project 2' },
    ]
    
    ;(getProjects as jest.Mock).mockResolvedValue(mockProjects)
    
    const { result } = renderHook(() => useProjects())
    
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.projects).toEqual(mockProjects)
    expect(getProjects).toHaveBeenCalledTimes(1)
  })

  it('handles API errors', async () => {
    const mockError = new Error('API Error')
    ;(getProjects as jest.Mock).mockRejectedValue(mockError)
    
    const { result } = renderHook(() => useProjects())
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.error).toBe(mockError)
    expect(result.current.projects).toEqual([])
  })

  it('creates new project', async () => {
    const newProject = { name: 'New Project', budget: 10000 }
    const createdProject = { id: '3', ...newProject }
    
    ;(createProject as jest.Mock).mockResolvedValue(createdProject)
    
    const { result } = renderHook(() => useProjects())
    
    await result.current.createProject(newProject)
    
    expect(createProject).toHaveBeenCalledWith(newProject)
    expect(result.current.projects).toContainEqual(createdProject)
  })
})
```

---

## Integration Testing

### API Endpoint Testing

#### Setup Test Database

```typescript
// tests/setup/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL,
    },
  },
})

export async function setupTestDb() {
  // Clean database
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Project", "Task" RESTART IDENTITY CASCADE`
  
  // Seed test data
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      passwordHash: 'hashed-password',
    },
  })
  
  return { testUser }
}

export async function teardownTestDb() {
  await prisma.$disconnect()
}

export { prisma }
```

#### API Route Testing

```typescript
// tests/api/projects.test.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/projects/route'
import { setupTestDb, teardownTestDb, prisma } from '../setup/database'

describe('/api/projects', () => {
  beforeAll(async () => {
    await setupTestDb()
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  beforeEach(async () => {
    // Clean projects table
    await prisma.project.deleteMany()
  })

  describe('GET /api/projects', () => {
    it('returns empty array when no projects exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/projects')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.projects).toEqual([])
      expect(data.pagination.total).toBe(0)
    })

    it('returns paginated projects', async () => {
      // Create test projects
      await prisma.project.createMany({
        data: [
          { name: 'Project 1', budget: 10000 },
          { name: 'Project 2', budget: 15000 },
          { name: 'Project 3', budget: 20000 },
        ],
      })

      const request = new NextRequest('http://localhost:3000/api/projects?page=1&limit=2')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(2)
      expect(data.pagination.total).toBe(3)
      expect(data.pagination.totalPages).toBe(2)
    })

    it('filters projects by status', async () => {
      await prisma.project.createMany({
        data: [
          { name: 'Project 1', status: 'on_track' },
          { name: 'Project 2', status: 'at_risk' },
          { name: 'Project 3', status: 'on_track' },
        ],
      })

      const request = new NextRequest('http://localhost:3000/api/projects?status=on_track')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(2)
      expect(data.projects.every(p => p.status === 'on_track')).toBe(true)
    })
  })

  describe('POST /api/projects', () => {
    it('creates new project with valid data', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        budget: 25000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      }

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data.project.name).toBe(projectData.name)
      expect(data.project.budget).toBe(projectData.budget)
      
      // Verify in database
      const savedProject = await prisma.project.findUnique({
        where: { id: data.project.id },
      })
      expect(savedProject).toBeTruthy()
    })

    it('validates required fields', async () => {
      const invalidData = {
        description: 'Missing name',
      }

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
      expect(data.details).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.stringContaining('required'),
        })
      )
    })

    it('validates date range', async () => {
      const invalidData = {
        name: 'Test Project',
        startDate: '2024-12-31',
        endDate: '2024-01-01', // End before start
      }

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data.details).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('End date must be after start date'),
        })
      )
    })
  })
})
```

### Database Integration Testing

```typescript
// tests/integration/database.test.ts
import { prisma } from '../setup/database'

describe('Database Integration', () => {
  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "Project", "Task", "Client" RESTART IDENTITY CASCADE`
  })

  it('creates project with related entities', async () => {
    const client = await prisma.client.create({
      data: {
        name: 'Test Client',
        email: 'client@example.com',
      },
    })

    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        clientId: client.id,
        tasks: {
          create: [
            {
              name: 'Task 1',
              status: 'todo',
            },
            {
              name: 'Task 2',
              status: 'in_progress',
            },
          ],
        },
      },
      include: {
        tasks: true,
        client: true,
      },
    })

    expect(project.client.name).toBe('Test Client')
    expect(project.tasks).toHaveLength(2)
    expect(project.tasks[0].name).toBe('Task 1')
  })

  it('handles task dependencies correctly', async () => {
    const project = await prisma.project.create({
      data: { name: 'Test Project' },
    })

    const task1 = await prisma.task.create({
      data: {
        name: 'Foundation',
        projectId: project.id,
      },
    })

    const task2 = await prisma.task.create({
      data: {
        name: 'Framing',
        projectId: project.id,
      },
    })

    await prisma.taskDependency.create({
      data: {
        taskId: task2.id,
        dependsOnTaskId: task1.id,
      },
    })

    const taskWithDependencies = await prisma.task.findUnique({
      where: { id: task2.id },
      include: {
        dependencies: {
          include: {
            dependsOnTask: true,
          },
        },
      },
    })

    expect(taskWithDependencies.dependencies).toHaveLength(1)
    expect(taskWithDependencies.dependencies[0].dependsOnTask.name).toBe('Foundation')
  })

  it('calculates project totals correctly', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        budget: 10000,
      },
    })

    await prisma.expense.createMany({
      data: [
        { projectId: project.id, amount: 1500, description: 'Materials' },
        { projectId: project.id, amount: 2500, description: 'Labor' },
        { projectId: project.id, amount: 500, description: 'Permits' },
      ],
    })

    const totalSpent = await prisma.expense.aggregate({
      where: { projectId: project.id },
      _sum: { amount: true },
    })

    await prisma.project.update({
      where: { id: project.id },
      data: { spent: totalSpent._sum.amount },
    })

    const updatedProject = await prisma.project.findUnique({
      where: { id: project.id },
    })

    expect(updatedProject.spent).toBe(4500)
    expect(updatedProject.budget - updatedProject.spent).toBe(5500) // Remaining budget
  })
})
```

---

## End-to-End Testing

### Playwright Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:9002',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Authentication Helper

```typescript
// tests/e2e/helpers/auth.ts
import { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login')
  await page.fill('[data-testid="email"]', 'admin@example.com')
  await page.fill('[data-testid="password"]', 'admin123')
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/dashboard')
}

export async function loginAsUser(page: Page, role: 'owner' | 'member' = 'member') {
  const credentials = {
    owner: { email: 'owner@example.com', password: 'owner123' },
    member: { email: 'member@example.com', password: 'member123' },
  }

  await page.goto('/auth/login')
  await page.fill('[data-testid="email"]', credentials[role].email)
  await page.fill('[data-testid="password"]', credentials[role].password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/dashboard')
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]')
  await page.click('[data-testid="logout-button"]')
  await page.waitForURL('/auth/login')
}
```

### Critical User Journey Tests

```typescript
// tests/e2e/project-management.test.ts
import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Project Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('complete project creation and management flow', async ({ page }) => {
    // Navigate to projects
    await page.goto('/dashboard/projects')
    await expect(page.getByText('Projects')).toBeVisible()

    // Create new project
    await page.click('[data-testid="add-project-button"]')
    await expect(page.getByText('Add New Project')).toBeVisible()

    await page.fill('[data-testid="project-name"]', 'E2E Test Project')
    await page.fill('[data-testid="project-description"]', 'Created by automated test')
    await page.fill('[data-testid="project-budget"]', '50000')
    await page.fill('[data-testid="start-date"]', '2024-01-01')
    await page.fill('[data-testid="end-date"]', '2024-12-31')

    await page.click('[data-testid="save-project-button"]')
    await expect(page.getByText('Project created successfully')).toBeVisible()

    // Verify project appears in list
    await expect(page.getByText('E2E Test Project')).toBeVisible()
    await expect(page.getByText('$50,000')).toBeVisible()

    // Navigate to project details
    await page.click('[data-testid="project-link"]')
    await expect(page.getByText('E2E Test Project')).toBeVisible()
    await expect(page.getByText('Created by automated test')).toBeVisible()

    // Add tasks to project
    await page.click('[data-testid="add-task-button"]')
    await page.fill('[data-testid="task-name"]', 'Foundation Work')
    await page.selectOption('[data-testid="task-priority"]', 'high')
    await page.fill('[data-testid="task-due-date"]', '2024-03-31')
    await page.click('[data-testid="save-task-button"]')

    await expect(page.getByText('Foundation Work')).toBeVisible()
    await expect(page.getByText('high')).toBeVisible()

    // Update task status
    await page.click('[data-testid="task-status-dropdown"]')
    await page.click('[data-testid="status-in-progress"]')
    await expect(page.getByText('in_progress')).toBeVisible()

    // Verify project progress updated
    await expect(page.getByText('Progress:')).toBeVisible()
  })

  test('project filtering and search', async ({ page }) => {
    await page.goto('/dashboard/projects')

    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'on_track')
    await page.waitForLoadState('networkidle')
    
    const projectCards = page.locator('[data-testid="project-card"]')
    const count = await projectCards.count()
    
    for (let i = 0; i < count; i++) {
      await expect(projectCards.nth(i).locator('[data-testid="status-badge"]')).toHaveText('on_track')
    }

    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'Test Project')
    await page.waitForLoadState('networkidle')
    
    await expect(page.getByText('Test Project')).toBeVisible()
  })

  test('project deletion with confirmation', async ({ page }) => {
    await page.goto('/dashboard/projects')
    
    // Find and delete a project
    await page.click('[data-testid="project-menu-button"]')
    await page.click('[data-testid="delete-project-button"]')
    
    // Confirm deletion
    await expect(page.getByText('Are you sure you want to delete this project?')).toBeVisible()
    await page.click('[data-testid="confirm-delete-button"]')
    
    await expect(page.getByText('Project deleted successfully')).toBeVisible()
  })
})
```

### Financial Management Flow

```typescript
// tests/e2e/financial-management.test.ts
import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Financial Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('create estimate and convert to invoice', async ({ page }) => {
    // Create estimate
    await page.goto('/dashboard/estimates')
    await page.click('[data-testid="add-estimate-button"]')

    await page.selectOption('[data-testid="client-select"]', 'Test Client')
    
    // Add line items
    await page.click('[data-testid="add-line-item-button"]')
    await page.fill('[data-testid="line-item-description-0"]', 'Foundation Work')
    await page.fill('[data-testid="line-item-quantity-0"]', '1')
    await page.fill('[data-testid="line-item-unit-price-0"]', '25000')

    await page.click('[data-testid="add-line-item-button"]')
    await page.fill('[data-testid="line-item-description-1"]', 'Framing')
    await page.fill('[data-testid="line-item-quantity-1"]', '1')
    await page.fill('[data-testid="line-item-unit-price-1"]', '15000')

    // Verify total calculation
    await expect(page.getByText('$40,000.00')).toBeVisible()

    await page.fill('[data-testid="tax-rate"]', '8.5')
    await page.fill('[data-testid="notes"]', 'Test estimate notes')

    await page.click('[data-testid="save-estimate-button"]')
    await expect(page.getByText('Estimate created successfully')).toBeVisible()

    // Send estimate to client
    await page.click('[data-testid="send-estimate-button"]')
    await expect(page.getByText('Estimate sent successfully')).toBeVisible()

    // Convert to invoice
    await page.click('[data-testid="convert-to-invoice-button"]')
    await expect(page.getByText('Create Invoice from Estimate')).toBeVisible()

    await page.fill('[data-testid="due-date"]', '2024-02-15')
    await page.click('[data-testid="create-invoice-button"]')

    await expect(page.getByText('Invoice created successfully')).toBeVisible()
    await expect(page).toHaveURL(/\/dashboard\/invoices\//)
  })

  test('expense tracking and project association', async ({ page }) => {
    await page.goto('/dashboard/expenses')
    await page.click('[data-testid="add-expense-button"]')

    await page.fill('[data-testid="expense-description"]', 'Construction Materials')
    await page.fill('[data-testid="expense-amount"]', '5000')
    await page.selectOption('[data-testid="expense-category"]', 'materials')
    await page.selectOption('[data-testid="project-select"]', 'Test Project')
    await page.check('[data-testid="is-billable"]')

    await page.click('[data-testid="save-expense-button"]')
    await expect(page.getByText('Expense added successfully')).toBeVisible()

    // Verify expense appears in project
    await page.goto('/dashboard/projects')
    await page.click('[data-testid="project-link"]')
    await page.click('[data-testid="expenses-tab"]')

    await expect(page.getByText('Construction Materials')).toBeVisible()
    await expect(page.getByText('$5,000.00')).toBeVisible()
  })
})
```

### Responsive Design Testing

```typescript
// tests/e2e/responsive.test.ts
import { test, expect, devices } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Responsive Design', () => {
  test('mobile navigation works correctly', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12'],
    })
    const page = await context.newPage()

    await loginAsAdmin(page)
    await page.goto('/dashboard')

    // Mobile menu should be hidden initially
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible()

    // Click hamburger menu
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

    // Navigate using mobile menu
    await page.click('[data-testid="mobile-projects-link"]')
    await expect(page).toHaveURL('/dashboard/projects')

    await context.close()
  })

  test('tablet layout adjustments', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro'],
    })
    const page = await context.newPage()

    await loginAsAdmin(page)
    await page.goto('/dashboard/projects')

    // Check grid layout on tablet
    const projectGrid = page.locator('[data-testid="projects-grid"]')
    await expect(projectGrid).toHaveCSS('grid-template-columns', /repeat\(2,/)

    await context.close()
  })
})
```

---

## Performance Testing

### Load Testing Setup

```typescript
// tests/performance/load-test.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('dashboard loads within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'admin@example.com')
    await page.fill('[data-testid="password"]', 'admin123')

    const startTime = Date.now()
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
    const loadTime = Date.now() - startTime

    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)

    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries()
          const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint')
          const cls = entries.find(entry => entry.entryType === 'layout-shift')
          
          resolve({
            lcp: lcp?.startTime || 0,
            cls: cls?.value || 0,
          })
        }).observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] })
      })
    })

    expect(metrics.lcp).toBeLessThan(2500) // LCP < 2.5s
    expect(metrics.cls).toBeLessThan(0.1)  // CLS < 0.1
  })

  test('large project list performance', async ({ page }) => {
    await page.goto('/dashboard/projects')

    // Measure rendering time for large dataset
    const startTime = Date.now()
    await page.waitForSelector('[data-testid="project-card"]')
    const renderTime = Date.now() - startTime

    expect(renderTime).toBeLessThan(1000) // Should render within 1 second

    // Test scrolling performance
    await page.evaluate(() => {
      return new Promise(resolve => {
        let frameCount = 0
        const startTime = performance.now()

        function countFrames() {
          frameCount++
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrames)
          } else {
            resolve(frameCount)
          }
        }

        // Trigger scroll
        window.scrollTo(0, document.body.scrollHeight)
        requestAnimationFrame(countFrames)
      })
    })
  })
})
```

### Memory Leak Testing

```typescript
// tests/performance/memory-leak.test.ts
import { test, expect } from '@playwright/test'

test.describe('Memory Leak Tests', () => {
  test('no memory leaks in navigation', async ({ page }) => {
    await page.goto('/dashboard')

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // Navigate through different pages multiple times
    const pages = [
      '/dashboard/projects',
      '/dashboard/tasks',
      '/dashboard/clients',
      '/dashboard/invoices',
      '/dashboard/expenses',
    ]

    for (let i = 0; i < 5; i++) {
      for (const pagePath of pages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')
      }
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) {
        window.gc()
      }
    })

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })

    // Memory usage shouldn't increase significantly
    const memoryIncrease = finalMemory - initialMemory
    const maxAcceptableIncrease = 50 * 1024 * 1024 // 50MB

    expect(memoryIncrease).toBeLessThan(maxAcceptableIncrease)
  })
})
```

---

## Security Testing

### Authentication & Authorization Tests

```typescript
// tests/security/auth.test.ts
import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test('protects routes from unauthorized access', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/dashboard/projects')
    await expect(page).toHaveURL('/auth/login')

    // Try to access admin routes as regular user
    await page.fill('[data-testid="email"]', 'member@example.com')
    await page.fill('[data-testid="password"]', 'member123')
    await page.click('[data-testid="login-button"]')

    await page.goto('/dashboard/employees')
    await expect(page.getByText('Access Denied')).toBeVisible()
  })

  test('session expires correctly', async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'admin@example.com')
    await page.fill('[data-testid="password"]', 'admin123')
    await page.click('[data-testid="login-button"]')

    // Simulate session expiration
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    // Try to access protected route
    await page.goto('/dashboard/projects')
    await expect(page).toHaveURL('/auth/login')
  })

  test('prevents XSS attacks in form inputs', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('[data-testid="email"]', 'admin@example.com')
    await page.fill('[data-testid="password"]', 'admin123')
    await page.click('[data-testid="login-button"]')

    await page.goto('/dashboard/projects')
    await page.click('[data-testid="add-project-button"]')

    // Try to inject script
    const maliciousScript = '<script>alert("XSS")</script>'
    await page.fill('[data-testid="project-name"]', maliciousScript)
    await page.click('[data-testid="save-project-button"]')

    // Ensure script is not executed
    const projectName = await page.textContent('[data-testid="project-name-display"]')
    expect(projectName).toBe(maliciousScript) // Should be escaped/sanitized
  })
})
```

---

## Test Data Management

### Test Data Factory

```typescript
// tests/factories/index.ts
import { faker } from '@faker-js/faker'

export const UserFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'member' as const,
    createdAt: faker.date.past(),
    ...overrides,
  }),

  admin: () => UserFactory.build({ role: 'admin' }),
  owner: () => UserFactory.build({ role: 'owner' }),
  member: () => UserFactory.build({ role: 'member' }),
}

export const ProjectFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.buzzPhrase(),
    description: faker.lorem.paragraph(),
    status: 'on_track' as const,
    budget: faker.number.int({ min: 10000, max: 1000000 }),
    spent: faker.number.int({ min: 0, max: 50000 }),
    completion: faker.number.int({ min: 0, max: 100 }),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    createdAt: faker.date.past(),
    ...overrides,
  }),

  onTrack: () => ProjectFactory.build({ status: 'on_track' }),
  atRisk: () => ProjectFactory.build({ status: 'at_risk' }),
  offTrack: () => ProjectFactory.build({ status: 'off_track' }),
}

export const TaskFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.hacker.phrase(),
    description: faker.lorem.paragraph(),
    status: 'todo' as const,
    priority: 'medium' as const,
    startDate: faker.date.past(),
    dueDate: faker.date.future(),
    projectId: faker.string.uuid(),
    createdAt: faker.date.past(),
    ...overrides,
  }),

  urgent: () => TaskFactory.build({ priority: 'urgent', status: 'in_progress' }),
  completed: () => TaskFactory.build({ status: 'done' }),
}
```

### Database Seeding

```typescript
// tests/setup/seed.ts
import { prisma } from './database'
import { UserFactory, ProjectFactory, TaskFactory } from '../factories'

export async function seedTestData() {
  // Create test users
  const admin = await prisma.user.create({
    data: UserFactory.admin(),
  })

  const owner = await prisma.user.create({
    data: UserFactory.owner(),
  })

  const member = await prisma.user.create({
    data: UserFactory.member(),
  })

  // Create test clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Test Client 1',
      email: 'client1@example.com',
      company: 'Client Company 1',
    },
  })

  // Create test projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        ...ProjectFactory.onTrack(),
        clientId: client1.id,
        managerId: owner.id,
      },
    }),
    prisma.project.create({
      data: {
        ...ProjectFactory.atRisk(),
        clientId: client1.id,
        managerId: owner.id,
      },
    }),
  ])

  // Create test tasks
  for (const project of projects) {
    await Promise.all([
      prisma.task.create({
        data: {
          ...TaskFactory.build(),
          projectId: project.id,
          assigneeId: member.id,
        },
      }),
      prisma.task.create({
        data: {
          ...TaskFactory.urgent(),
          projectId: project.id,
          assigneeId: member.id,
        },
      }),
    ])
  }

  return {
    users: { admin, owner, member },
    clients: { client1 },
    projects,
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run typecheck
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: sebenza_construction_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/sebenza_construction_test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/sebenza_construction_test

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Quality Metrics

### Coverage Requirements

- **Unit Tests**: Minimum 70% coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: All critical user flows covered

### Quality Gates

```json
{
  "coverage": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    },
    "perFile": {
      "branches": 60,
      "functions": 60,
      "lines": 60,
      "statements": 60
    }
  },
  "performance": {
    "pageLoadTime": 3000,
    "apiResponseTime": 500,
    "bundleSize": "500KB"
  },
  "accessibility": {
    "wcagLevel": "AA",
    "minScore": 90
  }
}
```

### Reporting

- **Daily**: Test execution reports
- **Weekly**: Coverage trend analysis
- **Monthly**: Performance metrics review
- **Quarterly**: Testing strategy assessment

---

**Document Status**: Implementation Ready  
**Last Updated**: July 2025  
**Next Review**: Monthly during active development
