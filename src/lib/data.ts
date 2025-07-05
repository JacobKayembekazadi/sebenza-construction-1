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
  description: string;
  manager: string;
  status: "On Track" | "At Risk" | "Off Track";
  completion: number;
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  team: Employee[];
  documents: Document[];
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
  lateFeeType?: 'Percentage' | 'Flat Rate';
  lateFeeValue?: number;
  automatedReminders?: boolean;
};

export type Employee = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "Project Manager" | "Site Supervisor" | "Electrician" | "Plumber" | "Laborer";
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
    isBillable: boolean;
    isRecurring: boolean;
    receiptUrl?: string; // a dummy url
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
  projectId: string;
  projectName: string;
  lineItems: PurchaseOrderLineItem[];
  total: number;
  issueDate: Date;
  deliveryDate: Date;
  status: "Draft" | "Sent" | "Fulfilled" | "Cancelled";
  notes?: string;
};

export type TimeEntry = {
    id: string;
    projectId: string;
    projectName: string;
    employeeId: string;
    employeeName: string;
    employeeAvatar: string;
    date: Date;
    hours: number;
    description: string;
    isBilled: boolean;
};

export type CustomEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: 'custom';
}

export type UnifiedEvent = {
    id: string;
    title: string;
    date: Date; // The primary date for sorting/display (due date, end date, etc.)
    type: 'project' | 'task' | 'invoice' | 'custom';
    link?: string; // Link to the detail page
    isCustom: boolean;
    raw?: Project | Task | Invoice | CustomEvent; // The original object
};

export type SupportTicket = {
  id: string;
  subject: string;
  department: 'Finance' | 'Sales' | 'Technical Support' | 'General Inquiry';
  priority: 'Low' | 'Normal' | 'High';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  description: string;
  createdAt: Date;
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

export type ChartOfAccount = {
    id: string;
    accountCode: string;
    accountName: string;
    accountType: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
    subType: string;
    description: string;
    isActive: boolean;
    parentAccountId?: string;
    balance: number;
    debitBalance: number;
    creditBalance: number;
    createdDate: Date;
    lastModified: Date;
    createdBy: string;
    taxType?: 'Taxable' | 'Non-Taxable' | 'Tax-Only';
    bankAccountId?: string;
    tags: string[];
};

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  description: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  defaultRate: number; // Per hour
};

export type NewsUpdate = {
  id: string;
  title: string;
  content: string;
  date: Date;
  category: 'New Feature' | 'Announcement' | 'Tip';
  link?: string;
  linkText?: string;
};

