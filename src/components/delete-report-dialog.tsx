'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type FinancialReport = {
  id: string;
  title: string;
  description: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'general-ledger' | 'trial-balance' | 'custom';
  status: 'draft' | 'active' | 'archived';
  isScheduled: boolean;
  lastGenerated?: Date;
  createdDate: Date;
};

type DeleteReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: FinancialReport | null;
  onDelete: (reportId: string) => void;
};

export function DeleteReportDialog({
  open,
  onOpenChange,
  report,
  onDelete,
}: DeleteReportDialogProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    if (report) {
      onDelete(report.id);
      toast({
        title: 'Report Deleted',
        description: 'The financial report has been successfully deleted.',
      });
    }
    onOpenChange(false);
  };

  if (!report) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'profit-loss': return 'Profit & Loss';
      case 'balance-sheet': return 'Balance Sheet';
      case 'cash-flow': return 'Cash Flow';
      case 'general-ledger': return 'General Ledger';
      case 'trial-balance': return 'Trial Balance';
      case 'custom': return 'Custom Report';
      default: return type;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Financial Report</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>Are you sure you want to delete this financial report? This action cannot be undone.</p>
            
            <div className="bg-muted p-4 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{report.title}</h4>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                  {report.isScheduled && (
                    <Badge variant="outline">Scheduled</Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{report.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {getTypeLabel(report.type)}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {report.createdDate.toLocaleDateString()}
                </div>
                {report.lastGenerated && (
                  <div className="col-span-2">
                    <span className="font-medium">Last Generated:</span> {report.lastGenerated.toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {report.status === 'active' && (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-md">
                <p className="text-sm text-orange-800">
                  ⚠️ <strong>Warning:</strong> This is an active report. Deleting it will stop any scheduled generation and remove all associated data.
                </p>
              </div>
            )}

            {report.isScheduled && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  📅 <strong>Scheduled Report:</strong> This report has automatic generation enabled. Deleting it will cancel all future scheduled runs.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Report
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
