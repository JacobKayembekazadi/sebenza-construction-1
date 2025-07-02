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
    tasks: [
      {
        id: "task-001-1",
        name: "Foundation & Structural Work",
        assignee: { name: "Bob Builder", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date("2023-04-30"),
        startDate: new Date("2023-01-15"),
        status: "Done",
      },
      {
        id: "task-001-2",
        name: "Exterior Cladding",
        assignee: { name: "Charlie Crane", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date("2023-08-15"),
        startDate: new Date("2023-05-01"),
        status: "In Progress",
        dependencies: ["task-001-1"],
      },
      {
        id: "task-001-3",
        name: "Interior Wiring and Plumbing",
        assignee: { name: "David Drill", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date("2023-11-30"),
        startDate: new Date("2023-08-16"),
        status: "To Do",
        dependencies: ["task-001-2"],
      },
      {
        id: "task-001-4",
        name: "Finishing and Landscaping",
        assignee: { name: "Eve Electric", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date("2024-12-15"),
        startDate: new Date("2023-12-01"),
        status: "To Do",
        dependencies: ["task-001-3"],
      },
    ],
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
    tasks: [
        {
            id: "task-002-1",
            name: "Site Clearing and Grading",
            assignee: { name: "Frank Formwork", avatar: "https://placehold.co/32x32.png" },
            dueDate: new Date("2023-04-15"),
            startDate: new Date("2023-03-01"),
            status: "Done",
        },
        {
            id: "task-002-2",
            name: "Utility Installation",
            assignee: { name: "Grace Grader", avatar: "https://placehold.co/32x32.png" },
            dueDate: new Date("2023-06-30"),
            startDate: new Date("2023-04-16"),
            status: "In Progress",
        },
        {
            id: "task-002-3",
            name: "Playground and Pavilion",
            assignee: { name: "Heidi Hammer", avatar: "https://placehold.co/32x32.png" },
            dueDate: new Date("2023-10-31"),
            startDate: new Date("2023-07-01"),
            status: "To Do",
        },
    ],
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
    tasks: [],
  },
];
