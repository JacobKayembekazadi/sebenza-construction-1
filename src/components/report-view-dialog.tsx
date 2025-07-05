'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, FileText, Calendar, Settings, Tag, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

type FinancialReport = {
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

type ReportViewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: FinancialReport | null;
  onGenerate: (reportId: string) => void;
  onDownload: (reportId: string, format: string) => void;
};

// Mock data for report preview
const mockReportData = {
  summary: {
    totalRevenue: 125000,
    totalExpenses: 89500,
    netIncome: 35500,
    grossMargin: 28.4,
  },
  categories: [
    { name: 'Construction Revenue', amount: 98000, percentage: 78.4 },
    { name: 'Equipment Rental', amount: 27000, percentage: 21.6 },
    { name: 'Materials', amount: -45000, percentage: 50.3 },
    { name: 'Labor', amount: -32000, percentage: 35.8 },
    { name: 'Equipment', amount: -12500, percentage: 14.0 },
  ],
  monthlyTrends: [
    { month: 'Jan', revenue: 35000, expenses: 28000 },
    { month: 'Feb', revenue: 42000, expenses: 31000 },
    { month: 'Mar', revenue: 48000, expenses: 30500 },
  ],
};

export function ReportViewDialog({
  open,
  onOpenChange,
  report,
  onGenerate,
  onDownload,
}: ReportViewDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  if (!report) return null;

  const handleGenerate = () => {
    onGenerate(report.id);
    toast({
      title: 'Report Generation Started',
      description: 'Your report is being generated. This may take a few minutes.',
    });
  };

  const handleDownload = (format: string) => {
    onDownload(report.id, format);
    toast({
      title: 'Download Started',
      description: `Your ${format.toUpperCase()} report is being prepared for download.`,
    });
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {report.title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {getTypeLabel(report.type)} • {report.description}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(report.status)}>
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </Badge>
              {report.isScheduled && (
                <Badge variant="secondary">
                  <Calendar className="mr-1 h-3 w-3" />
                  {report.scheduleFrequency}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="preview">Data Preview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Type:</span>
                      <p>{getTypeLabel(report.type)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Status:</span>
                      <p>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Created:</span>
                      <p>{format(report.createdDate, 'PPP')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Created By:</span>
                      <p>{report.createdBy}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Date Range:</span>
                      <p>{format(report.dateRange.startDate, 'MMM d')} - {format(report.dateRange.endDate, 'MMM d, yyyy')}</p>
                    </div>
                    {report.lastGenerated && (
                      <div>
                        <span className="font-medium text-muted-foreground">Last Generated:</span>
                        <p>{format(report.lastGenerated, 'PPP')}</p>
                      </div>
                    )}
                  </div>

                  {report.tags.length > 0 && (
                    <div>
                      <span className="font-medium text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="mr-1 h-3 w-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Report Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Include Sub-accounts:</span>
                      <span className={report.parameters.includeSubaccounts ? 'text-green-600' : 'text-gray-500'}>
                        {report.parameters.includeSubaccounts ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Show Comparisons:</span>
                      <span className={report.parameters.showComparisons ? 'text-green-600' : 'text-gray-500'}>
                        {report.parameters.showComparisons ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Group by Category:</span>
                      <span className={report.parameters.groupByCategory ? 'text-green-600' : 'text-gray-500'}>
                        {report.parameters.groupByCategory ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Include Charts:</span>
                      <span className={report.parameters.includeCharts ? 'text-green-600' : 'text-gray-500'}>
                        {report.parameters.includeCharts ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output Format:</span>
                      <span className="font-medium">{report.parameters.format.toUpperCase()}</span>
                    </div>
                    {report.filters.minimumAmount && (
                      <div className="flex justify-between">
                        <span>Minimum Amount:</span>
                        <span className="font-medium">${report.filters.minimumAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4 overflow-auto">
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${mockReportData.summary.totalRevenue.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Total Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      ${mockReportData.summary.totalExpenses.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Net Income</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      ${mockReportData.summary.netIncome.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Gross Margin</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {mockReportData.summary.grossMargin}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>Revenue and expense breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockReportData.categories.map((category, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className={`text-right font-medium ${category.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {category.amount > 0 ? '+' : ''}${Math.abs(category.amount).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{category.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4 overflow-auto">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduling Configuration</CardTitle>
                  <CardDescription>
                    {report.isScheduled 
                      ? `This report is scheduled to run ${report.scheduleFrequency}` 
                      : 'This report is not scheduled for automatic generation'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Automatic Generation:</span>
                      <Badge variant={report.isScheduled ? "default" : "secondary"}>
                        {report.isScheduled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {report.isScheduled && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Frequency:</span>
                        <span className="capitalize">{report.scheduleFrequency}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Settings</CardTitle>
                  <CardDescription>Configure how this report is generated and exported</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Default Format:</span>
                      <span className="font-medium">{report.parameters.format.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Include Charts:</span>
                      <span>{report.parameters.includeCharts ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Show Comparisons:</span>
                      <span>{report.parameters.showComparisons ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4 overflow-auto">
            <Card>
              <CardHeader>
                <CardTitle>Generation History</CardTitle>
                <CardDescription>Recent report generation activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.lastGenerated ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Last Generated</p>
                          <p className="text-sm text-muted-foreground">
                            {format(report.lastGenerated, 'PPP p')}
                          </p>
                        </div>
                        <Badge variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          Success
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>This report has not been generated yet.</p>
                      <p className="text-sm">Click "Generate Now" to create the first version.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center gap-2 w-full">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleDownload('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => handleDownload('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleDownload('csv')}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleGenerate}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Now
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
