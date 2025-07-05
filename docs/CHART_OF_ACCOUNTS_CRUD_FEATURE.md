# Chart of Accounts CRUD Feature - Full Implementation

## Overview

The Chart of Accounts feature provides a comprehensive account management system that allows construction companies to perform full CRUD (Create, Read, Update, Delete) operations on their accounting structure. This feature enables complete control over account classifications, hierarchies, and financial tracking within the construction management platform.

## Features

### Full CRUD Operations
- **Create**: Add new accounts with detailed classifications and settings
- **Read**: View, search, and filter all accounts with advanced filtering capabilities
- **Update**: Edit account details, classifications, balances, and settings
- **Delete**: Remove individual accounts or perform bulk deletions with validation

### Core Functionality
- **Account Structure**: Complete chart of accounts with Asset, Liability, Equity, Income, and Expense classifications
- **Interactive Management**: Full account lifecycle management with real-time updates
- **Visual Feedback**: Color-coded account types and status indicators
- **Balance Tracking**: Real-time balance calculations and financial summaries
- **Hierarchical Support**: Parent-child account relationships for organizational structure

### Data Management
- **Account Classifications**: Support for all standard accounting account types
- **Sub-type Organization**: Detailed sub-classifications for precise accounting
- **Balance Management**: Automatic debit/credit balance tracking
- **Bulk Operations**: Select and perform operations on multiple accounts
- **Export Capabilities**: Export filtered account data to CSV
- **Advanced Filtering**: Filter by type, status, sub-type, and search terms

### User Interface
- **Responsive Design**: Works on desktop and tablet devices
- **Accessibility**: Proper contrast ratios and keyboard navigation
- **Modern UI**: Uses Shadcn/UI components for consistent design
- **Summary Cards**: Financial overview with asset and liability totals

## How to Use

### 1. Navigation
- Navigate to **Dashboard → Accounting** from the sidebar
- Select the **Chart of Accounts** tab
- Only available to Admin and Owner roles

### 2. Account Management

#### Adding Accounts
1. **Manual Entry**: Click "Add Account" button to create new accounts
   - Enter account code (e.g., "1000", "2000", "3000")
   - Specify account name and detailed description
   - Select account type (Asset, Liability, Equity, Income, Expense)
   - Choose appropriate sub-type classification
   - Set active/inactive status
   - Add relevant tags for organization
   - Link to bank accounts if applicable

#### Editing Accounts
1. Click the actions menu (⋮) next to any account
2. Select "Edit" to modify account details
3. Update account information:
   - Account code and name
   - Account type and sub-type
   - Description and status
   - Balance adjustments
   - Tag management
4. Save changes with validation

#### Deleting Accounts
1. Click the actions menu (⋮) next to any account
2. Select "Delete" to remove the account
3. Confirm deletion (warnings shown for accounts with balances)
4. System validates dependencies before deletion

#### Bulk Operations
1. Click "Bulk Actions" to open the bulk operations dialog
2. Select multiple accounts using checkboxes
3. Choose operation:
   - Update account type or sub-type
   - Change active/inactive status
   - Bulk tag management
   - Mass deletion with validation
4. Execute the operation on all selected accounts

### 3. Searching and Filtering
- **Search**: Use the search bar to find accounts by name, code, description, or tags
- **Type Filter**: Filter by Asset, Liability, Equity, Income, Expense, or All Types
- **Status Filter**: Filter by Active, Inactive, or All Status
- **Sub-type Filter**: Filter by specific sub-classifications
- **Clear Filters**: Reset all filters with the clear button

### 4. Financial Summary
- **Total Accounts**: Overview of all accounts in the system
- **Active Accounts**: Count of currently active accounts
- **Total Assets**: Sum of all asset account balances
- **Total Liabilities**: Sum of all liability account balances

### 5. Data Export
- Click the export button (download icon) to export filtered accounts to CSV
- Includes all account data: code, name, type, balance, status, and metadata

## Technical Implementation

### File Structure
```
src/app/dashboard/ai-report/
├── page.tsx                           # Main accounting page with chart of accounts tab

src/components/
├── add-edit-account-dialog.tsx        # Add/Edit account dialog
├── delete-account-dialog.tsx          # Delete confirmation dialog
└── bulk-account-operation-dialog.tsx  # Bulk operations dialog

src/lib/
└── data.ts                           # Chart of accounts data types and sample data
```

### Dependencies
- **React Hooks**: useState, useMemo for state management
- **Shadcn/UI Components**: Card, Table, Badge, Button, Dialog, Input, Select, Switch
- **Data Sources**: Chart of accounts data from `/lib/data.ts`, bank account integration
- **Toast Notifications**: User feedback system for all operations
- **Form Validation**: Client-side validation for all input fields

### Data Types
```typescript
type ChartOfAccount = {
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
```

### CRUD Operations
1. **Create**: Add new accounts with full validation and default values
2. **Read**: Display accounts with filtering, searching, and sorting capabilities
3. **Update**: Edit account fields, balances, and settings with validation
4. **Delete**: Remove accounts individually or in bulk with dependency checking

### State Management
- Local state using React useState for account data
- Filtered views using useMemo for performance optimization
- Real-time updates with immediate UI feedback
- Integration with bank account data for linking

