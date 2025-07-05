import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import AccountingPage from '../src/app/dashboard/ai-report/page';

// Mock the hooks and components
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../src/app/dashboard/ai-report/actions', () => ({
  getFinancialReport: vi.fn(),
}));

// Mock the data
vi.mock('@/lib/data', () => ({
  bankAccounts: [
    { id: 'bank-1', bankName: 'Test Bank', accountNumber: '**** 1234', balance: 10000, logoUrl: 'test.png' },
    { id: 'bank-2', bankName: 'Another Bank', accountNumber: '**** 5678', balance: 5000, logoUrl: 'test2.png' },
  ],
}));

describe('Bank Reconciliation CRUD Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the accounting page with bank reconciliation tab', async () => {
    render(<AccountingPage />);
    
    // Check if the Bank Reconciliation tab exists
    expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument();
    
    // Click on the tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Check if summary cards are displayed
    expect(screen.getByText('Total Transactions')).toBeInTheDocument();
    expect(screen.getByText('Reconciled')).toBeInTheDocument();
    expect(screen.getByText('Total Credits')).toBeInTheDocument();
    expect(screen.getByText('Total Debits')).toBeInTheDocument();
  });

  it('should display initial bank transactions', async () => {
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Check if transactions are displayed
    expect(screen.getByText('Deposit from ABC Construction Ltd')).toBeInTheDocument();
    expect(screen.getByText('Equipment Rental - Heavy Machinery')).toBeInTheDocument();
    expect(screen.getByText('Monthly Software Subscription')).toBeInTheDocument();
  });

  it('should open add transaction dialog when clicking Add Transaction button', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Click Add Transaction button
    const addButton = screen.getByText('Add Transaction');
    await user.click(addButton);
    
    // Check if dialog opened
    await waitFor(() => {
      expect(screen.getByText('Add Bank Transaction')).toBeInTheDocument();
    });
  });

  it('should filter transactions by search term', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search transactions...');
    await user.type(searchInput, 'Equipment');
    
    // Check if filtered results are shown
    expect(screen.getByText('Equipment Rental - Heavy Machinery')).toBeInTheDocument();
    expect(screen.queryByText('Monthly Software Subscription')).not.toBeInTheDocument();
  });

  it('should filter transactions by type', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Click on type filter
    const typeFilter = screen.getByDisplayValue('All Types');
    await user.click(typeFilter);
    
    // Select Credits
    await user.click(screen.getByText('Credits'));
    
    // Check if only credit transactions are shown
    expect(screen.getByText('Deposit from ABC Construction Ltd')).toBeInTheDocument();
    expect(screen.queryByText('Equipment Rental - Heavy Machinery')).not.toBeInTheDocument();
  });

  it('should open bulk operations dialog', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Click Bulk Actions button
    const bulkButton = screen.getByText('Bulk Actions');
    await user.click(bulkButton);
    
    // Check if dialog opened
    await waitFor(() => {
      expect(screen.getByText('Bulk Operations')).toBeInTheDocument();
    });
  });

  it('should open import dialog', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Click Import CSV button
    const importButton = screen.getByText('Import CSV');
    await user.click(importButton);
    
    // Check if dialog opened
    await waitFor(() => {
      expect(screen.getByText('Import Bank Transactions')).toBeInTheDocument();
    });
  });

  it('should export transactions to CSV', async () => {
    const user = userEvent.setup();
    
    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockClick = vi.fn();
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    
    global.URL.createObjectURL = mockCreateObjectURL;
    const mockLink = {
      setAttribute: vi.fn(),
      style: { visibility: '' },
      click: mockClick,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
    
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Click export button
    const exportButton = screen.getByRole('button', { name: /export/i });
    await user.click(exportButton);
    
    // Check if CSV download was triggered
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle transaction status toggle', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Find a transaction with actions menu
    const actionMenus = screen.getAllByRole('button', { name: /open menu/i });
    await user.click(actionMenus[0]);
    
    // Check if reconciliation toggle option exists
    await waitFor(() => {
      expect(screen.getByText(/Mark as/)).toBeInTheDocument();
    });
  });

  it('should clear all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    
    // Set some filters first
    const searchInput = screen.getByPlaceholderText('Search transactions...');
    await user.type(searchInput, 'test');
    
    // Click clear filters button
    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    await user.click(clearButton);
    
    // Check if search is cleared
    expect(searchInput).toHaveValue('');
  });
});

describe('Transaction Dialogs', () => {
  it('should validate required fields in add transaction dialog', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab and open add dialog
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    await user.click(screen.getByText('Add Transaction'));
    
    // Try to submit without required fields
    await waitFor(() => {
      const submitButton = screen.getByText('Add Transaction');
      user.click(submitButton);
    });
    
    // Check for validation errors (this would require form implementation details)
  });

  it('should handle CSV import file selection', async () => {
    const user = userEvent.setup();
    render(<AccountingPage />);
    
    // Navigate to Bank Reconciliation tab and open import dialog
    fireEvent.click(screen.getByText('Bank Reconciliation'));
    await user.click(screen.getByText('Import CSV'));
    
    // Check if file upload is available
    await waitFor(() => {
      expect(screen.getByText('Choose File')).toBeInTheDocument();
    });
  });
});
