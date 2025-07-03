

export type Task = {
  id: string;
  name: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: Date;
  status: "Done" | "In Progress" | "To Do";
  priority: "Low" | "Medium" | "High" | "Urgent";
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
  clientId: string;
  clientName: string;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  billingAddress: string;
  shippingAddress: string;
};

export type EstimateLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Estimate = {
  id: string;
  clientId: string;
  clientName: string;
  lineItems: EstimateLineItem[];
  subtotal: number;
  tax: number; // Percentage
  discount: number; // Fixed amount
  total: number;
  issueDate: Date;
  expiryDate: Date;
  status: "Draft" | "Sent" | "Accepted" | "Declined";
  notes?: string;
  terms?: string;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Invoice = {
  id: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName:string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number; // Percentage
  discount: number; // Fixed amount
  total: number;
  issueDate: Date;
  dueDate: Date;
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Partial";
  notes?: string;
  terms?: string;
  isRecurring?: boolean;
  recurringInterval?: 'days' | 'weeks' | 'months';
  recurringPeriod?: number;
};

export type Employee = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "Project Manager" | "Site Supervisor" | "Electrician" | "Plumber" | "Laborer" | "Admin" | "Manager" | "Accountant" | "Contractor";
    avatar: string;
};

export type Expense = {
    id: string;
    description: string;
    amount: number;
    category: "Materials" | "Labor" | "Permits" | "Subcontractor" | "Other";
    date: Date;
    projectId: string;
    projectName: string;
};

export type Document = {
    id: string;
    name: string;
    type: "PDF" | "Image" | "Word" | "Excel";
    uploadDate: Date;
    projectId: string;
    projectName: string;
    url: string; // a dummy url
};

export type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type PurchaseOrderLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  supplierName: string;
  lineItems: PurchaseOrderLineItem[];
  total: number;
  issueDate: Date;
  deliveryDate: Date;
  status: "Draft" | "Sent" | "Fulfilled" | "Cancelled";
  notes?: string;
};


export type FinancialData = {
  month: string;
  revenue: number;
  expenses: number;
};

export type Activity = {
  id:string;
  type: "TASK_ADDED" | "INVOICE_PAID" | "FILE_UPLOADED" | "PROJECT_STATUS" | "CLIENT_COMMENT";
  description: string;
  timestamp: string;
  user: string;
  projectId?: string;
};

export type Resource = {
  name: string;
  utilization: number;
  team: string;
};

export type WeatherForecastData = {
    day: string;
    icon: 'Sun' | 'Cloud' | 'Cloudy' | 'CloudRain' | 'Wind';
    temp: number;
};

export type BankAccount = {
    id: string;
    bankName: string;
    accountNumber: string;
    balance: number;
    logoUrl: string;
};

