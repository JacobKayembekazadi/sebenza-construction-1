# Financial Reports CRUD Feature Documentation

## Overview

The Financial Reports CRUD feature provides comprehensive management of financial reports within the Sebenza Construction Management Platform. This feature enables users to create, read, update, and delete financial reports with advanced filtering, scheduling, and bulk operations.

## Features

### Core CRUD Operations
- **Create**: Add new financial reports with customizable parameters
- **Read**: View and search through existing reports with advanced filtering
- **Update**: Edit report configurations, parameters, and scheduling
- **Delete**: Remove individual or multiple reports with confirmation

### Advanced Features
- **Bulk Operations**: Perform actions on multiple reports simultaneously
- **Report Generation**: Generate reports on-demand or via scheduling
- **Export Functionality**: Export report lists to CSV format
- **Advanced Filtering**: Filter by type, status, creation date, and more
- **Search**: Real-time search across report titles, descriptions, and tags
- **Report Viewing**: Detailed view of report configurations and parameters

## Architecture

### File Structure
```
src/
├── app/dashboard/ai-report/page.tsx          # Main accounting page with reports tab
├── components/
│   ├── add-edit-report-dialog.tsx            # Create/edit report dialog
│   ├── delete-report-dialog.tsx              # Delete confirmation dialog
│   ├── bulk-report-operation-dialog.tsx      # Bulk operations dialog
│   └── report-view-dialog.tsx                # Report details viewer
└── lib/data.ts                               # Data types and sample data
```

### Data Types

#### FinancialReport Type
```typescript
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
```

## User Interface Components

### 1. Reports Tab Overview
The Reports tab contains:
- **Summary Cards**: Display total, active, scheduled, and draft reports
- **Reports Management Table**: Main CRUD interface
- **Quick Report Generation**: Pre-configured report templates

### 2. Summary Cards
Four key metrics are displayed:
- **Total Reports**: All reports in the system
- **Active Reports**: Currently active reports
- **Scheduled Reports**: Reports with automated generation
- **Draft Reports**: Reports in development

### 3. Reports Table
Features include:
- **Columns**: Title, Type, Status, Schedule, Last Generated, Created By, Actions
- **Status Badges**: Visual indicators for draft, active, and archived states
- **Schedule Indicators**: Icons showing automated vs. manual generation
- **Action Menu**: Edit, view, generate, archive, and delete options

### 4. Filtering and Search
- **Search Bar**: Real-time search across titles, descriptions, and tags
- **Type Filter**: Filter by report type (P&L, Balance Sheet, etc.)
- **Status Filter**: Filter by draft, active, or archived status
- **Clear Filters**: Reset all filters with one click
- **Export**: Download filtered results as CSV

## Dialog Components

### Add/Edit Report Dialog (`add-edit-report-dialog.tsx`)

#### Features
- **Form Validation**: Comprehensive validation for all fields
- **Date Range Picker**: Calendar-based date selection
- **Parameter Configuration**: Toggles for report generation options
- **Filter Configuration**: Account types, projects, clients, and amounts
- **Scheduling Options**: Automated report generation settings
- **Tag Management**: Multiple tag support for organization

#### Form Sections
1. **Basic Information**: Title, description, type
2. **Date Range**: Start and end dates for report data
3. **Parameters**: Include subaccounts, comparisons, charts, format
4. **Filters**: Account types, projects, clients, minimum amounts
5. **Scheduling**: Enable/disable automated generation
6. **Tags**: Custom tags for categorization

### Delete Report Dialog (`delete-report-dialog.tsx`)

#### Features
- **Confirmation Modal**: Prevents accidental deletions
- **Report Information Display**: Shows title and type being deleted
- **Warning Messages**: Clear indication of irreversible action
- **Safe Deletion**: Proper cleanup and state management

### Bulk Operations Dialog (`bulk-report-operation-dialog.tsx`)

#### Supported Operations
- **Activate/Archive**: Change report status in bulk
- **Delete**: Remove multiple reports with confirmation
- **Generate**: Trigger generation for multiple reports
- **Schedule/Unschedule**: Modify scheduling for multiple reports

