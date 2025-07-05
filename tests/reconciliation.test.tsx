import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReconciliationPage from '@/app/dashboard/reconciliation/page';

// Mock the hooks
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('ReconciliationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the reconciliation page correctly', () => {
    render(<ReconciliationPage />);
    
    expect(screen.getByText('Bank Reconciliation')).toBeInTheDocument();
    expect(screen.getByText('Match bank transactions to your invoices and expenses.')).toBeInTheDocument();
    expect(screen.getByText('Bank Transactions')).toBeInTheDocument();
    expect(screen.getByText('System Transactions')).toBeInTheDocument();
  });

  it('displays summary cards with correct information', () => {
    render(<ReconciliationPage />);
    
    expect(screen.getByText('Total Bank Transactions')).toBeInTheDocument();
    expect(screen.getByText('System Transactions')).toBeInTheDocument();
    expect(screen.getByText('Reconciliation Progress')).toBeInTheDocument();
  });

  it('shows bank transactions in the table', () => {
    render(<ReconciliationPage />);
    
    // Check if bank transaction data is displayed
    expect(screen.getByText('Deposit from ABC Construction Ltd')).toBeInTheDocument();
    expect(screen.getByText('Equipment Rental - Heavy Machinery')).toBeInTheDocument();
  });

  it('allows bank transaction selection', () => {
    render(<ReconciliationPage />);
    
    // Find and click a bank transaction
    const bankTransaction = screen.getByText('Deposit from ABC Construction Ltd');
    fireEvent.click(bankTransaction);
    
    // Check if the description changes to show selection
    expect(screen.getByText(/Select a match for/)).toBeInTheDocument();
  });

  it('displays system transactions from invoices and expenses', () => {
    render(<ReconciliationPage />);
    
    // Should show system transactions in the right panel
    const systemTransactionsTable = screen.getByText('System Transactions').closest('.card');
    expect(systemTransactionsTable).toBeInTheDocument();
  });

  it('shows import statement button', () => {
    render(<ReconciliationPage />);
    
    const importButton = screen.getByText('Import Statement');
    expect(importButton).toBeInTheDocument();
  });

  it('handles bank transaction selection and deselection', () => {
    render(<ReconciliationPage />);
    
    const bankTransaction = screen.getByText('Deposit from ABC Construction Ltd');
    
    // Select transaction
    fireEvent.click(bankTransaction);
    expect(screen.getByText(/Select a match for/)).toBeInTheDocument();
    
    // Deselect by clicking again
    fireEvent.click(bankTransaction);
    expect(screen.getByText('Select a bank transaction to start matching.')).toBeInTheDocument();
  });

  it('displays reconciliation progress as 0% initially', () => {
    render(<ReconciliationPage />);
    
    // Should show 0% progress initially since no matches are set
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