export const employees: Employee[] = [
    { id: "emp-001", name: "Jane Doe", email: "jane.doe@example.com", phone: "555-0101", role: "Project Manager", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-002", name: "Bob Builder", email: "bob.builder@example.com", phone: "555-0102", role: "Site Supervisor", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-003", name: "Charlie Crane", email: "charlie.crane@example.com", phone: "555-0103", role: "Laborer", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-004", name: "David Drill", email: "david.drill@example.com", phone: "555-0104", role: "Laborer", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-005", name: "Eve Electric", email: "eve.electric@example.com", phone: "555-0105", role: "Electrician", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-006", name: "Frank Formwork", email: "frank.formwork@example.com", phone: "555-0106", role: "Laborer", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-007", name: "Grace Grader", email: "grace.grader@example.com", phone: "555-0107", role: "Site Supervisor", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-008", name: "Alice Johnson", email: "alice.johnson@example.com", phone: "555-0108", role: "Project Manager", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-009", name: "Bob Vance", email: "bob.vance@example.com", phone: "555-0109", role: "Project Manager", avatar: "https://placehold.co/32x32.png" },
    { id: "emp-010", name: "Carol Danvers", email: "carol.danvers@example.com", phone: "555-0110", role: "Project Manager", avatar: "https://placehold.co/32x32.png" },
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

export const allTasks = tasks;

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

export const documents: Document[] = [
    { id: 'doc-001', name: 'Bill of Lading #556.pdf', type: 'PDF', uploadDate: new Date(2024, 0, 20), projectId: 'proj-001', projectName: 'Johannesburg to Cape Town', url: '#' },
    { id: 'doc-002', name: 'Customs Declaration.jpg', type: 'Image', uploadDate: new Date(2024, 2, 5), projectId: 'proj-002', projectName: 'Durban Port Clearance', url: '#' },
    { id: 'doc-003', name: 'Proof of Delivery.docx', type: 'Word', uploadDate: new Date(2024, 5, 10), projectId: 'proj-001', projectName: 'Johannesburg to Cape Town', url: '#' },
    { id: 'doc-004', name: 'Inventory Sheet.xlsx', type: 'Excel', uploadDate: new Date(2024, 4, 15), projectId: 'proj-004', projectName: 'Local Warehouse Distribution', url: '#' },
];


export const projects: Project[] = [
  {
    id: "proj-001",
    name: "Johannesburg to Cape Town",
    description: "Full-scale logistics operation for a major client, involving cross-country freight movement and coordination.",
    manager: "Alice Johnson",
    status: "On Track",
    completion: 65,
    budget: 50000,
    spent: 32500,
    startDate: new Date(2023, 0, 15),
    endDate: new Date(2024, 11, 31),
    tasks: tasks.filter(t => t.projectId === "proj-001"),
    team: employees.filter(e => ["emp-008", "emp-002", "emp-003"].includes(e.id)),
    documents: documents.filter(d => d.projectId === "proj-001"),
    clientId: "client-1",
    clientName: "Global Corp"
  },
  {
    id: "proj-002",
    name: "Durban Port Clearance",
    description: "Expedited customs clearance and port handling for time-sensitive cargo at Durban Harbor.",
    manager: "Bob Vance",
    status: "At Risk",
    completion: 40,
    budget: 12000,
    spent: 6000,
    startDate: new Date(2023, 2, 1),
    endDate: new Date(2024, 7, 30),
    tasks: tasks.filter(t => t.projectId === "proj-002"),
    team: employees.filter(e => ["emp-009", "emp-007"].includes(e.id)),
    documents: documents.filter(d => d.projectId === "proj-002"),
    clientId: "client-2",
    clientName: "Innovate LLC"
  },
  {
    id: "proj-003",
    name: "Cross-Border to Zimbabwe",
    description: "Complex cross-border freight project requiring extensive documentation and liaison with multiple authorities.",
    manager: "Carol Danvers",
    status: "Off Track",
    completion: 20,
    budget: 150000,
    spent: 45000,
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2025, 4, 31),
    tasks: [],
    team: employees.filter(e => ["emp-010"].includes(e.id)),
    documents: [],
    clientId: "client-4",
    clientName: "Quantum Solutions"
  },
    {
    id: "proj-004",
    name: "Local Warehouse Distribution",
    description: "Management and optimization of last-mile delivery services from our central warehouse to local businesses.",
    manager: "Alice Johnson",
    status: "On Track",
    completion: 85,
    budget: 85000,
    spent: 72250,
    startDate: new Date(2022, 8, 1),
    endDate: new Date(2024, 5, 30),
    tasks: tasks.filter(t => t.projectId === "proj-004"),
    team: employees.filter(e => ["emp-008", "emp-006"].includes(e.id)),
    documents: documents.filter(d => d.projectId === "proj-004"),
    clientId: "client-1",
    clientName: "Global Corp"
  },
];

export const purchaseOrders: PurchaseOrder[] = [
    {
        id: "po-001",
        supplierId: "sup-1",
        supplierName: "Steel & Co.",
        projectId: "proj-001",
        projectName: "Johannesburg to Cape Town",
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
        projectId: "proj-002",
        projectName: "Durban Port Clearance",
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
        projectId: "proj-004",
        projectName: "Local Warehouse Distribution",
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
        terms: "Payment due upon receipt.",
        automatedReminders: true,
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
        status: "Sent",
        lateFeeType: 'Percentage',
        lateFeeValue: 1.5,
        automatedReminders: true,
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
        status: "Overdue",
        lateFeeType: 'Flat Rate',
        lateFeeValue: 250,
        automatedReminders: true,
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
        status: "Draft",
        automatedReminders: false,
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
        recurringPeriod: 30,
        automatedReminders: true,
    },
];