#### Features
- **Selection Interface**: Checkboxes for individual selection
- **Select All**: Toggle all reports at once
- **Operation Preview**: Shows what will be affected
- **Confirmation Dialogs**: Separate confirmations for destructive actions

### Report View Dialog (`report-view-dialog.tsx`)

#### Tabs
1. **Overview**: Basic information and current status
2. **Configuration**: Parameters and filter settings
3. **Schedule**: Automated generation configuration
4. **Data Preview**: Mock data showing report structure
5. **History**: Generation history and download links

#### Actions
- **Generate Now**: Immediate report generation
- **Download**: Export in different formats
- **Edit**: Open the edit dialog
- **Clone**: Create a copy of the report

## State Management

### Local State Structure
```typescript
// Reports state
const [reports, setReports] = useState<FinancialReport[]>(financialReports);

// Dialog states
const [addEditReportDialogOpen, setAddEditReportDialogOpen] = useState(false);
const [deleteReportDialogOpen, setDeleteReportDialogOpen] = useState(false);
const [bulkReportDialogOpen, setBulkReportDialogOpen] = useState(false);
const [viewReportDialogOpen, setViewReportDialogOpen] = useState(false);
const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);

// Filter states
const [reportSearchTerm, setReportSearchTerm] = useState("");
const [reportFilterType, setReportFilterType] = useState<string>("all");
const [reportFilterStatus, setReportFilterStatus] = useState<"all" | "draft" | "active" | "archived">("all");
```

### CRUD Operations

#### Create Report
```typescript
const handleSaveReport = (reportData: Omit<FinancialReport, 'id' | 'createdDate'> & { id?: string }) => {
  if (!reportData.id) {
    const newReport: FinancialReport = {
      ...reportData,
      id: `rpt-${Date.now()}`,
      createdDate: new Date(),
    } as FinancialReport;
    setReports(prev => [...prev, newReport]);
  }
};
```

#### Update Report
```typescript
const handleSaveReport = (reportData: Omit<FinancialReport, 'id' | 'createdDate'> & { id?: string }) => {
  if (reportData.id) {
    setReports(prev => 
      prev.map(r => r.id === reportData.id ? { 
        ...reportData, 
        createdDate: prev.find(p => p.id === reportData.id)?.createdDate || new Date() 
      } as FinancialReport : r)
    );
  }
};
```

#### Delete Report
```typescript
const handleDeleteReportConfirm = (reportId: string) => {
  setReports(prev => prev.filter(r => r.id !== reportId));
};
```

#### Bulk Operations
```typescript
const handleBulkReportUpdate = (reportIds: string[], updates: Partial<FinancialReport>) => {
  setReports(prev => 
    prev.map(r => 
      reportIds.includes(r.id) ? { ...r, ...updates } : r
    )
  );
};
```

### Filtering Logic

#### Search and Filter Implementation
```typescript
const filteredReports = useMemo(() => {
  return reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                         report.tags.some(tag => tag.toLowerCase().includes(reportSearchTerm.toLowerCase()));
    const matchesType = reportFilterType === "all" || report.type === reportFilterType;
    const matchesStatus = reportFilterStatus === "all" || report.status === reportFilterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });
}, [reports, reportSearchTerm, reportFilterType, reportFilterStatus]);
```

## Report Types

### Supported Report Types
1. **Profit & Loss**: Income statement analysis
2. **Balance Sheet**: Assets, liabilities, and equity
3. **Cash Flow**: Operating, investing, and financing activities
4. **General Ledger**: Complete transaction listings
5. **Trial Balance**: Account balance summaries
6. **Custom**: User-defined report configurations

### Report Status Types
- **Draft**: Under development, not yet active
- **Active**: Currently in use and available for generation
- **Archived**: Retired but kept for historical reference

## Scheduling Features

### Frequency Options
- **Daily**: Generate every day
- **Weekly**: Generate weekly on specified day
- **Monthly**: Generate on specified date each month
- **Quarterly**: Generate every quarter
- **Yearly**: Generate annually

### Scheduling Configuration
- **Enable/Disable**: Toggle automatic generation
- **Frequency Selection**: Choose generation interval
- **Parameter Consistency**: Maintain report parameters across generations
- **Last Generated Tracking**: Monitor generation history