export const employees: Employee[] = [
    { id: "emp-001", name: "Jane Doe", email: "jane.doe@example.com", phone: "555-0101", role: "Admin", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-002", name: "Bob Builder", email: "bob.builder@example.com", phone: "555-0102", role: "Manager", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-003", name: "Charlie Crane", email: "charlie.crane@example.com", phone: "555-0103", role: "Employee", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-004", name: "David Drill", email: "david.drill@example.com", phone: "555-0104", role: "Employee", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-005", name: "Eve Electric", email: "eve.electric@example.com", phone: "555-0105", role: "Contractor", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-006", name: "Frank Formwork", email: "frank.formwork@example.com", phone: "555-0106", role: "Employee", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-007", name: "Grace Grader", email: "grace.grader@example.com", phone: "555-0107", role: "Manager", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-008", name: "Alice Johnson", email: "alice.johnson@example.com", phone: "555-0108", role: "Manager", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-009", name: "Bob Vance", email: "bob.vance@example.com", phone: "555-0109", role: "Accountant", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-010", name: "Carol Danvers", email: "carol.danvers@example.com", phone: "555-0110", role: "Admin", avatar: "https://placehold.co/32x32.png" },
];


const tasks: Task[] = [
    // Project 1 Tasks
    {
        id: "task-001-1",
        name: "Foundation & Structural Work",
        assignee: { name: "Bob Builder", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2023, 3, 30),
        startDate: new Date(2023, 0, 15),
        status: "Done",
        priority: "High",
        projectId: "proj-001",
    },
    {
        id: "task-001-2",
        name: "Exterior Cladding",
        assignee: { name: "Charlie Crane", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2024, 7, 14), 
        startDate: new Date(2023, 4, 1),
        status: "In Progress",
        priority: "High",
        dependencies: ["task-001-1"],
        projectId: "proj-001",
    },
    {
        id: "task-001-3",
        name: "Interior Wiring and Plumbing",
        assignee: { name: "Jane Doe", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2024, 8, 14), 
        startDate: new Date(2023, 7, 16),
        status: "To Do",
        priority: "Medium",
        dependencies: ["task-001-2"],
        projectId: "proj-001",
    },
    {
        id: "task-001-4",
        name: "Finishing and Landscaping",
        assignee: { name: "Eve Electric", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2024, 11, 15),
        startDate: new Date(2023, 11, 1),
        status: "To Do",
        priority: "Low",
        dependencies: ["task-001-3"],
        projectId: "proj-001",
    },
    // Project 2 Tasks
    {
        id: "task-002-1",
        name: "Site Clearing and Grading",
        assignee: { name: "Frank Formwork", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2023, 3, 15),
        startDate: new Date(2023, 2, 1),
        status: "Done",
        priority: "High",
        projectId: "proj-002",
    },
    {
        id: "task-002-2",
        name: "Utility Installation",
        assignee: { name: "Grace Grader", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2024, 6, 10), // Overdue
        startDate: new Date(2023, 3, 16),
        status: "In Progress",
        priority: "Urgent",
        projectId: "proj-002",
    },
    {
        id: "task-002-3",
        name: "Playground and Pavilion",
        assignee: { name: "Jane Doe", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2024, 6, 22), 
        startDate: new Date(2023, 6, 1),
        status: "To Do",
        priority: "Medium",
        projectId: "proj-002",
    },
    // Project 3 Tasks (none)
    // Project 4 Tasks
    {
        id: "task-004-1",
        name: "Finalize architectural plans",
        assignee: { name: "Jane Doe", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2024, 6, 13), // Overdue
        startDate: new Date(2024, 5, 1),
        status: "To Do",
        priority: "Urgent",
        projectId: "proj-004",
    },
    {
        id: "task-004-2",
        name: "Client sign-off on materials",
        assignee: { name: "Alice Johnson", avatar: "https://placehold.co/32x32.png" },
        dueDate: new Date(2024, 6, 25), 
        startDate: new Date(2024, 5, 5),
        status: "In Progress",
        priority: "High",
        projectId: "proj-004",
    },
];

export const clients: Client[] = [
  { id: "client-1", name: "Global Corp", company: "Global Corp Inc.", email: "contact@globalcorp.com", phone: "123-456-7890", status: "Active", billingAddress: "123 Global Ave\nNew York, NY 10001\nUSA", shippingAddress: "456 Corporate Blvd\nNew York, NY 10001\nUSA" },
  { id: "client-2", name: "Innovate LLC", company: "Innovate LLC", email: "hello@innovate.com", phone: "234-567-8901", status: "Active", billingAddress: "789 Innovation Dr\nPalo Alto, CA 94301\nUSA", shippingAddress: "789 Innovation Dr\nPalo Alto, CA 94301\nUSA" },
  { id: "client-3", name: "Mega Builders", company: "Mega Builders Co.", email: "info@megabuilders.com", phone: "345-678-9012", status: "Inactive", billingAddress: "101 Construction Rd\nHouston, TX 77001\nUSA", shippingAddress: "202 Site-B Rd\nHouston, TX 77001\nUSA" },
  { id: "client-4", name: "Quantum Solutions", company: "Quantum Solutions", email: "support@quantum.com", phone: "456-789-0123", status: "Active", billingAddress: "303 Quantum Ln\nSeattle, WA 98101\nUSA", shippingAddress: "303 Quantum Ln\nSeattle, WA 98101\nUSA" },
];

export const suppliers: Supplier[] = [
    { id: "sup-1", name: "Steel & Co.", email: "sales@steelandco.com", phone: "555-0201", address: "1 Steel Plaza, Pittsburgh, PA" },
    { id: "sup-2", name: "Concrete King", email: "orders@concreteking.com", phone: "555-0202", address: "2 Cement Rd, Boulder, CO" },
    { id: "sup-3", name: "Lumber Liquidators", email: "contact@lumberliquidators.com", phone: "555-0203", address: "3 Wood St, Portland, OR" },
];

export const purchaseOrders: PurchaseOrder[] = [
    {
        id: "po-001",
        supplierId: "sup-1",
        supplierName: "Steel & Co.",
        lineItems: [
            { id: "li-po-1", description: "I-Beams (20ft)", quantity: 50, unitPrice: 350, total: 17500 }
        ],
        total: 17500,
        issueDate: new Date(2024, 5, 1),
        deliveryDate: new Date(2024, 5, 30),
        status: "Sent",
        notes: "Deliver to Site A."
    },
    {
        id: "po-002",
        supplierId: "sup-2",
        supplierName: "Concrete King",
        lineItems: [
            { id: "li-po-2", description: "5000 PSI Concrete (cubic yards)", quantity: 100, unitPrice: 150, total: 15000 }
        ],
        total: 15000,
        issueDate: new Date(2024, 4, 20),
        deliveryDate: new Date(2024, 5, 10),
        status: "Fulfilled",
        notes: ""
    },
    {
        id: "po-003",
        supplierId: "sup-3",
        supplierName: "Lumber Liquidators",
        lineItems: [
            { id: "li-po-3", description: "2x4 Lumber (8ft)", quantity: 500, unitPrice: 8, total: 4000 }
        ],
        total: 4000,
        issueDate: new Date(2024, 5, 5),
        deliveryDate: new Date(2024, 5, 15),
        status: "Draft",
        notes: "Call Bob on arrival."
    }
];

export const projects: Project[] = [
  {
    id: "proj-001",
    name: "Johannesburg to Cape Town",
    manager: "Alice Johnson",
    status: "On Track",
    completion: 65,
    budget: 50000,
    spent: 32500,
    startDate: new Date(2023, 0, 15),
    endDate: new Date(2024, 11, 31),
    tasks: tasks.filter(t => t.projectId === "proj-001"),
    clientId: "client-1",
    clientName: "Global Corp"
  },
  {
    id: "proj-002",
    name: "Durban Port Clearance",
    manager: "Bob Vance",
    status: "At Risk",
    completion: 40,
    budget: 12000,
    spent: 6000,
    startDate: new Date(2023, 2, 1),
    endDate: new Date(2024, 7, 30),
    tasks: tasks.filter(t => t.projectId === "proj-002"),
    clientId: "client-2",
    clientName: "Innovate LLC"
  },
  {
    id: "proj-003",
    name: "Cross-Border to Zimbabwe",
    manager: "Carol Danvers",
    status: "Off Track",
    completion: 20,
    budget: 150000,
    spent: 45000,
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2025, 4, 31),
    tasks: [],
    clientId: "client-4",
    clientName: "Quantum Solutions"
  },
    {
    id: "proj-004",
    name: "Local Warehouse Distribution",
    manager: "Alice Johnson",
    status: "On Track",
    completion: 85,
    budget: 85000,
    spent: 72250,
    startDate: new Date(2022, 8, 1),
    endDate: new Date(2024, 5, 30),
    tasks: tasks.filter(t => t.projectId === "proj-004"),
    clientId: "client-1",
    clientName: "Global Corp"
  },
];