export const expenses: Expense[] = [
    { id: 'exp-001', description: 'Fuel for Truck #12', amount: 250, category: 'Materials', date: new Date(2024, 5, 15), projectId: 'proj-001', projectName: 'Johannesburg to Cape Town', isBillable: true, isRecurring: false, receiptUrl: '#' },
    { id: 'exp-002', description: 'Port Handling Fees', amount: 1500, category: 'Subcontractor', date: new Date(2024, 5, 18), projectId: 'proj-002', projectName: 'Durban Port Clearance', isBillable: true, isRecurring: false },
    { id: 'exp-003', description: 'Warehouse Supplies', amount: 500, category: 'Materials', date: new Date(2024, 5, 20), projectId: 'proj-004', projectName: 'Local Warehouse Distribution', isBillable: false, isRecurring: false, receiptUrl: '#' },
    { id: 'exp-004', description: 'Border Crossing Toll', amount: 150, category: 'Permits', date: new Date(2024, 5, 22), projectId: 'proj-003', projectName: 'Cross-Border to Zimbabwe', isBillable: true, isRecurring: false },
    { id: 'exp-005', description: 'Driver Overtime', amount: 800, category: 'Labor', date: new Date(2024, 5, 25), projectId: 'proj-004', projectName: 'Local Warehouse Distribution', isBillable: true, isRecurring: false },
    { id: 'exp-006', description: 'Monthly Software Subscription', amount: 150, category: 'Other', date: new Date(2024, 5, 1), projectId: 'proj-001', projectName: 'Johannesburg to Cape Town', isBillable: false, isRecurring: true },
];

