'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Archive, Play, Pause, FileText } from 'lucide-react';

type FinancialReport = {
  id: string;
  title: string;
  description: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'general-ledger' | 'trial-balance' | 'custom';
  status: 'draft' | 'active' | 'archived';
  isScheduled: boolean;
  createdDate: Date;
  lastGenerated?: Date;
};

type BulkReportOperationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: FinancialReport[];
  onBulkUpdate: (reportIds: string[], updates: Partial<FinancialReport>) => void;
  onBulkDelete: (reportIds: string[]) => void;
  onBulkGenerate: (reportIds: string[]) => void;
};

export function BulkReportOperationDialog({
  open,
  onOpenChange,
  reports,
  onBulkUpdate,
  onBulkDelete,
  onBulkGenerate,
}: BulkReportOperationDialogProps) {
  const { toast } = useToast();
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [operation, setOperation] = useState<'delete' | 'activate' | 'archive' | 'generate' | 'schedule' | 'unschedule'>('activate');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(new Set(reports.map(r => r.id)));
    } else {
      setSelectedReports(new Set());
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    const newSelected = new Set(selectedReports);
    if (checked) {
      newSelected.add(reportId);
    } else {
      newSelected.delete(reportId);
    }
    setSelectedReports(newSelected);
  };

  const handleExecute = () => {
    const selectedIds = Array.from(selectedReports);
    
    if (selectedIds.length === 0) {
      toast({
        title: 'No Reports Selected',
        description: 'Please select at least one report to perform bulk operations.',
        variant: 'destructive',
      });
      return;
    }

    switch (operation) {
      case 'delete':
        onBulkDelete(selectedIds);
        toast({
          title: 'Reports Deleted',
          description: `Successfully deleted ${selectedIds.length} report(s).`,
        });
        break;
      case 'activate':
        onBulkUpdate(selectedIds, { status: 'active' });
        toast({
          title: 'Reports Activated',
          description: `Successfully activated ${selectedIds.length} report(s).`,
        });
        break;
      case 'archive':
        onBulkUpdate(selectedIds, { status: 'archived' });
        toast({
          title: 'Reports Archived',
          description: `Successfully archived ${selectedIds.length} report(s).`,
        });
        break;
      case 'generate':
        onBulkGenerate(selectedIds);
        toast({
          title: 'Report Generation Started',
          description: `Generating ${selectedIds.length} report(s). This may take a few minutes.`,
        });
        break;
      case 'schedule':
        onBulkUpdate(selectedIds, { isScheduled: true });
        toast({
          title: 'Scheduling Enabled',
          description: `Successfully enabled scheduling for ${selectedIds.length} report(s).`,
        });
        break;
      case 'unschedule':
        onBulkUpdate(selectedIds, { isScheduled: false });
        toast({
          title: 'Scheduling Disabled',
          description: `Successfully disabled scheduling for ${selectedIds.length} report(s).`,
        });
        break;
    }

    setSelectedReports(new Set());
    onOpenChange(false);
  };

  const selectedCount = selectedReports.size;
  const allSelected = selectedCount === reports.length;
  const someSelected = selectedCount > 0 && selectedCount < reports.length;

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
      case 'profit-loss': return 'P&L';
      case 'balance-sheet': return 'Balance';
      case 'cash-flow': return 'Cash Flow';
      case 'general-ledger': return 'Ledger';
      case 'trial-balance': return 'Trial';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Report Operations</DialogTitle>
          <DialogDescription>
            Select reports and choose an operation to perform on multiple reports at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
              />
              <span className="text-sm">
                Select All ({selectedCount} of {reports.length} selected)
              </span>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Activate Reports
                    </div>
                  </SelectItem>
                  <SelectItem value="archive">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      Archive Reports
                    </div>
                  </SelectItem>
                  <SelectItem value="generate">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Generate Reports
                    </div>
                  </SelectItem>
                  <SelectItem value="schedule">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Enable Scheduling
                    </div>
                  </SelectItem>
                  <SelectItem value="unschedule">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4" />
                      Disable Scheduling
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete Reports
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-md flex-1 overflow-auto">
            <div className="max-h-[400px] overflow-y-auto">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedReports.has(report.id)}
                    onCheckedChange={(checked) => 
                      handleSelectReport(report.id, checked as boolean)
                    }
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{report.title}</span>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(report.type)}
                      </Badge>
                      {report.isScheduled && (
                        <Badge variant="secondary" className="text-xs">
                          Scheduled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {report.createdDate.toLocaleDateString()}</span>
                      {report.lastGenerated && (
                        <span>Last Generated: {report.lastGenerated.toLocaleDateString()}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExecute}
            variant={operation === 'delete' ? 'destructive' : 'default'}
            disabled={selectedCount === 0}
          >
            {operation === 'delete' && 'Delete'} 
            {operation === 'activate' && 'Activate'}
            {operation === 'archive' && 'Archive'}
            {operation === 'generate' && 'Generate'}
            {operation === 'schedule' && 'Enable Scheduling'}
            {operation === 'unschedule' && 'Disable Scheduling'}
            {selectedCount > 0 && ` (${selectedCount})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
