# Sebenza Construction PM - User Guide & Analysis

This document provides a comprehensive analysis of the Sebenza construction project management application, including its core users, the problems it solves, and a typical user flow.

## 1. Codebase & Feature Analysis

The application is a modern web platform built with a robust and scalable tech stack:

-   **Frontend**: Next.js (App Router), React, TypeScript
-   **UI**: Tailwind CSS with ShadCN UI components
-   **Data Visualization**: Recharts for charts and graphs
-   **AI**: Genkit for AI-powered features
-   **State Management**: Client-side state is managed within React components using `useState` and `useReducer`, which is suitable for the current scope.

### Core Features:

-   **Central Dashboard**: Provides a high-level, at-a-glance overview of the entire project portfolio with interactive KPI cards, financial charts, project status visuals, a recent activity feed, and a weather forecast.
-   **Comprehensive Project Management**: Full CRUD (Create, Read, Update, Delete) functionality for projects. The project detail view is a tabbed command center for managing tasks, budgets, team members, and documents.
-   **Advanced Task Management**: A dedicated page for managing all tasks across all projects with full CRUD, priority levels, assignee filtering, and sortable columns.
-   **Financial Tracking**: Full CRUD capabilities for Estimates, Invoices, and Expenses, turning the app into a powerful financial tool.
-   **Resource & Client Management**: Full CRUD for managing employees and clients.
-   **Document Hub**: A centralized repository for all project-related documents.
-   **AI-Powered Reporting**: A feature that uses Genkit to generate project progress summaries automatically.

## 2. Core Users & Problem Solved

### The Problem

Construction project management is inherently complex and fragmented. Managers juggle schedules, budgets, materials, subcontractors, client communications, and unpredictable variables like weather. Traditionally, this is managed with a messy combination of spreadsheets, emails, phone calls, and disparate software for accounting, which is inefficient, error-prone, and provides no real-time, unified view of project health.

**Sebenza solves this by being the single source of truth.** It provides an integrated, intuitive, and powerful platform that centralizes all project information, offers clear, actionable insights, and streamlines workflows. It replaces chaos with clarity, empowering managers to be proactive, not just reactive.

### Core User Persona

-   **Name**: Jane Doe
-   **Role**: **Project Manager (PM)**
-   **Responsibilities**:
    -   Overseeing multiple construction projects simultaneously.
    -   Managing project schedules, budgets, and resources.
    -   Coordinating with clients, employees, and subcontractors.
    -   Identifying and mitigating risks before they become critical issues.
-   **Needs & Pains**:
    -   Needs a quick, at-a-glance understanding of all her projects' health.
    -   Struggles to keep track of which tasks are falling behind across different projects.
    -   Spends too much time compiling status reports for stakeholders.
    -   Needs to make quick, data-driven decisions, often while away from a desk.

## 3. User Story & User Flow

### User Story

"**As a** Project Manager, **I want to** get a quick overview of all my projects' health, identify which tasks are overdue, and update the project status, **so that I can** prioritize my day's work, address bottlenecks before they become major issues, and keep stakeholders informed."

### User Flow: A Day in the Life of a PM

This flow follows Jane as she uses Sebenza to manage a typical daily challenge.

1.  **Login & Land on Dashboard**: Jane logs in and lands on the main dashboard (`/dashboard`).

2.  **Assess Overall Health**:
    -   She immediately glances at the KPI cards. "Projects At Risk" shows `2`, and "Overdue Tasks" shows `+5`.
    -   The "Project Status Overview" chart visually confirms that two projects need her attention.

3.  **Investigate Problem Projects**: She clicks the "Projects" link in the sidebar to navigate to the projects list (`/dashboard/projects`).

4.  **Filter and Identify**:
    -   On the projects page, she uses the status filter to show only "At Risk" and "Off Track" projects.
    -   The table instantly updates. The "Overdue" column shows that the "Coastal Highway Bridge" project has 3 overdue tasks. This is her top priority.

5.  **Drill Down into the Project**: She clicks on the "Coastal Highway Bridge" project name, navigating to its dedicated Project Command Center page (`/dashboard/projects/proj-003`).

6.  **Analyze and Act**:
    -   She clicks on the "Tasks" tab. She sees the list of tasks and identifies a critical path delay.
    -   She clicks the "Add Task" button to create a new mitigation task, "Expedite material delivery."
    -   In the dialog, she assigns it to the Site Supervisor, sets the priority to "Urgent," and gives it a due date of tomorrow.

7.  **Communicate Progress**:
    -   With a plan in place, she navigates to the "AI Progress Report" page (`/dashboard/ai-report`).
    -   She types in a few notes: "Identified delay on Coastal Bridge project. Expediting material delivery and re-assigned resources. Expect to be back on track by Friday."
    -   The AI generates a professional, concise summary that she can immediately email to the client, saving her 15 minutes of writing.