## Account Types and Classifications

### Asset Accounts (Type: Asset)
- **Current Assets**: Cash, Accounts Receivable, Inventory, Prepaid Expenses
- **Fixed Assets**: Equipment, Vehicles, Buildings, Land
- **Other Assets**: Investments, Deposits, Intangible Assets

### Liability Accounts (Type: Liability)
- **Current Liabilities**: Accounts Payable, Accrued Expenses, Short-term Loans
- **Long-term Liabilities**: Mortgages, Equipment Loans, Bonds Payable
- **Other Liabilities**: Deferred Revenue, Warranty Reserves

### Equity Accounts (Type: Equity)
- **Owner's Equity**: Capital, Retained Earnings, Drawings
- **Partnership Equity**: Partner Capital Accounts
- **Corporate Equity**: Common Stock, Retained Earnings, Additional Paid-in Capital

### Income Accounts (Type: Income)
- **Operating Revenue**: Construction Revenue, Service Revenue, Rental Income
- **Other Income**: Interest Income, Investment Income, Miscellaneous Income

### Expense Accounts (Type: Expense)
- **Direct Costs**: Materials, Labor, Subcontractors, Equipment Rental
- **Operating Expenses**: Office Rent, Utilities, Insurance, Marketing
- **Administrative Expenses**: Professional Fees, Licenses, Travel

## Integration Features

### Bank Account Integration
- Link accounts to specific bank accounts for reconciliation
- Automatic transaction categorization based on account mappings
- Real-time balance synchronization with bank data

### Tax Classification
- **Taxable**: Accounts subject to standard tax treatment
- **Non-Taxable**: Accounts exempt from taxation
- **Tax-Only**: Special tax-related accounts

### Reporting Integration
- Chart of accounts data feeds into all financial reports
- Trial balance generation from account balances
- Balance sheet and P&L statement integration

## Security and Compliance

### Data Protection
- **Role-based Access**: Only Admin/Owner roles can modify chart of accounts
- **Audit Trail**: Complete history of all account changes and modifications
- **Data Validation**: Comprehensive validation to maintain accounting integrity

### Best Practices
- Regular backup of chart of accounts data
- Segregation of duties for account modifications
- Approval workflows for significant account changes

## Future Enhancements

### Planned Features
- **Account Hierarchies**: Multi-level parent-child account relationships
- **Custom Account Types**: User-defined account classifications
- **Advanced Reporting**: Detailed account analysis and trending
- **Automated Classifications**: AI-powered account categorization
- **Multi-Company Support**: Separate charts of accounts for different entities

### Integration Points
- **ERP Integration**: Export to QuickBooks, Xero, and other accounting platforms
- **Advanced Analytics**: Financial ratio analysis and benchmarking
- **Budget Integration**: Account-level budgeting and variance analysis
- **Project Accounting**: Account allocation to specific construction projects

## Support and Troubleshooting

### Common Issues
1. **Account Code Conflicts**: Ensure unique account codes across all accounts
2. **Balance Discrepancies**: Verify debit/credit balance calculations
3. **Deletion Restrictions**: Cannot delete accounts with transaction history
4. **Validation Errors**: Ensure all required fields are completed correctly
5. **Performance Issues**: Use filters to limit displayed accounts for large datasets

### Data Validation Rules
- **Account Code**: Must be unique and follow standard numbering conventions
- **Account Name**: Minimum 3 characters, maximum 100 characters
- **Account Type**: Must be one of the five standard types
- **Balance**: Must be a valid number (positive or negative)
- **Sub-type**: Must be appropriate for the selected account type

### Best Practices
- **Consistent Numbering**: Use standard account numbering (1000s for assets, 2000s for liabilities, etc.)
- **Clear Naming**: Use descriptive account names for easy identification
- **Regular Reviews**: Periodically review and clean up unused accounts
- **Backup Before Changes**: Export chart of accounts before major modifications
- **Documentation**: Maintain documentation of account purposes and usage

### Getting Help
- Contact support through the Dashboard → Support section
- Refer to the main User Manual for general application help
- Check the Financial Operations section for accounting best practices
- Use the export feature to share account data when requesting support

## Sample Chart of Accounts Structure

### Assets (1000-1999)
- 1000: Cash and Cash Equivalents
- 1100: Accounts Receivable
- 1200: Inventory
- 1300: Prepaid Expenses
- 1400: Equipment
- 1500: Vehicles
- 1600: Buildings
- 1700: Land

### Liabilities (2000-2999)
- 2000: Accounts Payable
- 2100: Accrued Expenses
- 2200: Short-term Loans
- 2300: Long-term Debt
- 2400: Mortgages Payable

### Equity (3000-3999)
- 3000: Owner's Capital
- 3100: Retained Earnings
- 3200: Current Year Earnings

### Income (4000-4999)
- 4000: Construction Revenue
- 4100: Service Revenue
- 4200: Rental Income
- 4300: Other Income

### Expenses (5000-9999)
- 5000: Cost of Goods Sold
- 6000: Operating Expenses
- 7000: Administrative Expenses
- 8000: Financial Expenses
- 9000: Other Expenses