export const allTasks = tasks;

export const estimates: Estimate[] = [
    { 
        id: "est-001", 
        clientId: "client-1", 
        clientName: "Global Corp", 
        lineItems: [
            { id: "li-1", description: "Freight Cost", quantity: 1, unitPrice: 5000, total: 5000 },
            { id: "li-2", description: "Handling Fees", quantity: 100, unitPrice: 150, total: 15000 },
        ],
        subtotal: 20000,
        tax: 8.25,
        discount: 1000,
        total: 20000 * (1 + 8.25/100) - 1000,
        issueDate: new Date(2024, 4, 15), 
        expiryDate: new Date(2024, 5, 15), 
        status: "Accepted",
        notes: "This is a preliminary quote.",
        terms: "Payment due upon acceptance."
    },
    { 
        id: "est-002", 
        clientId: "client-2", 
        clientName: "Innovate LLC", 
        lineItems: [
            { id: "li-3", description: "Customs Clearance", quantity: 1, unitPrice: 25000, total: 25000 },
        ],
        subtotal: 25000,
        tax: 0,
        discount: 0,
        total: 25000,
        issueDate: new Date(2024, 5, 1), 
        expiryDate: new Date(2024, 6, 1), 
        status: "Sent",
        notes: "",
        terms: ""
    },
    { 
        id: "est-003", 
        clientId: "client-3", 
        clientName: "Mega Builders", 
        lineItems: [],
        subtotal: 0,
        tax: 10,
        discount: 0,
        total: 0,
        issueDate: new Date(2024, 5, 5), 
        expiryDate: new Date(2024, 6, 5), 
        status: "Draft",
        notes: "",
        terms: ""
    },
    { 
        id: "est-004", 
        clientId: "client-1", 
        clientName: "Global Corp", 
        lineItems: [
             { id: "li-4", description: "Storage Fees", quantity: 1, unitPrice: 3000, total: 3000 },
        ],
        subtotal: 3000,
        tax: 0,
        discount: 0,
        total: 3000,
        issueDate: new Date(2024, 3, 10), 
        expiryDate: new Date(2024, 4, 10), 
        status: "Declined",
        notes: "",
        terms: ""
    },
];

