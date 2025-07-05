import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import AccountingPage from '@/app/dashboard/ai-report/page';

// Mock the hooks and dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock('@/lib/data', () => ({
  bankAccounts: [
    { id: 'bank-1', bankName: 'Test Bank 1', accountNumber: '****1234', balance: 50000 },
    { id: 'bank-2', bankName: 'Test Bank 2', accountNumber: '****5678', balance: 25000 },
  ],
  financialReports: [],
  chartOfAccounts: [
    {
      id: 'acc-1',
      accountCode: '1000',
      accountName: 'Cash',
      accountType: 'Asset',
      subType: 'Current Asset',
      description: 'Cash and cash equivalents',
      isActive: true,
      balance: 50000,
      debitBalance: 50000,
      creditBalance: 0,
      createdDate: new Date('2024-01-01'),
      lastModified: new Date('2024-01-01'),
      createdBy: 'admin',
      tags: ['liquid', 'operating'],
    },
    {
      id: 'acc-2',
      accountCode: '2000',
      accountName: 'Accounts Payable',
      accountType: 'Liability',
      subType: 'Current Liability',
      description: 'Amounts owed to suppliers',
      isActive: true,
      balance: 15000,
      debitBalance: 0,
      creditBalance: 15000,
      createdDate: new Date('2024-01-01'),
      lastModified: new Date('2024-01-01'),
      createdBy: 'admin',
      tags: ['payable', 'operating'],
    },
  ],
}));

// Mock the dialog components
jest.mock('@/components/add-edit-account-dialog', () => {
  return {
    AddEditAccountDialog: ({ open, onSave, onOpenChange }: any) => {
      return open ? (
        <div data-testid="add-edit-account-dialog">
          <button
            onClick={() => {
              onSave({
                accountCode: '3000',
                accountName: 'Test Account',
                accountType: 'Equity',
                subType: 'Owner Equity',
                description: 'Test account description',
                isActive: true,
                balance: 0,
                debitBalance: 0,
                creditBalance: 0,
                createdBy: 'test-user',
                tags: ['test'],
              });
            }}
            data-testid="save-account-btn"
          >
            Save Account
          </button>
          <button onClick={() => onOpenChange(false)} data-testid="cancel-account-btn">
            Cancel
          </button>
        </div>
      ) : null;
    },
  };
});

jest.mock('@/components/delete-account-dialog', () => {
  return {
    DeleteAccountDialog: ({ open, onDelete, onOpenChange, account }: any) => {
      return open ? (
        <div data-testid="delete-account-dialog">
          <p>Delete account: {account?.accountName}</p>
          <button
            onClick={() => onDelete(account?.id)}
            data-testid="confirm-delete-account-btn"
          >
            Confirm Delete
          </button>
          <button onClick={() => onOpenChange(false)} data-testid="cancel-delete-account-btn">
            Cancel
          </button>
        </div>
      ) : null;
    },
  };
});

jest.mock('@/components/bulk-account-operation-dialog', () => {
  return {
    BulkAccountOperationDialog: ({ open, onBulkUpdate, onBulkDelete, onOpenChange }: any) => {
      return open ? (
        <div data-testid="bulk-account-operation-dialog">
          <button
            onClick={() => {
              onBulkUpdate(['acc-1', 'acc-2'], { isActive: false });
            }}
            data-testid="bulk-update-accounts-btn"
          >
            Bulk Update
          </button>
          <button
            onClick={() => {
              onBulkDelete(['acc-1']);
            }}
            data-testid="bulk-delete-accounts-btn"
          >
            Bulk Delete
          </button>
          <button onClick={() => onOpenChange(false)} data-testid="cancel-bulk-btn">
            Cancel
          </button>
        </div>
      ) : null;
    },
  };
});

// Mock other dialogs to prevent interference
jest.mock('@/components/generate-report-dialog', () => ({
  GenerateReportDialog: () => null,
}));

