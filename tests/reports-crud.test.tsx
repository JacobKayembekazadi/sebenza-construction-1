/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from '@/components/ui/toaster';
import AccountingPage from '@/app/dashboard/ai-report/page';

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock the server action
jest.mock('@/app/dashboard/ai-report/actions', () => ({
  getFinancialReport: jest.fn().mockResolvedValue({
    success: true,
    data: 'Mock report data',
    message: 'Report generated successfully'
  }),
}));

const AccountingPageWithToaster = () => (
  <>
    <AccountingPage />
    <Toaster />
  </>
);

describe('Reports CRUD Functionality', () => {
  beforeEach(() => {
    // Clear any existing toasts
    jest.clearAllMocks();
  });

  describe('Reports Tab Navigation', () => {
    it('should display the reports tab and allow navigation', async () => {
      render(<AccountingPageWithToaster />);
      
      // Find and click the Reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      expect(reportsTab).toBeInTheDocument();
      
      fireEvent.click(reportsTab);
      
      // Verify reports content is displayed
      await waitFor(() => {
        expect(screen.getByText('Financial Reports')).toBeInTheDocument();
        expect(screen.getByText('Create, manage, and schedule your financial reports')).toBeInTheDocument();
      });
    });
  });

  describe('Reports Summary Cards', () => {
    it('should display summary cards with correct metrics', async () => {
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(() => {
        // Check for summary cards
        expect(screen.getByText('Total Reports')).toBeInTheDocument();
        expect(screen.getByText('Active Reports')).toBeInTheDocument();
        expect(screen.getByText('Scheduled Reports')).toBeInTheDocument();
        expect(screen.getByText('Draft Reports')).toBeInTheDocument();
        
        // Verify we have sample data (should show numbers > 0)
        const totalReportsCard = screen.getByText('Total Reports').closest('.card');
        expect(totalReportsCard).toHaveTextContent('5'); // Based on sample data
      });
    });
  });

  describe('Reports Table Display', () => {
    it('should display reports table with sample data', async () => {
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Schedule')).toBeInTheDocument();
        expect(screen.getByText('Last Generated')).toBeInTheDocument();
        expect(screen.getByText('Created By')).toBeInTheDocument();
        
        // Check for sample report titles
        expect(screen.getByText('Monthly Profit & Loss Report')).toBeInTheDocument();
        expect(screen.getByText('Balance Sheet - Q2 2024')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should filter reports based on search term', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find search input
        const searchInput = screen.getByPlaceholderText('Search reports...');
        expect(searchInput).toBeInTheDocument();
        
        // Type in search term
        await user.type(searchInput, 'Profit');
        
        // Verify filtering works
        expect(screen.getByText('Monthly Profit & Loss Report')).toBeInTheDocument();
        // Balance Sheet should be filtered out
        expect(screen.queryByText('Balance Sheet - Q2 2024')).not.toBeInTheDocument();
      });
    });

    it('should filter reports by type', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find type filter dropdown
        const typeFilter = screen.getAllByRole('combobox')[0]; // First combobox is type filter
        await user.click(typeFilter);
        
        // Select profit-loss type
        const profitLossOption = screen.getByText('Profit & Loss');
        await user.click(profitLossOption);
        
        // Verify filtering works
        expect(screen.getByText('Monthly Profit & Loss Report')).toBeInTheDocument();
      });
    });

    it('should clear all filters', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Add a search term
        const searchInput = screen.getByPlaceholderText('Search reports...');
        await user.type(searchInput, 'test');
        
        // Find and click clear filters button
        const clearButton = screen.getAllByRole('button').find(btn => 
          btn.querySelector('svg') && btn.getAttribute('class')?.includes('h-4 w-4')
        );
        if (clearButton) {
          await user.click(clearButton);
        }
        
        // Verify search is cleared
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Create Report Dialog', () => {
    it('should open create report dialog', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find and click Create Report button
        const createButton = screen.getByRole('button', { name: /create report/i });
        await user.click(createButton);
        
        // Verify dialog opens
        expect(screen.getByText('Create Financial Report')).toBeInTheDocument();
        expect(screen.getByLabelText(/report title/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields in create dialog', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab and open create dialog
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        const createButton = screen.getByRole('button', { name: /create report/i });
        await user.click(createButton);
        
        // Try to save without filling required fields
        const saveButton = screen.getByRole('button', { name: /create report/i });
        await user.click(saveButton);
        
        // Should show validation errors
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Report Actions', () => {
    it('should open edit dialog for existing report', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find first report's action menu
        const actionButtons = screen.getAllByRole('button').filter(btn => 
          btn.getAttribute('aria-label') === 'Open menu' || 
          btn.textContent === 'Open menu'
        );
        
        if (actionButtons.length > 0) {
          await user.click(actionButtons[0]);
          
          // Click edit option
          const editOption = screen.getByText('Edit');
          await user.click(editOption);
          
          // Verify edit dialog opens with pre-filled data
          expect(screen.getByText('Edit Financial Report')).toBeInTheDocument();
        }
      });
    });

    it('should open delete confirmation dialog', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find first report's action menu
        const actionButtons = screen.getAllByRole('button').filter(btn => 
          btn.getAttribute('aria-label') === 'Open menu' || 
          btn.textContent === 'Open menu'
        );
        
        if (actionButtons.length > 0) {
          await user.click(actionButtons[0]);
          
          // Click delete option
          const deleteOption = screen.getByText('Delete');
          await user.click(deleteOption);
          
          // Verify delete dialog opens
          expect(screen.getByText('Delete Financial Report')).toBeInTheDocument();
          expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
        }
      });
    });

    it('should open view details dialog', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find first report's action menu
        const actionButtons = screen.getAllByRole('button').filter(btn => 
          btn.getAttribute('aria-label') === 'Open menu' || 
          btn.textContent === 'Open menu'
        );
        
        if (actionButtons.length > 0) {
          await user.click(actionButtons[0]);
          
          // Click view details option
          const viewOption = screen.getByText('View Details');
          await user.click(viewOption);
          
          // Verify view dialog opens
          expect(screen.getByText('Report Details')).toBeInTheDocument();
        }
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should open bulk operations dialog', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find and click Bulk Actions button
        const bulkButton = screen.getByRole('button', { name: /bulk actions/i });
        await user.click(bulkButton);
        
        // Verify bulk dialog opens
        expect(screen.getByText('Bulk Report Operations')).toBeInTheDocument();
        expect(screen.getByText(/select reports to perform bulk operations/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should trigger export when export button is clicked', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find export button (download icon)
        const exportButtons = screen.getAllByRole('button').filter(btn => 
          btn.querySelector('svg') && btn.innerHTML.includes('Download')
        );
        
        if (exportButtons.length > 0) {
          await user.click(exportButtons[0]);
          
          // Should show success toast (would need to mock the actual download)
          await waitFor(() => {
            expect(screen.getByText('Export Successful')).toBeInTheDocument();
          });
        }
      });
    });
  });

  describe('Quick Report Generation', () => {
    it('should display quick report generation cards', async () => {
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(() => {
        // Check for quick report section
        expect(screen.getByText('Quick Report Generation')).toBeInTheDocument();
        expect(screen.getByText('Generate common financial reports instantly')).toBeInTheDocument();
        
        // Check for report type cards
        expect(screen.getByText('Profit & Loss')).toBeInTheDocument();
        expect(screen.getByText('Balance Sheet')).toBeInTheDocument();
      });
    });

    it('should trigger report generation for enabled reports', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Find enabled generate buttons
        const generateButtons = screen.getAllByRole('button', { name: /generate/i })
          .filter(btn => !btn.hasAttribute('disabled'));
        
        if (generateButtons.length > 0) {
          await user.click(generateButtons[0]);
          
          // Should open the generate report dialog
          expect(screen.getByText('Generate Financial Report')).toBeInTheDocument();
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(() => {
        // Should still render main components
        expect(screen.getByText('Financial Reports')).toBeInTheDocument();
        expect(screen.getByText('Total Reports')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(() => {
        // Check for proper table structure
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader')).toHaveLength(7);
        expect(screen.getAllByRole('row')).toHaveLength(6); // Header + 5 data rows
        
        // Check for button accessibility
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveAttribute('type');
        });
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<AccountingPageWithToaster />);
      
      // Navigate to reports tab
      const reportsTab = screen.getByRole('tab', { name: /reports/i });
      fireEvent.click(reportsTab);
      
      await waitFor(async () => {
        // Tab to create button and press Enter
        const createButton = screen.getByRole('button', { name: /create report/i });
        createButton.focus();
        await user.keyboard('{Enter}');
        
        // Dialog should open
        expect(screen.getByText('Create Financial Report')).toBeInTheDocument();
        
        // Can close with Escape
        await user.keyboard('{Escape}');
        expect(screen.queryByText('Create Financial Report')).not.toBeInTheDocument();
      });
    });
  });
});