export const invoices: Invoice[] = [
    { 
        id: "inv-001", 
        clientId: "client-1", 
        clientName: "Global Corp", 
        projectId: "proj-001", 
        projectName: "Johannesburg to Cape Town", 
        lineItems: [{id: 'li-inv-1', description: 'Phase 1 Payment', quantity: 1, unitPrice: 50000, total: 50000}],
        subtotal: 50000,
        tax: 0,
        discount: 0,
        total: 50000,
        issueDate: new Date(2024, 5, 1), 
        dueDate: new Date(2024, 6, 1), 
        status: "Paid",
        notes: "Thank you for your business.",
        terms: "Payment due upon receipt."
    },
    { 
        id: "inv-002", 
        clientId: "client-2", 
        clientName: "Innovate LLC", 
        projectId: "proj-002", 
        projectName: "Durban Port Clearance", 
        lineItems: [{id: 'li-inv-2', description: 'Consulting Services', quantity: 1, unitPrice: 75000, total: 75000}],
        subtotal: 75000,
        tax: 10,
        discount: 5000,
        total: (75000 * 1.10) - 5000,
        issueDate: new Date(2024, 5, 5), 
        dueDate: new Date(2024, 6, 5), 
        status: "Sent"
    },
    { 
        id: "inv-003", 
        clientId: "client-1", 
        clientName: "Global Corp", 
        projectId: "proj-004", 
        projectName: "Local Warehouse Distribution", 
        lineItems: [{id: 'li-inv-3', description: 'Full Project Billing', quantity: 1, unitPrice: 120000, total: 120000}],
        subtotal: 120000,
        tax: 0,
        discount: 0,
        total: 120000,
        issueDate: new Date(2024, 4, 1), 
        dueDate: new Date(2024, 5, 20), 
        status: "Overdue"
    },
    { 
        id: "inv-004", 
        clientId: "client-4", 
        clientName: "Quantum Solutions", 
        projectId: "proj-002", 
        projectName: "Durban Port Clearance", 
        lineItems: [{id: 'li-inv-4', description: 'Initial Mobilization', quantity: 1, unitPrice: 35000, total: 35000}],
        subtotal: 35000,
        tax: 0,
        discount: 0,
        total: 35000,
        issueDate: new Date(2024, 5, 10), 
        dueDate: new Date(2024, 6, 10), 
        status: "Draft" 
    },
    { 
        id: "inv-005", 
        clientId: "client-2", 
        clientName: "Innovate LLC", 
        projectId: "proj-002", 
        projectName: "Durban Port Clearance", 
        lineItems: [{id: 'li-inv-5', description: 'Retainer - June', quantity: 1, unitPrice: 10000, total: 10000}],
        subtotal: 10000,
        tax: 0,
        discount: 0,
        total: 10000,
        issueDate: new Date(2024, 5, 15), 
        dueDate: new Date(2024, 6, 15), 
        status: "Partial", 
        isRecurring: true, 
        recurringInterval: 'days', 
        recurringPeriod: 30 
    },
];


