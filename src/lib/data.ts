export type Task = {
  id: string;
  name: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: Date;
  status: "Done" | "In Progress" | "To Do";
  dependencies?: string[];
  startDate: Date;
  projectId: string;
};

export type Project = {
  id: string;
  name: string;
  manager: string;
  status: "On Track" | "At Risk" | "Off Track";
  completion: number;
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
};

const tasks: Task[] = [
    // Project 1 Tasks
    {
        id: "task-001-1",
        name: "Foundation & Structural Work",
        assignee: { name: "Bob Builder", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date("2023-04-30"),
        startDate: new Date("2023-01-15"),
        status: "Done",
        projectId: "proj-001",
    },
    {
        id: "task-001-2",
        name: "Exterior Cladding",
        assignee: { name: "Charlie Crane", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // due in 14 days
        startDate: new Date("2023-05-01"),
        status: "In Progress",
        dependencies: ["task-001-1"],
        projectId: "proj-001",
    },
    {
        id: "task-001-3",
        name: "Interior Wiring and Plumbing",
        assignee: { name: "Jane Doe", avatar: "https://placehold.co/32x32.png" }, // Assigned to Jane Doe
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // due in 30 days
        startDate: new Date("2023-08-16"),
        status: "To Do",
        dependencies: ["task-001-2"],
        projectId: "proj-001",
    },
    {
        id: "task-001-4",
        name: "Finishing and Landscaping",
        assignee: { name: "Eve Electric", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date("2024-12-15"),
        startDate: new Date("2023-12-01"),
        status: "To Do",
        dependencies: ["task-001-3"],
        projectId: "proj-001",
    },
    // Project 2 Tasks
    {
        id: "task-002-1",
        name: "Site Clearing and Grading",
        assignee: { name: "Frank Formwork", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date("2023-04-15"),
        startDate: new Date("2023-03-01"),
        status: "Done",
        projectId: "proj-002",
    },
    {
        id: "task-002-2",
        name: "Utility Installation",
        assignee: { name: "Grace Grader", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Overdue by 5 days
        startDate: new Date("2023-04-16"),
        status: "In Progress",
        projectId: "proj-002",
    },
    {
        id: "task-002-3",
        name: "Playground and Pavilion",
        assignee: { name: "Jane Doe", avatar: "https://placehold.co/32x32.png" }, // Assigned to Jane Doe
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // due in 7 days
        startDate: new Date("2023-07-01"),
        status: "To Do",
        projectId: "proj-002",
    },
    // Project 3 Tasks (none)
    // Project 4 Tasks
    {
        id: "task-004-1",
        name: "Finalize architectural plans",
        assignee: { name: "Jane Doe", avatar: "https://placehold.co/32x32.png" }, // Assigned to Jane Doe
        dueDate: new Date(new Date().setDate(new Date().getDate() - 2)), // Overdue
        startDate: new Date("2024-06-01"),
        status: "To Do",
        projectId: "proj-004",
    },
    {
        id: "task-004-2",
        name: "Client sign-off on materials",
        assignee: { name: "Alice Johnson", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(new Date().setDate(new Date().getDate() + 10)), // due in 10 days
        startDate: new Date("2024-06-05"),
        status: "In Progress",
        projectId: "proj-004",
    },
];

export const projects: Project[] = [
  {
    id: "proj-001",
    name: "Downtown Tower Renovation",
    manager: "Alice Johnson",
    status: "On Track",
    completion: 65,
    budget: 5000000,
    spent: 3250000,
    startDate: new Date("2023-01-15"),
    endDate: new Date("2024-12-31"),
    tasks: tasks.filter(t => t.projectId === "proj-001"),
  },
  {
    id: "proj-002",
    name: "Greenfield Community Park",
    manager: "Bob Vance",
    status: "At Risk",
    completion: 40,
    budget: 1200000,
    spent: 600000,
    startDate: new Date("2023-03-01"),
    endDate: new Date("2024-08-30"),
    tasks: tasks.filter(t => t.projectId === "proj-002"),
  },
  {
    id: "proj-003",
    name: "Coastal Highway Bridge",
    manager: "Carol Danvers",
    status: "Off Track",
    completion: 20,
    budget: 15000000,
    spent: 4500000,
    startDate: new Date("2023-06-01"),
    endDate: new Date("2025-05-31"),
    tasks: [],
  },
    {
    id: "proj-004",
    name: "Suburban Residential Complex",
    manager: "Alice Johnson",
    status: "On Track",
    completion: 85,
    budget: 8500000,
    spent: 7225000,
    startDate: new Date("2022-09-01"),
    endDate: new Date("2024-06-30"),
    tasks: tasks.filter(t => t.projectId === "proj-004"),
  },
];

export const allTasks = tasks;