export const timeEntries: TimeEntry[] = [
    {
        id: 'time-1',
        projectId: 'proj-001',
        projectName: 'Johannesburg to Cape Town',
        employeeId: 'emp-002',
        employeeName: 'Bob Builder',
        employeeAvatar: 'https://placehold.co/32x32.png',
        date: new Date(2024, 5, 10),
        hours: 8,
        description: 'On-site consultation and planning for Phase 2.',
        isBilled: true,
    },
    {
        id: 'time-2',
        projectId: 'proj-001',
        projectName: 'Johannesburg to Cape Town',
        employeeId: 'emp-003',
        employeeName: 'Charlie Crane',
        employeeAvatar: 'https://placehold.co/32x32.png',
        date: new Date(2024, 5, 11),
        hours: 6.5,
        description: 'Initial work on exterior cladding.',
        isBilled: false,
    },
    {
        id: 'time-3',
        projectId: 'proj-002',
        projectName: 'Durban Port Clearance',
        employeeId: 'emp-007',
        employeeName: 'Grace Grader',
        employeeAvatar: 'https://placehold.co/32x32.png',
        date: new Date(2024, 5, 12),
        hours: 4,
        description: 'Liaising with port authorities.',
        isBilled: false,
    },
     {
        id: 'time-4',
        projectId: 'proj-002',
        projectName: 'Durban Port Clearance',
        employeeId: 'emp-007',
        employeeName: 'Grace Grader',
        employeeAvatar: 'https://placehold.co/32x32.png',
        date: new Date(2024, 5, 13),
        hours: 5,
        description: 'Document preparation for customs.',
        isBilled: true,
    },
    {
        id: 'time-5',
        projectId: 'proj-004',
        projectName: 'Local Warehouse Distribution',
        employeeId: 'emp-002',
        employeeName: 'Bob Builder',
        employeeAvatar: 'https://placehold.co/32x32.png',
        date: new Date(2024, 5, 9),
        hours: 7,
        description: 'Route planning and optimization.',
        isBilled: false,
    }
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

export const customEvents: CustomEvent[] = [
  { id: 'custom-1', title: 'Project Kick-off: JHB to CPT', description: 'Initial meeting with the client and team.', startDate: new Date(2024, 6, 25), endDate: new Date(2024, 6, 25), type: 'custom' },
  { id: 'custom-2', title: 'Quarterly Review', description: 'Review Q2 performance and plan for Q3.', startDate: new Date(2024, 6, 30), endDate: new Date(2024, 6, 30), type: 'custom' },
];

const projectEvents: UnifiedEvent[] = projects.map(p => ({
    id: `project-${p.id}`,
    title: p.name,
    date: p.endDate,
    type: 'project',
    link: `/dashboard/projects/${p.id}`,
    isCustom: false,
    raw: p,
}));

const taskEvents: UnifiedEvent[] = tasks.map(t => ({
    id: `task-${t.id}`,
    title: t.name,
    date: t.dueDate,
    type: 'task',
    link: `/dashboard/tasks`,
    isCustom: false,
    raw: t,
}));

const invoiceEvents: UnifiedEvent[] = invoices.map(i => ({
    id: `invoice-${i.id}`,
    title: `Invoice ${i.id.toUpperCase()}`,
    date: i.dueDate,
    type: 'invoice',
    link: `/dashboard/invoices`,
    isCustom: false,
    raw: i,
}));

const customUnifiedEvents: UnifiedEvent[] = customEvents.map(e => ({
    id: e.id,
    title: e.title,
    date: e.startDate,
    type: 'custom',
    isCustom: true,
    raw: e
}));

export const inventoryItems: InventoryItem[] = [
  { id: 'item-1', sku: 'STL-IB-20', name: 'I-Beams (20ft)', description: 'Standard 20-foot steel I-beams for structural support.', supplierId: 'sup-1', supplierName: 'Steel & Co.', quantity: 150, costPrice: 280, sellingPrice: 350, lowStockThreshold: 50 },
  { id: 'item-2', sku: 'CON-5K-CY', name: '5000 PSI Concrete', description: 'High-strength concrete mix, sold per cubic yard.', supplierId: 'sup-2', supplierName: 'Concrete King', quantity: 80, costPrice: 120, sellingPrice: 150, lowStockThreshold: 20 },
  { id: 'item-3', sku: 'LMB-24-8', name: '2x4 Lumber (8ft)', description: 'Standard 8-foot dimensional lumber.', supplierId: 'sup-3', supplierName: 'Lumber Liquidators', quantity: 45, costPrice: 6.50, sellingPrice: 8, lowStockThreshold: 100 },
  { id: 'item-4', sku: 'ELEC-12G-W', name: '12-Gauge Electrical Wire', description: '100ft spool of 12-gauge copper wiring.', supplierId: 'sup-1', supplierName: 'Steel & Co.', quantity: 25, costPrice: 80, sellingPrice: 100, lowStockThreshold: 30 },
  { id: 'item-5', sku: 'PLMB-PVC-1', name: '1-inch PVC Pipe (10ft)', description: 'Standard 1-inch diameter, 10-foot length PVC pipe.', supplierId: 'sup-2', supplierName: 'Concrete King', quantity: 200, costPrice: 12, sellingPrice: 15, lowStockThreshold: 50 },
];

export const services: Service[] = [
    { id: 'srv-1', name: 'Logistics Consulting', description: 'Expert advice on optimizing your supply chain and logistics operations.', defaultRate: 150 },
    { id: 'srv-2', name: 'Customs Brokerage', description: 'Handling of all customs documentation and clearance procedures.', defaultRate: 120 },
    { id: 'srv-3', name: 'Freight Forwarding', description: 'Arranging and managing the shipment of goods from origin to destination.', defaultRate: 95 },
    { id: 'srv-4', name: 'Warehouse Storage', description: 'Secure storage of goods in our warehouse facilities, billed per pallet per day.', defaultRate: 25 },
    { id: 'srv-5', name: 'Last-Mile Delivery', description: 'Final step of the delivery process from a distribution center to the end user.', defaultRate: 75 },
];

export type FinancialReport = {
  id: string;
  title: string;
  description: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'general-ledger' | 'trial-balance' | 'custom';
  status: 'draft' | 'active' | 'archived';
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  createdDate: Date;
  lastGenerated?: Date;
  parameters: {
    includeSubaccounts: boolean;
    showComparisons: boolean;
    groupByCategory: boolean;
    includeCharts: boolean;
    format: 'pdf' | 'excel' | 'csv';
  };
  filters: {
    accountTypes?: string[];
    projects?: string[];
    clients?: string[];
    minimumAmount?: number;
  };
  createdBy: string;
  tags: string[];
};

export const supportTickets: SupportTicket[] = [
  {
    id: 'tic-001',
    subject: 'Issue with invoice INV-003 late fee',
    department: 'Finance',
    priority: 'High',
    status: 'Open',
    description: 'The late fee on invoice INV-003 seems to be calculated incorrectly. Can you please check?',
    createdAt: new Date(2024, 5, 28),
  },
  {
    id: 'tic-002',
    subject: 'Question about upgrading my plan',
    department: 'Sales',
    priority: 'Normal',
    status: 'In Progress',
    description: 'I\'m interested in adding more users to my account and would like to know more about the enterprise plan.',
    createdAt: new Date(2024, 5, 27),
  },
  {
    id: 'tic-003',
    subject: 'Gantt chart not displaying correctly on mobile',
    department: 'Technical Support',
    priority: 'Normal',
    status: 'Resolved',
    description: 'The Gantt chart on the project details page seems to be broken on my iPhone. The bars are not aligned with the tasks.',
    createdAt: new Date(2024, 5, 26),
  },
];


export const allEvents: UnifiedEvent[] = [
    ...projectEvents,
    ...taskEvents,
    ...invoiceEvents,
    ...customUnifiedEvents,
];

export const newsUpdates: NewsUpdate[] = [
    {
        id: 'news-1',
        title: 'New Feature: AI-Powered Reporting!',
        content: 'Generate insightful project and financial reports instantly with our new AI analysis tools. Find it in the Accounting section.',
        date: new Date(2024, 5, 28),
        category: 'New Feature',
        link: '/dashboard/ai-report',
        linkText: 'Try it now'
    },
    {
        id: 'news-2',
        title: 'Tip: Quick Add Menu',
        content: 'Did you know you can press the "+" button on any page to quickly add a new task, expense, or log entry?',
        date: new Date(2024, 5, 20),
        category: 'Tip',
    },
    {
        id: 'news-3',
        title: 'Scheduled Maintenance',
        content: 'We will be performing scheduled maintenance on Sunday at 2 AM. The platform may be unavailable for up to 15 minutes.',
        date: new Date(2024, 5, 15),
        category: 'Announcement',
    }
];

export const financialReports: FinancialReport[] = [
    {
        id: 'rpt-001',
        title: 'Monthly Profit & Loss Report',
        description: 'Comprehensive P&L analysis for the current month',
        type: 'profit-loss',
        status: 'active',
        isScheduled: true,
        scheduleFrequency: 'monthly',
        dateRange: {
            startDate: new Date(2024, 5, 1),
            endDate: new Date(2024, 5, 30)
        },
        createdDate: new Date(2024, 4, 15),
        lastGenerated: new Date(2024, 5, 25),
        parameters: {
            includeSubaccounts: true,
            showComparisons: true,
            groupByCategory: true,
            includeCharts: true,
            format: 'pdf'
        },
        filters: {
            accountTypes: ['Income', 'Expense'],
            projects: [],
            clients: [],
            minimumAmount: 100
        },
        createdBy: 'Sarah Chen',
        tags: ['monthly', 'automated', 'critical']
    },
    {
        id: 'rpt-002',
        title: 'Balance Sheet - Q2 2024',
        description: 'Quarterly balance sheet showing assets, liabilities, and equity',
        type: 'balance-sheet',
        status: 'active',
        isScheduled: true,
        scheduleFrequency: 'quarterly',
        dateRange: {
            startDate: new Date(2024, 3, 1),
            endDate: new Date(2024, 5, 30)
        },
        createdDate: new Date(2024, 3, 1),
        lastGenerated: new Date(2024, 5, 30),
        parameters: {
            includeSubaccounts: true,
            showComparisons: false,
            groupByCategory: true,
            includeCharts: false,
            format: 'excel'
        },
        filters: {
            accountTypes: ['Asset', 'Liability', 'Equity']
        },
        createdBy: 'Michael Rodriguez',
        tags: ['quarterly', 'compliance']
    },
    {
        id: 'rpt-003',
        title: 'Cash Flow Analysis',
        description: 'Monthly cash flow statement tracking operating, investing, and financing activities',
        type: 'cash-flow',
        status: 'draft',
        isScheduled: false,
        dateRange: {
            startDate: new Date(2024, 5, 1),
            endDate: new Date(2024, 5, 30)
        },
        createdDate: new Date(2024, 5, 20),
        parameters: {
            includeSubaccounts: false,
            showComparisons: true,
            groupByCategory: true,
            includeCharts: true,
            format: 'pdf'
        },
        filters: {
            minimumAmount: 500
        },
        createdBy: 'Sarah Chen',
        tags: ['cash-flow', 'liquidity']
    },
    {
        id: 'rpt-004',
        title: 'Project Revenue Report',
        description: 'Custom report analyzing revenue by project and client',
        type: 'custom',
        status: 'active',
        isScheduled: true,
        scheduleFrequency: 'weekly',
        dateRange: {
            startDate: new Date(2024, 5, 1),
            endDate: new Date(2024, 5, 30)
        },
        createdDate: new Date(2024, 4, 10),
        lastGenerated: new Date(2024, 5, 28),
        parameters: {
            includeSubaccounts: true,
            showComparisons: true,
            groupByCategory: false,
            includeCharts: true,
            format: 'excel'
        },
        filters: {
            accountTypes: ['Income'],
            projects: ['proj-001', 'proj-002'],
            clients: ['client-001']
        },
        createdBy: 'Michael Rodriguez',
        tags: ['project-based', 'weekly', 'revenue']
    },
    {
        id: 'rpt-005',
        title: 'General Ledger Summary',
        description: 'Complete ledger entries for all accounts',
        type: 'general-ledger',
        status: 'archived',
        isScheduled: false,
        dateRange: {
            startDate: new Date(2024, 2, 1),
            endDate: new Date(2024, 2, 31)
        },
        createdDate: new Date(2024, 2, 25),
        lastGenerated: new Date(2024, 3, 1),
        parameters: {
            includeSubaccounts: true,
            showComparisons: false,
            groupByCategory: false,
            includeCharts: false,
            format: 'csv'
        },
        filters: {},
        createdBy: 'Sarah Chen',
        tags: ['archived', 'detailed']
    }
];

export const chartOfAccounts: ChartOfAccount[] = [
    {
        id: 'coa-001',
        accountCode: '1000',
        accountName: 'Cash - Operating Account',
        accountType: 'Asset',
        subType: 'Current Assets',
        description: 'Primary operating cash account for daily transactions',
        isActive: true,
        balance: 45000.00,
        debitBalance: 45000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 15),
        createdBy: 'Sarah Chen',
        taxType: 'Non-Taxable',
        bankAccountId: 'bank-1',
        tags: ['primary', 'operating']
    },
    {
        id: 'coa-002',
        accountCode: '1010',
        accountName: 'Petty Cash',
        accountType: 'Asset',
        subType: 'Current Assets',
        description: 'Small cash fund for minor expenses',
        isActive: true,
        balance: 500.00,
        debitBalance: 500.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 10),
        createdBy: 'Sarah Chen',
        taxType: 'Non-Taxable',
        tags: ['cash', 'petty']
    },
    {
        id: 'coa-003',
        accountCode: '1100',
        accountName: 'Accounts Receivable',
        accountType: 'Asset',
        subType: 'Current Assets',
        description: 'Money owed by customers for completed work',
        isActive: true,
        balance: 125000.00,
        debitBalance: 125000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 20),
        createdBy: 'Michael Rodriguez',
        taxType: 'Taxable',
        tags: ['receivables', 'customers']
    },
    {
        id: 'coa-004',
        accountCode: '1200',
        accountName: 'Inventory - Raw Materials',
        accountType: 'Asset',
        subType: 'Current Assets',
        description: 'Construction materials and supplies inventory',
        isActive: true,
        balance: 75000.00,
        debitBalance: 75000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 18),
        createdBy: 'Sarah Chen',
        taxType: 'Non-Taxable',
        tags: ['inventory', 'materials']
    },
    {
        id: 'coa-005',
        accountCode: '1500',
        accountName: 'Equipment',
        accountType: 'Asset',
        subType: 'Fixed Assets',
        description: 'Construction equipment and machinery',
        isActive: true,
        balance: 250000.00,
        debitBalance: 250000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 5),
        createdBy: 'Michael Rodriguez',
        taxType: 'Non-Taxable',
        tags: ['equipment', 'fixed-assets']
    },
    {
        id: 'coa-006',
        accountCode: '1510',
        accountName: 'Accumulated Depreciation - Equipment',
        accountType: 'Asset',
        subType: 'Fixed Assets',
        description: 'Accumulated depreciation on construction equipment',
        isActive: true,
        balance: -45000.00,
        debitBalance: 0.00,
        creditBalance: 45000.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 31),
        createdBy: 'Sarah Chen',
        taxType: 'Non-Taxable',
        tags: ['depreciation', 'equipment']
    },
    {
        id: 'coa-007',
        accountCode: '2000',
        accountName: 'Accounts Payable',
        accountType: 'Liability',
        subType: 'Current Liabilities',
        description: 'Money owed to suppliers and vendors',
        isActive: true,
        balance: -35000.00,
        debitBalance: 0.00,
        creditBalance: 35000.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 22),
        createdBy: 'Michael Rodriguez',
        taxType: 'Non-Taxable',
        tags: ['payables', 'vendors']
    },
    {
        id: 'coa-008',
        accountCode: '2100',
        accountName: 'Sales Tax Payable',
        accountType: 'Liability',
        subType: 'Current Liabilities',
        description: 'Sales tax collected and owed to tax authorities',
        isActive: true,
        balance: -8500.00,
        debitBalance: 0.00,
        creditBalance: 8500.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 25),
        createdBy: 'Sarah Chen',
        taxType: 'Tax-Only',
        tags: ['tax', 'payable']
    },
    {
        id: 'coa-009',
        accountCode: '2500',
        accountName: 'Equipment Loan',
        accountType: 'Liability',
        subType: 'Long-term Liabilities',
        description: 'Long-term loan for equipment purchases',
        isActive: true,
        balance: -125000.00,
        debitBalance: 0.00,
        creditBalance: 125000.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 1),
        createdBy: 'Michael Rodriguez',
        taxType: 'Non-Taxable',
        tags: ['loan', 'equipment']
    },
    {
        id: 'coa-010',
        accountCode: '3000',
        accountName: 'Owner Equity',
        accountType: 'Equity',
        subType: 'Owner Equity',
        description: 'Owner investment and retained earnings',
        isActive: true,
        balance: -185000.00,
        debitBalance: 0.00,
        creditBalance: 185000.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 30),
        createdBy: 'Sarah Chen',
        taxType: 'Non-Taxable',
        tags: ['equity', 'owner']
    },
    {
        id: 'coa-011',
        accountCode: '4000',
        accountName: 'Construction Revenue',
        accountType: 'Income',
        subType: 'Operating Revenue',
        description: 'Revenue from construction projects',
        isActive: true,
        balance: -450000.00,
        debitBalance: 0.00,
        creditBalance: 450000.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 25),
        createdBy: 'Michael Rodriguez',
        taxType: 'Taxable',
        tags: ['revenue', 'construction']
    },
    {
        id: 'coa-012',
        accountCode: '4100',
        accountName: 'Equipment Rental Income',
        accountType: 'Income',
        subType: 'Other Revenue',
        description: 'Income from renting equipment to other contractors',
        isActive: true,
        balance: -25000.00,
        debitBalance: 0.00,
        creditBalance: 25000.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 15),
        createdBy: 'Sarah Chen',
        taxType: 'Taxable',
        tags: ['rental', 'equipment']
    },
    {
        id: 'coa-013',
        accountCode: '5000',
        accountName: 'Material Costs',
        accountType: 'Expense',
        subType: 'Cost of Goods Sold',
        description: 'Direct costs for construction materials',
        isActive: true,
        balance: 180000.00,
        debitBalance: 180000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 20),
        createdBy: 'Michael Rodriguez',
        taxType: 'Taxable',
        tags: ['materials', 'cogs']
    },
    {
        id: 'coa-014',
        accountCode: '5100',
        accountName: 'Subcontractor Costs',
        accountType: 'Expense',
        subType: 'Cost of Goods Sold',
        description: 'Payments to subcontractors',
        isActive: true,
        balance: 95000.00,
        debitBalance: 95000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 18),
        createdBy: 'Sarah Chen',
        taxType: 'Non-Taxable',
        tags: ['subcontractors', 'cogs']
    },
    {
        id: 'coa-015',
        accountCode: '6000',
        accountName: 'Office Rent',
        accountType: 'Expense',
        subType: 'Operating Expenses',
        description: 'Monthly office space rental',
        isActive: true,
        balance: 18000.00,
        debitBalance: 18000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 1),
        createdBy: 'Sarah Chen',
        taxType: 'Non-Taxable',
        tags: ['rent', 'office']
    },
    {
        id: 'coa-016',
        accountCode: '6100',
        accountName: 'Insurance Expense',
        accountType: 'Expense',
        subType: 'Operating Expenses',
        description: 'General liability and equipment insurance',
        isActive: true,
        balance: 12000.00,
        debitBalance: 12000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 10),
        createdBy: 'Michael Rodriguez',
        taxType: 'Non-Taxable',
        tags: ['insurance', 'liability']
    },
    {
        id: 'coa-017',
        accountCode: '6200',
        accountName: 'Vehicle Expenses',
        accountType: 'Expense',
        subType: 'Operating Expenses',
        description: 'Fuel, maintenance, and vehicle-related costs',
        isActive: true,
        balance: 8500.00,
        debitBalance: 8500.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 12),
        createdBy: 'Sarah Chen',
        taxType: 'Taxable',
        tags: ['vehicles', 'fuel']
    },
    {
        id: 'coa-018',
        accountCode: '6300',
        accountName: 'Professional Services',
        accountType: 'Expense',
        subType: 'Operating Expenses',
        description: 'Legal, accounting, and consulting fees',
        isActive: true,
        balance: 15000.00,
        debitBalance: 15000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 8),
        createdBy: 'Michael Rodriguez',
        taxType: 'Non-Taxable',
        tags: ['professional', 'services']
    },
    {
        id: 'coa-019',
        accountCode: '6400',
        accountName: 'Equipment Maintenance',
        accountType: 'Expense',
        subType: 'Operating Expenses',
        description: 'Maintenance and repairs for construction equipment',
        isActive: true,
        balance: 22000.00,
        debitBalance: 22000.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 14),
        createdBy: 'Sarah Chen',
        taxType: 'Taxable',
        tags: ['maintenance', 'equipment']
    },
    {
        id: 'coa-020',
        accountCode: '6500',
        accountName: 'Depreciation Expense',
        accountType: 'Expense',
        subType: 'Operating Expenses',
        description: 'Monthly depreciation on equipment and assets',
        isActive: true,
        balance: 7500.00,
        debitBalance: 7500.00,
        creditBalance: 0.00,
        createdDate: new Date(2024, 0, 1),
        lastModified: new Date(2024, 5, 31),
        createdBy: 'Michael Rodriguez',
        taxType: 'Non-Taxable',
        tags: ['depreciation', 'non-cash']
    }
];