export const expenses: Expense[] = [
    { id: 'exp-001', description: 'Fuel for Truck #12', amount: 250, category: 'Materials', date: new Date(2024, 5, 15), projectId: 'proj-001', projectName: 'Johannesburg to Cape Town' },
    { id: 'exp-002', description: 'Port Handling Fees', amount: 1500, category: 'Subcontractor', date: new Date(2024, 5, 18), projectId: 'proj-002', projectName: 'Durban Port Clearance' },
    { id: 'exp-003', description: 'Warehouse Supplies', amount: 500, category: 'Materials', date: new Date(2024, 5, 20), projectId: 'proj-004', projectName: 'Local Warehouse Distribution' },
    { id: 'exp-004', description: 'Border Crossing Toll', amount: 150, category: 'Permits', date: new Date(2024, 5, 22), projectId: 'proj-003', projectName: 'Cross-Border to Zimbabwe' },
    { id: 'exp-005', description: 'Driver Overtime', amount: 800, category: 'Labor', date: new Date(2024, 5, 25), projectId: 'proj-004', projectName: 'Local Warehouse Distribution' },
];

export const documents: Document[] = [
    { id: 'doc-001', name: 'Bill of Lading #556.pdf', type: 'PDF', uploadDate: new Date(2024, 0, 20), projectId: 'proj-001', projectName: 'Johannesburg to Cape Town', url: '#' },
    { id: 'doc-002', name: 'Customs Declaration.jpg', type: 'Image', uploadDate: new Date(2024, 2, 5), projectId: 'proj-002', projectName: 'Durban Port Clearance', url: '#' },
    { id: 'doc-003', name: 'Proof of Delivery.docx', type: 'Word', uploadDate: new Date(2024, 5, 10), projectId: 'proj-003', projectName: 'Cross-Border to Zimbabwe', url: '#' },
    { id: 'doc-004', name: 'Inventory Sheet.xlsx', type: 'Excel', uploadDate: new Date(2024, 4, 15), projectId: 'proj-004', projectName: 'Local Warehouse Distribution', url: '#' },
];

export const financialData: FinancialData[] = [
  { month: "Jan", revenue: 15000, expenses: 9500 },
  { month: "Feb", revenue: 17500, expenses: 11000 },
  { month: "Mar", revenue: 21000, expenses: 12000 },
  { month: "Apr", revenue: 19000, expenses: 13000 },
  { month: "May", revenue: 22000, expenses: 14500 },
  { month: "Jun", revenue: 25000, expenses: 16000 },
];

export const recentActivity: Activity[] = [
  { id: "act-1", type: "INVOICE_PAID", description: "Invoice INV-003 was paid", timestamp: "2h ago", user: "Finance Bot", projectId: "proj-001" },
  { id: "act-2", type: "TASK_ADDED", description: "Added task 'Confirm Delivery' to 'JHB to CPT'", timestamp: "8h ago", user: "Alice Johnson", projectId: "proj-001" },
  { id: "act-3", type: "FILE_UPLOADED", description: "Uploaded 'Proof of Delivery' to 'Cross-Border to Zimbabwe'", timestamp: "1d ago", user: "Carol Danvers", projectId: "proj-003" },
  { id: "act-4", type: "PROJECT_STATUS", description: "'Durban Port Clearance' status changed to At Risk", timestamp: "2d ago", user: "System", projectId: "proj-002" },
  { id: "act-5", type: "CLIENT_COMMENT", description: "Global Corp commented on 'JHB to CPT'", timestamp: "3d ago", user: "System", projectId: "proj-001"},
];

export const resourceAllocation: Resource[] = [
    { name: "Long-Haul Fleet", utilization: 85, team: "A"},
    { name: "Local Delivery", utilization: 110, team: "B"},
    { name: "Warehouse Staff", utilization: 60, team: "C"},
    { name: "Admin Team", utilization: 75, team: "D"},
];

export const weatherForecast: WeatherForecastData[] = [
    { day: "Today", icon: "Sun", temp: 72 },
    { day: "Tue", icon: "Cloudy", temp: 68 },
    { day: "Wed", icon: "CloudRain", temp: 65 },
    { day: "Thu", icon: "Cloud", temp: 70 },
    { day: "Fri", icon: "Sun", temp: 75 },
];

export const bankAccounts: BankAccount[] = [
    { id: 'bank-1', bankName: 'Standard Bank', accountNumber: '**** **** **** 1234', balance: 125430.50, logoUrl: 'https://placehold.co/100x100.png' },
    { id: 'bank-2', bankName: 'FNB', accountNumber: '**** **** **** 5678', balance: 75890.22, logoUrl: 'https://placehold.co/100x100.png' },
    { id: 'bank-3', bankName: 'Capitec', accountNumber: '**** **** **** 9012', balance: 42311.90, logoUrl: 'https://placehold.co/100x100.png' },
];