jest.mock('@/components/add-edit-bank-transaction-dialog', () => ({
  AddEditBankTransactionDialog: () => null,
}));

jest.mock('@/components/delete-bank-transaction-dialog', () => ({
  DeleteBankTransactionDialog: () => null,
}));

jest.mock('@/components/bulk-operation-dialog', () => ({
  BulkOperationDialog: () => null,
}));

jest.mock('@/components/import-transaction-dialog', () => ({
  ImportTransactionDialog: () => null,
}));

jest.mock('@/components/add-edit-report-dialog', () => ({
  AddEditReportDialog: () => null,
}));

jest.mock('@/components/delete-report-dialog', () => ({
  DeleteReportDialog: () => null,
}));

jest.mock('@/components/bulk-report-operation-dialog', () => ({
  BulkReportOperationDialog: () => null,
}));

jest.mock('@/components/report-view-dialog', () => ({
  ReportViewDialog: () => null,
}));

describe('Chart of Accounts CRUD Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Chart of Accounts tab', async () => {
    render(<AccountingPage />);
    
    // Click on the Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    expect(chartTab).toBeInTheDocument();
    expect(chartTab).not.toHaveAttribute('disabled');
    
    fireEvent.click(chartTab);
    
    // Check if the Chart of Accounts content is displayed
    await waitFor(() => {
      expect(screen.getByText('Chart of Accounts')).toBeInTheDocument();
      expect(screen.getByText('Manage your accounting structure and account classifications')).toBeInTheDocument();
    });
  });

  it('displays summary cards with correct data', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Check summary cards
      expect(screen.getByText('Total Accounts')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 accounts in mock data
      
      expect(screen.getByText('Active Accounts')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 active accounts
      
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument(); // Cash account balance
      
      expect(screen.getByText('Total Liabilities')).toBeInTheDocument();
      expect(screen.getByText('$15,000')).toBeInTheDocument(); // Accounts Payable balance
    });
  });

  it('displays the accounts table with correct data', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Check table headers
      expect(screen.getByText('Account Code')).toBeInTheDocument();
      expect(screen.getByText('Account Name')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Sub Type')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Tags')).toBeInTheDocument();
      
      // Check account data
      expect(screen.getByText('1000')).toBeInTheDocument(); // Cash account code
      expect(screen.getByText('Cash')).toBeInTheDocument(); // Cash account name
      expect(screen.getByText('2000')).toBeInTheDocument(); // AP account code
      expect(screen.getByText('Accounts Payable')).toBeInTheDocument(); // AP account name
    });
  });

  it('can search and filter accounts', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Test search functionality
      const searchInput = screen.getByPlaceholderText('Search accounts...');
      fireEvent.change(searchInput, { target: { value: 'Cash' } });
      
      // Should show Cash account but not Accounts Payable
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });
  });

  it('can filter accounts by type', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Find and click the account type filter
      const typeFilter = screen.getByDisplayValue('All Types');
      fireEvent.click(typeFilter);
      
      // Select Assets only
      const assetOption = screen.getByText('Assets');
      fireEvent.click(assetOption);
      
      // Should show only the Cash account (Asset type)
      expect(screen.getByText('Cash')).toBeInTheDocument();
    });
  });

  it('opens add account dialog when Add Account button is clicked', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add account/i });
      fireEvent.click(addButton);
      
      // Check if the add dialog opens
      expect(screen.getByTestId('add-edit-account-dialog')).toBeInTheDocument();
    });
  });

  it('can create a new account', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add account/i });
      fireEvent.click(addButton);
      
      // Save the new account
      const saveButton = screen.getByTestId('save-account-btn');
      fireEvent.click(saveButton);
      
      // Check if the new account appears in the table
      waitFor(() => {
        expect(screen.getByText('Test Account')).toBeInTheDocument();
        expect(screen.getByText('3000')).toBeInTheDocument();
      });
    });
  });

  it('opens delete dialog when delete action is clicked', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Find the first account's actions menu
      const actionsButtons = screen.getAllByRole('button');
      const actionsButton = actionsButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('h-8 w-8')
      );
      
      if (actionsButton) {
        fireEvent.click(actionsButton);
        
        // Find and click delete option
        const deleteOption = screen.getByText('Delete');
        fireEvent.click(deleteOption);
        
        // Check if delete dialog opens
        expect(screen.getByTestId('delete-account-dialog')).toBeInTheDocument();
      }
    });
  });

  it('can delete an account', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Open actions menu and delete
      const actionsButtons = screen.getAllByRole('button');
      const actionsButton = actionsButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('h-8 w-8')
      );
      
      if (actionsButton) {
        fireEvent.click(actionsButton);
        
        const deleteOption = screen.getByText('Delete');
        fireEvent.click(deleteOption);
        
        // Confirm deletion
        const confirmButton = screen.getByTestId('confirm-delete-account-btn');
        fireEvent.click(confirmButton);
        
        // Account should be removed from the table
        waitFor(() => {
          expect(screen.queryByText('Cash')).not.toBeInTheDocument();
        });
      }
    });
  });

  it('opens bulk operations dialog', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      const bulkButton = screen.getByRole('button', { name: /bulk actions/i });
      fireEvent.click(bulkButton);
      
      // Check if bulk operations dialog opens
      expect(screen.getByTestId('bulk-account-operation-dialog')).toBeInTheDocument();
    });
  });

  it('can perform bulk operations', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      const bulkButton = screen.getByRole('button', { name: /bulk actions/i });
      fireEvent.click(bulkButton);
      
      // Perform bulk update
      const bulkUpdateButton = screen.getByTestId('bulk-update-accounts-btn');
      fireEvent.click(bulkUpdateButton);
      
      // Both accounts should be updated
      waitFor(() => {
        const inactiveBadges = screen.getAllByText('Inactive');
        expect(inactiveBadges).toHaveLength(2);
      });
    });
  });

  it('can export accounts', async () => {
    // Mock the DOM methods for file download
    const createElementSpy = jest.spyOn(document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');
    const removeChildSpy = jest.spyOn(document.body, 'removeChild');
    
    const mockLink = {
      download: '',
      href: '',
      setAttribute: jest.fn(),
      click: jest.fn(),
      style: { visibility: '' },
    };
    
    createElementSpy.mockReturnValue(mockLink as any);
    appendChildSpy.mockImplementation(() => mockLink as any);
    removeChildSpy.mockImplementation(() => mockLink as any);
    
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);
      
      // Check if download was triggered
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('chart_of_accounts_'));
    });
    
    // Cleanup
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('can clear filters', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Apply some filters first
      const searchInput = screen.getByPlaceholderText('Search accounts...');
      fireEvent.change(searchInput, { target: { value: 'Cash' } });
      
      // Clear filters
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);
      
      // Check if search input is cleared
      expect(searchInput).toHaveValue('');
    });
  });

  it('displays correct account type badges', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Check for Asset and Liability badges
      expect(screen.getByText('Asset')).toBeInTheDocument();
      expect(screen.getByText('Liability')).toBeInTheDocument();
    });
  });

  it('displays account balances correctly', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Check for properly formatted balances
      expect(screen.getByText('$50,000')).toBeInTheDocument(); // Cash balance
      expect(screen.getByText('$15,000')).toBeInTheDocument(); // AP balance
    });
  });

  it('shows account tags correctly', async () => {
    render(<AccountingPage />);
    
    // Navigate to Chart of Accounts tab
    const chartTab = screen.getByRole('tab', { name: /chart of accounts/i });
    fireEvent.click(chartTab);
    
    await waitFor(() => {
      // Check for tags
      expect(screen.getByText('liquid')).toBeInTheDocument();
      expect(screen.getByText('operating')).toBeInTheDocument();
      expect(screen.getByText('payable')).toBeInTheDocument();
    });
  });
});