## Export Functionality

### CSV Export Features
- **Filtered Results**: Export only visible/filtered reports
- **Complete Data**: All relevant report metadata included
- **Date Formatting**: Properly formatted dates for spreadsheet use
- **File Naming**: Timestamped filenames for organization

### Export Data Structure
```csv
Title,Type,Status,Created Date,Last Generated,Created By,Tags
"Monthly Profit & Loss Report","profit-loss","active","1/15/2024","1/25/2024","Sarah Chen","monthly, automated, critical"
```

## Integration Points

### Navigation Integration
- **Dashboard Navigation**: Accessible via accounting section
- **Tab-based Interface**: Part of comprehensive accounting module
- **Breadcrumb Support**: Clear navigation hierarchy

### Data Integration
- **Bank Account Data**: Filters can reference connected accounts
- **Project Data**: Reports can be filtered by specific projects
- **Client Data**: Client-specific report generation
- **Transaction Data**: Reports use actual financial data

## Error Handling

### Validation Rules
- **Required Fields**: Title, type, date range validation
- **Date Logic**: End date must be after start date
- **Unique Titles**: Prevent duplicate report names
- **Schedule Validation**: Proper frequency configuration

### User Feedback
- **Toast Notifications**: Success and error messages
- **Loading States**: Visual feedback during operations
- **Confirmation Dialogs**: Prevent accidental actions
- **Field Validation**: Real-time form validation

## Security Considerations

### Access Control
- **User Authentication**: Verify user identity
- **Role-based Access**: Different permissions for different users
- **Action Logging**: Track who performed what actions
- **Data Validation**: Sanitize all user inputs

### Data Protection
- **Input Sanitization**: Prevent injection attacks
- **State Management**: Secure local state handling
- **Export Security**: Safe file generation and download

## Performance Optimizations

### React Optimizations
- **useMemo**: Memoized filtering operations
- **Controlled Components**: Efficient state updates
- **Lazy Loading**: Large dataset handling
- **Debounced Search**: Reduce API calls and re-renders

### Data Management
- **Efficient Filtering**: Optimized filter algorithms
- **Bulk Operations**: Single state updates for multiple items
- **Memory Management**: Proper cleanup of event listeners

## Testing Considerations

### Unit Tests
- **CRUD Operations**: Test all create, read, update, delete functions
- **Filtering Logic**: Verify search and filter accuracy
- **Validation Rules**: Test form validation scenarios
- **State Management**: Verify state updates and consistency

### Integration Tests
- **Dialog Interactions**: Test dialog opening/closing and data flow
- **Bulk Operations**: Verify multi-item operations
- **Export Functionality**: Test CSV generation and download
- **Cross-component Communication**: Verify data passing between components

### User Experience Tests
- **Accessibility**: Screen reader compatibility
- **Responsive Design**: Mobile and tablet support
- **Performance**: Large dataset handling
- **Error Scenarios**: Graceful error handling

## Future Enhancements

### Planned Features
1. **Advanced Reporting Engine**: More sophisticated report generation
2. **Dashboard Widgets**: Key metrics on main dashboard
3. **Email Scheduling**: Automated report delivery
4. **API Integration**: External accounting system connectivity
5. **Advanced Analytics**: Trend analysis and forecasting
6. **Template Management**: Save and reuse report configurations
7. **Audit Trail**: Complete action history and logging
8. **Custom Fields**: User-defined report parameters

### Technical Improvements
1. **Real-time Updates**: WebSocket-based live updates
2. **Caching Strategy**: Improve performance with data caching
3. **Offline Support**: PWA capabilities for offline access
4. **Advanced Export**: PDF and Excel export options
5. **Data Visualization**: Charts and graphs in reports
6. **Search Enhancement**: Full-text search capabilities

## Summary

The Financial Reports CRUD feature provides a comprehensive solution for managing financial reports in the Sebenza Construction Management Platform. With full CRUD operations, advanced filtering, bulk operations, and scheduling capabilities, users can efficiently create, manage, and generate financial reports to meet their business needs.

The implementation follows React best practices with proper state management, component separation, and user experience considerations. The modular architecture ensures maintainability and extensibility for future enhancements.
